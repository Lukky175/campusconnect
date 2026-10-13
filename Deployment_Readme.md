# CampusConnect --- Dockerization, CI/CD, and EC2 Deployment

This document describes the containerization and deployment workflow
used to deploy **CampusConnect** to AWS EC2. It covers Docker images,
Docker Hub, GitHub Actions CI, runtime environment variables, EC2 setup,
Docker Compose, GoDaddy DNS, Nginx reverse proxying, and HTTPS with
Let's Encrypt Certbot.

> **Security warning:** Never commit credentials, access tokens,
> database passwords, or production secrets to GitHub or this README.
> Credentials pasted into chat or terminal history should be considered
> exposed: revoke/rotate the Docker Hub PAT, MongoDB database password,
> and JWT secret before treating this deployment as production-ready.
> Values below are placeholders.

## 1. Deployment architecture


Developer
   |
   | git push to main
   v
GitHub repository
   |
   v
GitHub Actions CI
   |-- Build backend Docker image
   |-- Build frontend Docker image
   |-- Tag both images with the full Git commit SHA
   |-- Push both images to Docker Hub
   v
Docker Hub
   |-- lukky175/campusconnect-backend:<GITHUB_SHA>
   |-- lukky175/campusconnect-frontend:<GITHUB_SHA>
   |
   | EC2 pulls the selected SHA-tagged images
   v
AWS EC2
   |-- Host Nginx listens on ports 80 and 443
   |-- Host Nginx terminates HTTPS and proxies to 127.0.0.1:8080
   |-- Frontend container serves the React/Vite build
   |-- Frontend-container Nginx serves React and proxies /api to backend:5000
   |-- Flask/Gunicorn backend connects to MongoDB Atlas
   v
MongoDB Atlas


Public application URL: `https://campusconect.online`

The domain is spelled **campusconect.online** (one "n" in "conect"),
matching the purchased domain.

### Why there are two Nginx layers

-   **Host Nginx on EC2:** handles public HTTP/HTTPS traffic and the
    Let's Encrypt certificate.
-   **Nginx inside the frontend container:** serves the React
    single-page application and forwards `/api/` requests to the Compose
    service named `backend`.

This arrangement allows the browser to call the relative API path
`/api`, without embedding an EC2 IP address into the frontend build.

## 2. Repository files

Relevant files in the Git repository:


CampusConnect/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── .env.example        # optional template; no real secrets
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── .env.local          # local development only; do not commit
│   └── ...
├── docker-compose.yml      # production image-based Compose file
└── .gitignore


The EC2 deployment directory is separate from the application source
checkout and contains runtime configuration:


/home/ubuntu/campusconnect/
├── docker-compose.yml
├── .env                   # Compose image settings: username and image tag
└── backend/
    └── .env               # backend runtime configuration and secrets


There are **two different `.env` files on EC2**:

1.  `/home/ubuntu/campusconnect/.env` is read by Docker Compose and
    selects the Docker Hub username and image tag.
2.  `/home/ubuntu/campusconnect/backend/.env` is injected into the
    backend container and contains Flask, MongoDB, CORS, and JWT
    settings.

Keep both private.

## 3. Backend Dockerfile

`backend/Dockerfile`:

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "run:app"]


`backend/.dockerignore`:

.env
__pycache__/
*.pyc
*.pyo
*.pyd
.git/
.gitignore


The `.env` file must not be copied into the image. It is supplied at
runtime by Docker Compose.

## 4. Frontend Dockerfile

`frontend/Dockerfile`:


FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


This is a multi-stage build: Node builds the Vite frontend, and Nginx
serves the compiled static files. Vite variables are embedded at **build
time**, not read dynamically by the browser after the container starts.
Using `/api` means the frontend uses the same origin as the site and
does not need an EC2-specific IP.

`frontend/.dockerignore`:

node_modules/
dist/
.git/
.gitignore
.env
.env.*
npm-debug.log*


For local Vite development, a local-only `frontend/.env.local` can
contain:


VITE_API_BASE_URL=http://localhost:5000/api


Do not use this localhost URL for the production Docker build.

## 5. Frontend Nginx configuration

`frontend/nginx.conf`:

server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # React single-page application routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to the backend Compose service
    location /api/ {
        proxy_pass http://backend:5000/api/;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


Compose creates a private network for the services. The frontend Nginx
can reach the backend at `backend:5000` using the Compose service name.
The backend does not need a public host port.

## 6. Docker Compose on EC2

The production `docker-compose.yml` uses prebuilt images; EC2 does not
build images.


services:
  backend:
    image: ${DOCKERHUB_USERNAME}/campusconnect-backend:${IMAGE_TAG}
    container_name: campusconnect-backend
    env_file:
      - ./backend/.env
    expose:
      - "5000"
    restart: unless-stopped

  frontend:
    image: ${DOCKERHUB_USERNAME}/campusconnect-frontend:${IMAGE_TAG}
    container_name: campusconnect-frontend
    depends_on:
      - backend
    ports:
      - "127.0.0.1:8080:80"
    restart: unless-stopped


The `127.0.0.1:8080:80` binding is recommended after host Nginx is set
up: it lets host Nginx reach the frontend while preventing direct
external access to port 8080. If the deployment currently uses
`"8080:80"`, switch to the loopback binding and remove inbound port 8080
from the EC2 security group once HTTPS has been verified.

## 7. GitHub Actions CI pipeline

Workflow file: `.github/workflows/ci.yml`

The CI workflow runs on pushes to `main` and pull requests targeting
`main`. It builds backend and frontend images and tags them with the
full `GITHUB_SHA`. It pushes images only on pushes to `main`.


name: CampusConnect CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  build:
    name: Build Docker images
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set image tag
        id: image
        run: echo "tag=${GITHUB_SHA}" >> "$GITHUB_OUTPUT"

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub (main branch pushes only)
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build backend image
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
          tags: lukky175/campusconnect-backend:${{ steps.image.outputs.tag }}

      - name: Build frontend image
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
          build-args: |
            VITE_API_BASE_URL=/api
          tags: lukky175/campusconnect-frontend:${{ steps.image.outputs.tag }}


Under GitHub repository **Settings → Secrets and variables → Actions**,
configure:

-   `DOCKERHUB_USERNAME` --- `lukky175`
-   `DOCKERHUB_TOKEN` --- Docker Hub access token with permission to
    push to both repositories

Use an Actions **secret**, not a plain Actions variable, for the PAT.
After a successful run, Docker Hub contains:


lukky175/campusconnect-backend:<full-GITHUB_SHA>
lukky175/campusconnect-frontend:<full-GITHUB_SHA>


## 8. Create and configure EC2

The original SSH command used was:


ssh -i "Keypair-aws.pem" ubuntu@ec2-13-232-107-214.ap-south-1.compute.amazonaws.com


The EC2 public hostname/IP can change after stopping and starting an
instance when no Elastic IP is assigned. Obtain the current public IPv4
address/hostname from the EC2 console before connecting.

Update Ubuntu and install Docker:


sudo apt update
sudo apt upgrade -y

sudo apt install -y docker.io

sudo systemctl enable docker
sudo systemctl start docker

docker --version
sudo systemctl status docker


Allow the `ubuntu` user to access Docker:


sudo usermod -aG docker "$USER"


Log out and reconnect for the group change to take effect. Then check
`docker ps`.

Install Compose v2 and verify:


sudo apt install -y docker-compose-v2
docker compose version


## 9. Prepare the deployment directory and environment

Create the directory:


mkdir -p ~/campusconnect/backend
cd ~/campusconnect


Create `~/campusconnect/.env`:


DOCKERHUB_USERNAME=lukky175
IMAGE_TAG=REPLACE_WITH_FULL_GITHUB_SHA


This file selects the images to run. Replace the placeholder with a
commit SHA for which both Docker Hub images have been published.

Create `~/campusconnect/backend/.env` with actual runtime settings.
Example template:


FLASK_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<DB_USER>:<URL_ENCODED_DB_PASSWORD>@<ATLAS_CLUSTER>/<DATABASE_OPTIONS>
MONGO_DB_NAME=campus_connect
CORS_ORIGINS=https://campusconect.online,https://www.campusconect.online
JWT_SECRET_KEY=<LONG_RANDOM_PRODUCTION_SECRET>


Important:

-   Replace all placeholders.
-   Use a strong, unique production JWT secret. Generate one with
    `openssl rand -hex 32`.
-   URL-encode special characters in MongoDB credentials as required by
    MongoDB connection-string rules.
-   Configure MongoDB Atlas Network Access to allow connections from
    EC2. Avoid opening Atlas to `0.0.0.0/0` permanently.
-   Set `FLASK_ENV=production`, not `development`.
-   Restrict file permissions:


chmod 600 ~/campusconnect/.env
chmod 600 ~/campusconnect/backend/.env


## 10. Pull and start the containers

Log in to Docker Hub on EC2 if repositories are private:


docker login -u lukky175


Use the Docker Hub PAT interactively when prompted. If both repositories
are public, a login is not required for pulls.

Deploy the selected SHA:


cd ~/campusconnect

docker compose config
docker compose pull
docker compose up -d
docker ps


Inspect logs:

docker logs --tail 100 campusconnect-backend
docker logs --tail 100 campusconnect-frontend


Before host Nginx/HTTPS setup, the initial frontend mapping was
`8080:80`, and the site was tested at `http://<EC2_PUBLIC_IP>:8080`.

## 11. GoDaddy DNS setup

Configure these DNS records for `campusconect.online`:

  Type    Name    Value
  ------- ------- ---------------------------------
  A       `@`     Current EC2 public IPv4 address
  CNAME   `www`   `campusconect.online`

The root domain uses an **A record** because it points to an IP address.
Do not create a CNAME from `@` to an IP.

Check resolution:


getent hosts campusconect.online
getent hosts www.campusconect.online


The returned IPv4 address should match the current EC2 public IP.

## 12. Host Nginx reverse proxy

Install Nginx on EC2:


sudo apt update
sudo apt install -y nginx

sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx


Remove the default site if it conflicts:


sudo rm -f /etc/nginx/sites-enabled/default


Create `/etc/nginx/sites-available/campusconect.online`:


server {
    listen 80;
    listen [::]:80;

    server_name campusconect.online www.campusconect.online;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


Enable the site and validate:


sudo ln -s /etc/nginx/sites-available/campusconect.online \
  /etc/nginx/sites-enabled/campusconect.online

sudo nginx -t
sudo systemctl reload nginx


Test HTTP:


curl -I http://127.0.0.1:8080
curl -I http://campusconect.online


## 13. AWS Security Group

Configure inbound rules:

  ------------------------------------------------------------------------
  Type                              Port Source           Purpose
  ---------------- --------------------- ---------------- ----------------
  SSH                                 22 Your current     Administration
                                         public IP        

  HTTP                                80 `0.0.0.0/0`      Let's Encrypt
                                                          validation and
                                                          redirect

  HTTPS                              443 `0.0.0.0/0`      Public encrypted
                                                          website

  Custom TCP                        8080 Preferably your  Temporary direct
  (temporary only)                       IP only          testing
  ------------------------------------------------------------------------

Do not expose backend port 5000 publicly. After host Nginx and HTTPS
work, bind the frontend port to `127.0.0.1:8080:80` and remove inbound
port 8080.

## 14. Obtain SSL with Certbot

Before requesting a certificate, ensure DNS points to this instance,
Nginx is running, and inbound port 80 is open.

Install Certbot:


sudo apt update
sudo apt install -y certbot python3-certbot-nginx

certbot --version


Request certificates for both hostnames:


sudo certbot --nginx \
  -d campusconect.online \
  -d www.campusconect.online


Follow the prompts and select HTTP-to-HTTPS redirect if offered. Then
validate and reload:


sudo nginx -t
sudo systemctl reload nginx
sudo certbot certificates


Check listeners:


sudo ss -tulpn | grep -E ':80|:443|:8080'


Test the website and API:


curl -I https://campusconect.online
curl -I https://www.campusconect.online
curl https://campusconect.online/api/health


### Certificate renewal

Check the automatic renewal timer and test renewal:


sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run


Keep ports 80 and 443 reachable and ensure DNS points to the current
instance during validation.

## 15. Deploying a new version

When code is pushed to `main`, CI builds and pushes images tagged with
the full Git SHA. To deploy a specific successful commit on EC2:

1.  Copy the full SHA from GitHub Actions or the commit page.
2.  Update `IMAGE_TAG` in `~/campusconnect/.env`.
3.  Pull and restart Compose.


cd ~/campusconnect
nano .env


Set:


DOCKERHUB_USERNAME=lukky175
IMAGE_TAG=<FULL_GITHUB_SHA>


Then:


docker compose pull
docker compose up -d
docker ps
docker logs --tail 100 campusconnect-backend
docker logs --tail 100 campusconnect-frontend


## 16. Rollback

Find a previous working SHA and set `IMAGE_TAG` in
`~/campusconnect/.env` to that SHA. Then:


cd ~/campusconnect
docker compose pull
docker compose up -d
docker ps


Roll back frontend and backend together unless you know the versions are
compatible.

## 17. Stop/start EC2 without an Elastic IP

Without an Elastic IP, the public IPv4 address can change after stopping
and starting the instance.

After starting it again:

1.  Find the new public IPv4 address in the EC2 console.
2.  Update GoDaddy's `A` record for `@`.
3.  Wait for DNS propagation and verify resolution.
4.  Confirm Security Group ports 80 and 443 are open.
5.  Check Nginx and Docker.

The EBS root disk normally persists, so files and certificates remain on
the same instance. A certificate is tied to the hostname, not the IP; an
IP change does not itself require a new certificate. However, DNS must
point to the current IP for visitors and future HTTP-based certificate
renewal.


sudo systemctl status nginx
docker ps


This workflow does not automatically update GoDaddy DNS when the public
IP changes.

## 18. Troubleshooting

### Website works on 8080 but the domain refuses connection


sudo systemctl status nginx --no-pager
sudo nginx -t
sudo ss -tulpn | grep -E ':80|:443|:8080'


Verify Security Group ports 80 and 443. Port 443 will not accept
connections until Certbot configures HTTPS and Nginx listens there.

### Domain points to an old IP

Compare the EC2 public IP with the GoDaddy A record and update the
record if needed.

### Certbot validation fails


getent hosts campusconect.online
curl -I http://campusconect.online
sudo nginx -t
sudo systemctl status nginx --no-pager


Review `/var/log/letsencrypt/letsencrypt.log`.

### Frontend loads but API calls fail


curl https://campusconect.online/api/health
docker logs --tail 100 campusconnect-backend
docker logs --tail 100 campusconnect-frontend


Confirm the production frontend was built with `VITE_API_BASE_URL=/api`,
the frontend Nginx `/api/` proxy is configured, and backend environment
variables are valid.

### Container does not start


docker ps -a
docker compose config
docker compose logs --tail 100 backend
docker compose logs --tail 100 frontend


### MongoDB connection fails

Check `MONGO_URI`, URL-encoding of credentials, MongoDB Atlas Network
Access, and database-user permissions. Never publish the actual URI in
logs, issues, or screenshots.

## 19. Security checklist

-   [ ] Rotate credentials or tokens exposed during setup.
-   [ ] Store Docker Hub PAT in GitHub Actions secrets.
-   [ ] Keep EC2 `.env` files out of Git.
-   [ ] Use a strong production `JWT_SECRET_KEY`.
-   [ ] Set `FLASK_ENV=production`.
-   [ ] Keep backend port 5000 private to the Docker network.
-   [ ] Bind the frontend host port to `127.0.0.1:8080` after verifying
    host Nginx.
-   [ ] Remove public inbound port 8080 after HTTPS works.
-   [ ] Restrict SSH to your IP where practical.
-   [ ] Keep only required ports 22, 80, and 443 open.
-   [ ] Restrict MongoDB Atlas network access.
-   [ ] Test Certbot renewal with `sudo certbot renew --dry-run`.
-   [ ] Deploy by immutable Git SHA tags and retain a known-good SHA for
    rollback.

## 20. Quick command reference


# Connect to EC2 (replace hostname if the public address changes)
ssh -i "Keypair-aws.pem" ubuntu@<CURRENT_EC2_PUBLIC_HOSTNAME>

# Container status and logs
docker ps
docker compose ps
docker compose logs --tail 100
docker logs --tail 100 campusconnect-backend
docker logs --tail 100 campusconnect-frontend

# Deploy selected SHA-tagged images
cd ~/campusconnect
docker compose pull
docker compose up -d

# Nginx checks
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo systemctl reload nginx
sudo ss -tulpn | grep -E ':80|:443|:8080'

# SSL checks
sudo certbot certificates
sudo certbot renew --dry-run

# Application checks
curl -I https://campusconect.online
curl https://campusconect.online/api/health


------------------------------------------------------------------------

**Deployment summary:** GitHub Actions builds and publishes SHA-tagged
Docker images to Docker Hub. EC2 pulls the selected images using Docker
Compose. Host Nginx handles public HTTP/HTTPS and Certbot-managed TLS,
while the frontend container serves React and proxies `/api` requests to
Flask. GoDaddy DNS points the domain to the current EC2 public IP;
without an Elastic IP, update the A record whenever that public IP
changes.

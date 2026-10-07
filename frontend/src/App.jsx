import { Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/public/homepage/Homepage";
import EventsPage from "./pages/public/eventspage/Eventspage";
import EventDetailsPage from "./pages/public/eventspage/EventPage";
import SimpleContentPage from "./pages/public/SimpleContentPage";
import NotFoundPage from "./pages/public/NotFoundPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardEventsPage from "./pages/dashboard/DashboardEventsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";

import ProtectedRoute from "./routes/ProtectedRoute";

import DashboardRegistrationsPage from "./pages/dashboard/DashboardRegistrationsPage";
import DashboardSettingsPage from "./pages/dashboard/DashboardSettingsPage";

import UsersPage from "./pages/dashboard/admin/UsersPage";
import RolePermissionsPage from "./pages/dashboard/admin/RolePermissionsPage";
import ManageEventsPage from "./pages/dashboard/admin/ManageEventsPage";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>

            {/* Public pages */}

            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/events"
              element={<EventsPage />}
            />

            <Route
              path="/events/:eventId"
              element={<EventDetailsPage />}
            />

            <Route
              path="/clubs"
              element={
                <SimpleContentPage
                  eyebrow="Community"
                  title="Tech clubs"
                >
                  <p>
                    Discover technology clubs and student
                    communities. This section is intentionally
                    kept modular so club profiles, categories
                    and membership flows can be added without
                    changing the global layout.
                  </p>
                </SimpleContentPage>
              }
            />

            <Route
              path="/blog"
              element={
                <SimpleContentPage
                  eyebrow="Guides"
                  title="Student technology guides"
                >
                  <p>
                    Start with practical guides such as how to
                    find hackathons, prepare for a hackathon,
                    explore AI workshops and approach coding
                    competitions.
                  </p>
                </SimpleContentPage>
              }
            />

            <Route
              path="/about"
              element={
                <SimpleContentPage
                  eyebrow="About"
                  title="Built around student opportunities"
                >
                  <p>
                    CampusConnect is designed to make university
                    technology opportunities easier to discover,
                    understand and act on.
                  </p>
                </SimpleContentPage>
              }
            />

            <Route
              path="/contact"
              element={
                <SimpleContentPage
                  eyebrow="Contact"
                  title="Get in touch"
                >
                  <p>
                    Contact functionality can be connected to a
                    backend contact endpoint later. Keep this
                    page separate from global navigation and
                    business logic.
                  </p>
                </SimpleContentPage>
              }
            />

            {/* Authentication */}

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/register"
              element={<RegisterPage />}
            />

            {/* Protected application */}

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />

                <Route
                  path="/dashboard/events"
                  element={<DashboardEventsPage />}
                />

                <Route
                  path="/dashboard/registrations"
                  element={<DashboardRegistrationsPage />}
                />

                <Route
                  path="/dashboard/profile"
                  element={<ProfilePage />}
                />

                <Route
                  path="/dashboard/settings"
                  element={<DashboardSettingsPage />}
                />

                <Route
                  path="/dashboard/admin/users"
                  element={<UsersPage />}
                />

                <Route
                  path="/dashboard/admin/roles"
                  element={<RolePermissionsPage />}
                />

                <Route
                  path="/dashboard/admin/events"
                  element={<ManageEventsPage />}
                />
              </Route>
            </Route>

            {/* 404 */}

            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
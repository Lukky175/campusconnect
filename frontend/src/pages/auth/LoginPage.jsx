import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import PublicLayout from "../../components/layout/PublicLayout";

export default function LoginPage() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { login } = useAuth();

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await login(form);

      toast.success("Welcome back.");

      // After every successful login,
      // take the user directly to the dashboard.
      navigate(data.user?.password_reset_required ? "/dashboard/settings?password-reset=required" : "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.message || "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout mainClassName="pt-0" hideFooter><AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your CampusConnect account."
    >
      <form
        onSubmit={submit}
        className="space-y-4"
      >
        <Input
          label="Username or email"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={form.identifier}
          onChange={(e) =>
            setForm({
              ...form,
              identifier: e.target.value,
            })
          }
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--cc-text-muted)]">
        New here?{" "}
        <Link
          className="font-medium text-[var(--cc-primary)]"
          to="/register"
        >
          Create an account
        </Link>
      </p>
    </AuthShell></PublicLayout>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="flex h-[100svh] min-h-0 items-center justify-center overflow-hidden bg-[var(--cc-bg)] px-4 pb-8 pt-20">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="block text-center text-lg font-semibold text-[var(--cc-heading)]"
        >
          Campus
          <span className="text-[var(--cc-primary)]">
            Connect
          </span>
        </Link>

        <div className="mt-7 rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-7 shadow-[var(--cc-shadow-sm)]">
          <h1 className="text-2xl font-semibold text-[var(--cc-heading)]">
            {title}
          </h1>

          <p className="mt-2 text-sm text-[var(--cc-text-muted)]">
            {subtitle}
          </p>

          <div className="mt-7">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
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
      await login(form);

      toast.success("Welcome back.");

      // After every successful login,
      // take the user directly to the dashboard.
      navigate("/dashboard", {
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
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your student dashboard."
    >
      <form
        onSubmit={submit}
        className="space-y-4"
      >
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
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
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cc-bg)] px-4 py-12">
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
    </main>
  );
}
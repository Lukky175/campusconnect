import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", college_name: "", enrollment_id: ""
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register(form);
      toast.success("Account created. You can now sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cc-bg)] px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="block text-center text-lg font-semibold text-[var(--cc-heading)]">Campus<span className="text-[var(--cc-primary)]">Connect</span></Link>
        <div className="mt-7 rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-7 shadow-[var(--cc-shadow-sm)]">
          <h1 className="text-2xl font-semibold text-[var(--cc-heading)]">Create student account</h1>
          <p className="mt-2 text-sm text-[var(--cc-text-muted)]">Keep your profile ready for event registrations.</p>
          <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Input label="Full name" name="name" required value={form.name} onChange={update("name")} /></div>
            <div className="sm:col-span-2"><Input label="Email" name="email" type="email" required value={form.email} onChange={update("email")} /></div>
            <Input label="College / university" name="college_name" required value={form.college_name} onChange={update("college_name")} />
            <Input label="Enrollment ID" name="enrollment_id" required value={form.enrollment_id} onChange={update("enrollment_id")} />
            <div className="sm:col-span-2"><Input label="Password" name="password" type="password" minLength={8} required value={form.password} onChange={update("password")} /></div>
            <div className="sm:col-span-2"><Button className="w-full" loading={loading}>Create account</Button></div>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--cc-text-muted)]">
            Already registered? <Link className="font-medium text-[var(--cc-primary)]" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

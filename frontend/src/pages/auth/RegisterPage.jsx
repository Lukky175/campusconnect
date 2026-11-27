import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import Seo from "../../components/common/Seo";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", username: "", email: "", password: "", college_name: "", enrollment_id: ""
  });
  const [usernameAvailability, setUsernameAvailability] = useState("idle");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  useEffect(() => {
    const username = form.username.trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9][a-z0-9_]{2,29}$/.test(username)) {
      setUsernameAvailability(username ? "invalid" : "idle");
      return undefined;
    }
    setUsernameAvailability("checking");
    let active = true;
    const timer = window.setTimeout(() => api.checkUsername(username)
      .then((data) => { if (active) setUsernameAvailability(data.available ? "available" : "taken"); })
      .catch(() => { if (active) setUsernameAvailability("unknown"); }), 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [form.username]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.register({ ...form, username: form.username.trim().replace(/^@/, "").toLowerCase() });
      toast.success("Account created. You can now sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Create an account" description="Create a CampusConnect account to join student communities and register for events." path="/register" robots="noindex,follow" />
      <main className="flex min-h-screen items-center justify-center bg-[var(--cc-bg)] px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="block text-center text-lg font-semibold text-[var(--cc-heading)]">Campus<span className="text-[var(--cc-primary)]">Connect</span></Link>
        <div className="mt-7 rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-7 shadow-[var(--cc-shadow-sm)]">
          <h1 className="text-2xl font-semibold text-[var(--cc-heading)]">Create student account</h1>
          <p className="mt-2 text-sm text-[var(--cc-text-muted)]">Keep your profile ready for event registrations.</p>
          <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Input label="Full name" name="name" required value={form.name} onChange={update("name")} /></div>
            <div className="sm:col-span-2"><Input label="Username" name="username" type="text" autoComplete="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9][A-Za-z0-9_]{2,29}" required value={form.username} onChange={update("username")} placeholder="your_name" /><p className={`mt-1 text-xs ${usernameAvailability === "available" ? "text-[var(--cc-success)]" : usernameAvailability === "taken" || usernameAvailability === "invalid" ? "text-[var(--cc-danger)]" : "text-[var(--cc-text-soft)]"}`}>{usernameAvailability === "checking" ? "Checking username…" : usernameAvailability === "available" ? "Username is available. It can’t be changed later." : usernameAvailability === "taken" ? "This username is already in use." : usernameAvailability === "invalid" ? "Use 3–30 letters, numbers, or underscores; start with a letter or number." : "Choose your unique CampusConnect username. You can request a change later."}</p></div>
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
    </>
  );
}

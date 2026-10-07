import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-[var(--cc-primary)]">
          Account
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)] md:text-3xl">
          Profile
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
          View and manage your CampusConnect profile.
        </p>
      </section>

      <section className="max-w-3xl rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="border-b border-[var(--cc-border)] p-6">
          <h2 className="font-semibold text-[var(--cc-heading)]">
            Personal information
          </h2>

          <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
            Information associated with your CampusConnect
            account.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <ProfileField
            label="Name"
            value={user?.name}
          />

          <ProfileField
            label="Email"
            value={user?.email}
          />

          <ProfileField
            label="College"
            value={user?.college_name}
          />

          <ProfileField
            label="Enrollment ID"
            value={user?.enrollment_id}
          />

          <ProfileField
            label="Role"
            value={user?.role}
          />
        </div>
      </section>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-[var(--cc-text)]">
        {value || "Not provided"}
      </p>
    </div>
  );
}
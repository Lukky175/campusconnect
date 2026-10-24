import { useEffect, useState } from "react";

import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";


const EMPTY_EVENT = {
  title: "",
  slug: "",
  description: "",
  type: "Hackathon",
  mode: "Offline",
  location: "",
  college: "",
  organizer: "",
  tags: "",
  start_date: "",
  end_date: "",
  team_size: "",
  registration_url: "",
  eligibility: "",
  highlights: "",
  status: "published",
};


export default function ManageEventsPage() {
  const toast = useToast();
  const { hasPermission, user } = useAuth();
  const canManageRoster = hasPermission("registrations.view") && hasPermission("registrations.manage");
  const canCreateEvent = hasPermission("events.create");
  const canEditAnyEvent = hasPermission("events.edit");
  const canEditOwnEvents = hasPermission("events.edit_own");
  const canDeleteEvents = hasPermission("events.delete");
  const canEditEvent = (event) => canEditAnyEvent || (canEditOwnEvents && event.created_by === user?._id);

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_EVENT);

  const [rosterEvent, setRosterEvent] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterEmail, setRosterEmail] = useState("");
  const [rosterAdding, setRosterAdding] = useState(false);
  const [rosterError, setRosterError] = useState("");
  const [rosterPending, setRosterPending] = useState("");

  async function loadEvents() {
    try {
      setLoading(true);

      const data =
        await api.getAdminEvents();

      setEvents(
        data.events || []
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function openRoster(event) {
    setRosterEvent(event);
    setRoster([]);
    setRosterEmail("");
    setRosterError("");
    setRosterLoading(true);
    try {
      const data = await api.getEventRegistrations(event._id);
      setRoster(data.registrations || []);
    } catch (error) {
      setRosterError(error.message || "Unable to load the student roster.");
    } finally {
      setRosterLoading(false);
    }
  }

  async function addRosterStudent(event) {
    event.preventDefault();
    if (!rosterEmail.trim() || rosterAdding) return;
    setRosterAdding(true);
    setRosterError("");
    try {
      await api.addEventRegistration(rosterEvent._id, rosterEmail.trim());
      setRosterEmail("");
      const data = await api.getEventRegistrations(rosterEvent._id);
      setRoster(data.registrations || []);
      toast.success("Student added to the event.");
    } catch (error) {
      setRosterError(error.message || "Unable to add this student.");
    } finally {
      setRosterAdding(false);
    }
  }

  async function updateRosterStatus(registration, status) {
    if (rosterPending) return;
    setRosterPending(registration._id);
    try {
      if (status === "removed") {
        await api.removeEventRegistration(rosterEvent._id, registration._id);
        status = "cancelled";
        toast.success("Student removed. The cancelled record is retained.");
      } else {
        await api.updateEventRegistration(rosterEvent._id, registration._id, status);
        toast.success("Registration status updated.");
      }
      setRoster((current) => current.map((item) => item._id === registration._id ? { ...item, status } : item));
    } catch (error) {
      toast.error(error.message || "Unable to update this registration.");
    } finally {
      setRosterPending("");
    }
  }

  function openCreate() {
    setEditingEvent(null);
    setForm(EMPTY_EVENT);
    setFormOpen(true);
  }

  function openEdit(event) {
    setEditingEvent(event);

    setForm({
      title: event.title || "",
      slug: event.slug || "",
      description:
        event.description || "",
      type: event.type || "Hackathon",
      mode: event.mode || "Offline",
      location:
        event.location || "",
      college:
        event.college || "",
      organizer:
        event.organizer || "",
      tags: Array.isArray(event.tags)
        ? event.tags.join(", ")
        : "",
      start_date:
        event.start_date || "",
      end_date:
        event.end_date || "",
      team_size:
        event.team_size || "",
      registration_url:
        event.registration_url || "",
      eligibility:
        event.eligibility || "",
      highlights:
        Array.isArray(
          event.highlights
        )
          ? event.highlights.join("\n")
          : "",
      status:
        event.status || "draft",
    });

    setFormOpen(true);
  }

  function updateField(
    name,
    value
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    const payload = {
      ...form,

      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      highlights: form.highlights
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      team_size:
        form.team_size
          ? Number(form.team_size)
          : null,
    };

    try {
      if (editingEvent) {
        const data =
          await api.updateAdminEvent(
            editingEvent._id,
            payload
          );

        setEvents((current) =>
          current.map((item) =>
            item._id ===
            editingEvent._id
              ? data.event
              : item
          )
        );

        toast.success(
          "Event updated."
        );
      } else {
        const data =
          await api.createAdminEvent(
            payload
          );

        setEvents((current) => [
          data.event,
          ...current,
        ]);

        toast.success(
          "Event created."
        );
      }

      setFormOpen(false);
      setEditingEvent(null);
      setForm(EMPTY_EVENT);
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to save event."
      );
    }
  }

  async function deleteEvent(
    eventId
  ) {
    const confirmed =
      window.confirm(
        "Delete this event permanently?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteAdminEvent(
        eventId
      );

      setEvents((current) =>
        current.filter(
          (event) =>
            event._id !== eventId
        )
      );

      toast.success(
        "Event deleted."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to delete event."
      );
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--cc-text-muted)]">
        Loading events...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--cc-primary)]">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)]">
            Manage Events
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--cc-text-muted)]">
            Create, edit and remove CampusConnect events.
          </p>
        </div>

        {canCreateEvent && <Button type="button" onClick={openCreate} className="rounded-[var(--cc-radius-md)]">
          <Plus className="size-4" />
          Create event
        </Button>}
      </section>

      <section className="overflow-hidden rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Event
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Type
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Date
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="border-b border-[var(--cc-border)] last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[var(--cc-heading)]">
                      {event.title}
                    </p>

                    <p className="mt-1 text-xs text-[var(--cc-text-muted)]">
                      {event.location ||
                        event.mode ||
                        "Location not specified"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--cc-text-muted)]">
                    {event.type}
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--cc-text-muted)]">
                    {event.start_date || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[var(--cc-primary-soft)] px-2.5 py-1 text-xs font-medium capitalize text-[var(--cc-primary)]">
                      {event.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {canEditEvent(event) && <button
                        type="button"
                        onClick={() =>
                          openEdit(event)
                        }
                        className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"
                        aria-label="Edit event"
                      >
                        <Pencil className="size-4" />
                      </button>}

                      {canManageRoster && <button
                        type="button"
                        onClick={() => openRoster(event)}
                        className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"
                        aria-label={`View registrations for ${event.title}`}
                        title="Manage registered students"
                      >
                        <UsersRound className="size-4" />
                      </button>}

                      {canDeleteEvents && <button
                        type="button"
                        onClick={() =>
                          deleteEvent(
                            event._id
                          )
                        }
                        className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] p-2 text-[var(--cc-danger)] hover:bg-[var(--cc-danger-soft)]"
                        aria-label="Delete event"
                      >
                        <Trash2 className="size-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!events.length && (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto size-8 text-[var(--cc-text-soft)]" />

            <p className="mt-3 text-sm text-[var(--cc-text-muted)]">
              No events have been created yet.
            </p>
          </div>
        )}
      </section>

      {formOpen && (
        <EventForm
          form={form}
          editing={Boolean(editingEvent)}
          onChange={updateField}
          onSubmit={submit}
          onClose={() =>
            setFormOpen(false)
          }
        />
      )}

      {rosterEvent && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRosterEvent(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="event-roster-title" className="mx-auto my-6 max-w-4xl rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-md)]">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--cc-border)] p-5 sm:p-6">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-primary)]">Event roster</p><h2 id="event-roster-title" className="mt-1 text-xl font-semibold text-[var(--cc-heading)]">{rosterEvent.title}</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Add students by Bennett account email, update their status, or remove them from the active roster.</p></div>
            <button type="button" onClick={() => setRosterEvent(null)} aria-label="Close roster" className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><X className="size-4" /></button>
          </header>
          <div className="space-y-5 p-5 sm:p-6">
            <form onSubmit={addRosterStudent} className="flex flex-col gap-2 sm:flex-row">
              <input type="email" required value={rosterEmail} onChange={(event) => setRosterEmail(event.target.value)} placeholder="student@bennett.edu.in" aria-label="Student email address" className="focus-ring min-h-11 min-w-0 flex-1 rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" />
              <Button type="submit" loading={rosterAdding}><UsersRound className="size-4" /> Add student</Button>
            </form>
            {rosterError && <p role="alert" className="rounded-md bg-[var(--cc-danger-soft)] px-3 py-2 text-sm text-[var(--cc-danger)]">{rosterError}</p>}
            <div className="overflow-x-auto rounded-[var(--cc-radius-md)] border border-[var(--cc-border)]">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-[var(--cc-surface-subtle)]"><tr><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">Student</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">Enrollment ID</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">Status</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">Actions</th></tr></thead>
                <tbody className="divide-y divide-[var(--cc-border)]">
                  {rosterLoading ? <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-[var(--cc-text-muted)]">Loading registered students…</td></tr> : roster.length ? roster.map((registration) => <tr key={registration._id}>
                    <td className="px-4 py-3"><p className="text-sm font-medium text-[var(--cc-heading)]">{registration.student?.name}</p><p className="text-xs text-[var(--cc-text-muted)]">{registration.student?.email}</p></td>
                    <td className="px-4 py-3 text-sm text-[var(--cc-text-muted)]">{registration.student?.enrollment_id || "—"}</td>
                    <td className="px-4 py-3"><select value={registration.status} disabled={rosterPending === registration._id} onChange={(event) => updateRosterStatus(registration, event.target.value)} aria-label={`Update status for ${registration.student?.name}`} className="focus-ring rounded-md border border-[var(--cc-border)] bg-[var(--cc-surface)] px-2.5 py-2 text-sm capitalize text-[var(--cc-text)]">{["registered", "cancelled", "attended", "waitlisted"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                    <td className="px-4 py-3"><Button type="button" variant="ghost" disabled={rosterPending === registration._id || registration.status === "cancelled"} onClick={() => updateRosterStatus(registration, "removed")} className="min-h-9 px-2 text-[var(--cc-danger)]">Remove</Button></td>
                  </tr>) : <tr><td colSpan="4" className="px-4 py-10 text-center text-sm text-[var(--cc-text-muted)]">No registrations yet. Add a student using their account email above.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="text-xs leading-5 text-[var(--cc-text-soft)]">Cancelled registration records remain saved, so students cannot re-register themselves. Admins can change a status back to Registered when needed.</p>
          </div>
        </section>
      </div>}
    </div>
  );
}


function EventForm({
  form,
  editing,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto my-8 max-w-3xl rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-md)]">
        <div className="flex items-center justify-between border-b border-[var(--cc-border)] px-6 py-4">
          <div>
            <h2 className="font-semibold text-[var(--cc-heading)]">
              {editing
                ? "Edit event"
                : "Create event"}
            </h2>

            <p className="mt-1 text-xs text-[var(--cc-text-muted)]">
              Event information will be stored in MongoDB.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Title"
              value={form.title}
              onChange={(value) =>
                onChange(
                  "title",
                  value
                )
              }
              required
            />

            <Field
              label="Slug"
              value={form.slug}
              onChange={(value) =>
                onChange(
                  "slug",
                  value
                )
              }
              required
            />

            <SelectField
              label="Type"
              value={form.type}
              onChange={(value) =>
                onChange(
                  "type",
                  value
                )
              }
              options={[
                "Hackathon",
                "Workshop",
                "Competition",
                "Seminar",
              ]}
            />

            <SelectField
              label="Mode"
              value={form.mode}
              onChange={(value) =>
                onChange(
                  "mode",
                  value
                )
              }
              options={[
                "Offline",
                "Online",
                "Hybrid",
              ]}
            />

            <Field
              label="Location"
              value={form.location}
              onChange={(value) =>
                onChange(
                  "location",
                  value
                )
              }
            />

            <Field
              label="College"
              value={form.college}
              onChange={(value) =>
                onChange(
                  "college",
                  value
                )
              }
            />

            <Field
              label="Organizer"
              value={form.organizer}
              onChange={(value) =>
                onChange(
                  "organizer",
                  value
                )
              }
            />

            <Field
              label="Team size"
              type="number"
              value={form.team_size}
              onChange={(value) =>
                onChange(
                  "team_size",
                  value
                )
              }
            />

            <Field
              label="Start date"
              type="datetime-local"
              value={form.start_date}
              onChange={(value) =>
                onChange(
                  "start_date",
                  value
                )
              }
            />

            <Field
              label="End date"
              type="datetime-local"
              value={form.end_date}
              onChange={(value) =>
                onChange(
                  "end_date",
                  value
                )
              }
            />

            <Field
              label="Registration URL"
              type="url"
              value={form.registration_url}
              onChange={(value) =>
                onChange(
                  "registration_url",
                  value
                )
              }
            />

            <SelectField
              label="Status"
              value={form.status}
              onChange={(value) =>
                onChange(
                  "status",
                  value
                )
              }
              options={[
                "draft",
                "published",
                "cancelled",
                "completed",
              ]}
            />
          </div>

          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(value) =>
              onChange(
                "description",
                value
              )
            }
          />

          <Field
            label="Tags"
            value={form.tags}
            onChange={(value) =>
              onChange(
                "tags",
                value
              )
            }
            placeholder="AI, DevOps, Cloud"
          />

          <TextAreaField
            label="Eligibility"
            value={form.eligibility}
            onChange={(value) =>
              onChange(
                "eligibility",
                value
              )
            }
          />

          <TextAreaField
            label="Highlights"
            value={form.highlights}
            onChange={(value) =>
              onChange(
                "highlights",
                value
              )
            }
            placeholder="One highlight per line"
          />

          <div className="flex justify-end gap-2 border-t border-[var(--cc-border)] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] px-4 py-2 text-sm font-medium text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]"
            >
              Cancel
            </button>

            <Button type="submit" className="rounded-[var(--cc-radius-md)]">
              {editing
                ? "Save changes"
                : "Create event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--cc-text)]">
        {label}
      </span>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-1.5 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]"
      />
    </label>
  );
}


function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--cc-text)]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-1.5 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}


function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--cc-text)]">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-1.5 w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]"
      />
    </label>
  );
}

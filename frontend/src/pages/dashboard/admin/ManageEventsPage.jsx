import { useEffect, useState } from "react";

import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";


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

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)]"
        >
          <Plus className="size-4" />
          Create event
        </button>
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
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(event)
                        }
                        className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"
                        aria-label="Edit event"
                      >
                        <Pencil className="size-4" />
                      </button>

                      <button
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
                      </button>
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

            <button
              type="submit"
              className="rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2 text-sm font-medium text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)]"
            >
              {editing
                ? "Save changes"
                : "Create event"}
            </button>
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
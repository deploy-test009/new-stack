'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  startAt: string;
};

type Form = { title: string; description: string; venue: string; startAt: string };
const empty: Form = { title: '', description: '', venue: '', startAt: '' };

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(msg ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setEvents(await api<EventItem[]>('/events'));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        venue: form.venue,
        startAt: new Date(form.startAt).toISOString(),
      });
      if (editingId) await api(`/events/${editingId}`, { method: 'PATCH', body });
      else await api('/events', { method: 'POST', body });
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const edit = (ev: EventItem) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      venue: ev.venue,
      startAt: toLocalInput(ev.startAt),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <main>
      <h1>4thepeople</h1>
      <p className="sub">Starter: Next.js → NestJS → Postgres</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={submit}>
        <strong>{editingId ? 'Edit event' : 'Add event'}</strong>
        <input placeholder="Title" value={form.title} onChange={set('title')} required />
        <input placeholder="Venue" value={form.venue} onChange={set('venue')} required />
        <input type="datetime-local" value={form.startAt} onChange={set('startAt')} required />
        <textarea placeholder="Description (optional)" rows={3} value={form.description} onChange={set('description')} />
        <div className="row">
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && (
            <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(empty); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p>Loading…</p>}
      {!loading && events.length === 0 && !error && <p>No events yet. Add the first one above.</p>}

      {events.map((ev) => (
        <div className="card" key={ev.id}>
          <div className="row between">
            <strong>{ev.title}</strong>
            <div className="row">
              <button className="ghost" onClick={() => edit(ev)}>Edit</button>
              <button className="danger" onClick={() => remove(ev.id)}>Delete</button>
            </div>
          </div>
          <p className="meta">{ev.venue} · {new Date(ev.startAt).toLocaleString()}</p>
          {ev.description && <p>{ev.description}</p>}
        </div>
      ))}
    </main>
  );
}

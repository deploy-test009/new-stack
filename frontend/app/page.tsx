'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Share2,
  Ticket,
  CheckCircle2,
  Music,
  Code2,
  Gamepad2,
  Palette,
  Lightbulb,
  Users,
  Volume2,
  VolumeX,
  Download,
  LayoutGrid,
  Radio,
  X,
  Heart,
  ExternalLink,
  ChevronRight,
  Flame,
  Shuffle,
  CalendarCheck
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  startAt: string;
  createdAt?: string;
};

type Form = {
  title: string;
  description: string;
  venue: string;
  startAt: string;
};

const emptyForm: Form = {
  title: '',
  description: '',
  venue: '',
  startAt: '',
};

type EventCategory = 'tech' | 'music' | 'gaming' | 'arts' | 'workshop' | 'social';

function detectCategory(title: string, desc: string | null = '', venue: string = ''): EventCategory {
  const text = `${title} ${desc ?? ''} ${venue}`.toLowerCase();
  if (text.includes('game') || text.includes('gaming') || text.includes('zod') || text.includes('esport') || text.includes('play') || text.includes('tournament')) {
    return 'gaming';
  }
  if (text.includes('music') || text.includes('indigo') || text.includes('moodi') || text.includes('concert') || text.includes('dj') || text.includes('band') || text.includes('jam') || text.includes('sound') || text.includes('beat')) {
    return 'music';
  }
  if (text.includes('tech') || text.includes('hackathon') || text.includes('code') || text.includes('dev') || text.includes('ai') || text.includes('cyber') || text.includes('info') || text.includes('lab') || text.includes('cloud')) {
    return 'tech';
  }
  if (text.includes('art') || text.includes('cultural') || text.includes('photo') || text.includes('film') || text.includes('theatre') || text.includes('moon') || text.includes('dance')) {
    return 'arts';
  }
  if (text.includes('workshop') || text.includes('talk') || text.includes('seminar') || text.includes('keynote') || text.includes('lecture') || text.includes('bootcamp')) {
    return 'workshop';
  }
  return 'social';
}

const CATEGORY_CONFIG: Record<EventCategory, {
  label: string;
  icon: any;
  color: string;
  glow: string;
  gradient: string;
}> = {
  tech: {
    label: 'Tech & Hack',
    icon: Code2,
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    gradient: 'linear-gradient(135deg, #0284c7, #6366f1)',
  },
  music: {
    label: 'Music & Fest',
    icon: Music,
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)',
    gradient: 'linear-gradient(135deg, #d946ef, #8b5cf6)',
  },
  gaming: {
    label: 'Esports & Play',
    icon: Gamepad2,
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    gradient: 'linear-gradient(135deg, #059669, #0d9488)',
  },
  arts: {
    label: 'Arts & Culture',
    icon: Palette,
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'linear-gradient(135deg, #ea580c, #e11d48)',
  },
  workshop: {
    label: 'Keynote & Lab',
    icon: Lightbulb,
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  },
  social: {
    label: 'Community Club',
    icon: Users,
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
  },
};

const CREATIVE_PRESETS = [
  {
    title: 'Neon Cyber Hackathon 2026',
    venue: 'TinkerLab 404 & Cloud Lounge',
    description: '36 hours of non-stop building, agentic AI systems, midnight snacks, and synthwave beats. Cash pool & swag bags!',
    offsetDays: 3,
    hour: 18,
  },
  {
    title: 'Midnight Rooftop Acoustic & Chai',
    venue: 'Sky Terrace & Velvet Lawn',
    description: 'Unplugged guitar sessions, open mic spoken word, indie stargazing, and steaming cardamom chai under the stars.',
    offsetDays: 6,
    hour: 21,
  },
  {
    title: 'Inter-College Esports Showdown: Valorant & Tekken',
    venue: 'Gaming Arena Lab 2',
    description: 'Double elimination LAN bracket, 144Hz setups, shoutcasting on the main projector, and custom championship trophy.',
    offsetDays: 9,
    hour: 14,
  },
  {
    title: 'Moonlight Film & Animation Screening',
    venue: 'Amphitheatre Courtyard',
    description: 'Outdoor projection screening of student short films, indie animated gems, and cozy beanbags. Popcorn provided!',
    offsetDays: 12,
    hour: 20,
  },
  {
    title: 'Agentic AI & Neural Systems Workshop',
    venue: 'Auditorium Hall B',
    description: 'Interactive deep dive: Architecting multi-agent pipelines and real-time LLM tools. Bring your laptops.',
    offsetDays: 15,
    hour: 11,
  },
  {
    title: 'Sunset Beatbox & DJ Mixer Fest',
    venue: 'Main Promenade Deck',
    description: 'Bassline drops, live vocal looping battles, and vibrant campus street food stalls. Let the good vibrations take over!',
    offsetDays: 20,
    hour: 17,
  },
];

const toLocalInput = (iso: string) => {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

function formatCountdown(iso: string) {
  try {
    const target = new Date(iso).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0 && diff > -5 * 3600 * 1000) {
      return { status: 'live', text: 'Happening Now 🔥' };
    }
    if (diff <= 0) {
      return { status: 'past', text: 'Concluded' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days === 0 && hours === 0) {
      return { status: 'today', text: `Starts in ${minutes}m` };
    }
    if (days === 0) {
      return { status: 'today', text: `Today (${hours}h ${minutes}m)` };
    }
    if (days === 1) {
      return { status: 'soon', text: `Tomorrow (${hours}h)` };
    }
    if (days < 30) {
      return { status: 'upcoming', text: `In ${days}d ${hours}h` };
    }
    return { status: 'upcoming', text: `In ${Math.floor(days / 30)} months` };
  } catch {
    return { status: 'upcoming', text: 'Scheduled' };
  }
}

// Download .ics Calendar File
function downloadCalendarFile(event: EventItem) {
  try {
    const start = new Date(event.startAt);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//4THEPEOPLE//Event Pulse//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@4thepeople.app`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
      `LOCATION:${event.venue.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${(event.description ?? '').replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch {
    // fallback
  }
}

// Deterministic Futuristic QR Matrix SVG
function RenderQR({ seed }: { seed: string }) {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const size = 15;
  const grid: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // 3 finder corners
      const isTopLeft = r < 4 && c < 4;
      const isTopRight = r < 4 && c >= size - 4;
      const isBottomLeft = r >= size - 4 && c < 4;

      if (isTopLeft || isTopRight || isBottomLeft) {
        row.push(true);
      } else {
        const val = Math.sin((r * 13 + c * 7 + hash) * 1.5);
        row.push(val > 0.1);
      }
    }
    grid.push(row);
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ shapeRendering: 'crispEdges' }}>
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
        )
      )}
    </svg>
  );
}

// Sound Synthesizer via Web Audio
function playAudio(type: 'click' | 'pop' | 'success' | 'delete', enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'delete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'success') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.28);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.05);
        o.stop(ctx.currentTime + i * 0.05 + 0.3);
      });
    }
  } catch {
    // ignore audio policy
  }
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<EventItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters & Views
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [activeView, setActiveView] = useState<'cards' | 'timeline' | 'venues'>('cards');
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});

  // Toast auto-clear
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load RSVPs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('4thepeople_rsvps');
      if (stored) setRsvps(JSON.parse(stored));
      const soundPref = localStorage.getItem('4thepeople_sound');
      if (soundPref !== null) setSoundEnabled(soundPref === 'true');
    } catch {
      // safe fallback
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('4thepeople_sound', String(next));
    } catch {}
    if (next) playAudio('pop', true);
  };

  const toggleRsvp = (id: string) => {
    const next = { ...rsvps, [id]: !rsvps[id] };
    setRsvps(next);
    try {
      localStorage.setItem('4thepeople_rsvps', JSON.stringify(next));
    } catch {}
    playAudio(next[id] ? 'success' : 'click', soundEnabled);
    setToastMsg(next[id] ? '✨ RSVP Confirmed! Added to your passes.' : 'RSVP removed.');
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
  };

  const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      throw new Error(msg ?? `Request failed (${res.status})`);
    }
    return res.json();
  };

  const loadData = async () => {
    try {
      const data = await api<EventItem[]>('/events');
      setEvents(data);
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      // Periodic refresh
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.venue.trim() || !form.startAt) return;

    try {
      const body = JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        venue: form.venue.trim(),
        startAt: new Date(form.startAt).toISOString(),
      });

      if (editingId) {
        await api(`/events/${editingId}`, { method: 'PATCH', body });
        triggerToast('⚡ Event updated successfully!');
      } else {
        await api('/events', { method: 'POST', body });
        triggerToast('🎉 New Event Launched into Orbit!');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
        });
      }

      playAudio('success', soundEnabled);
      setForm(emptyForm);
      setEditingId(null);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Could not save event. Make sure backend is running.');
    }
  };

  const handleEdit = (ev: EventItem) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      venue: ev.venue,
      startAt: toLocalInput(ev.startAt),
    });
    setIsModalOpen(true);
    playAudio('pop', soundEnabled);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to cancel and delete "${title}"?`)) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      playAudio('delete', soundEnabled);
      triggerToast('Event ticket deleted.');
      if (selectedPass?.id === id) setSelectedPass(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed.');
    }
  };

  // Preset Idea Sparker
  const fillRandomPreset = () => {
    playAudio('pop', soundEnabled);
    const preset = CREATIVE_PRESETS[Math.floor(Math.random() * CREATIVE_PRESETS.length)];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + preset.offsetDays);
    targetDate.setHours(preset.hour, 0, 0, 0);

    setForm({
      title: preset.title,
      description: preset.description,
      venue: preset.venue,
      startAt: toLocalInput(targetDate.toISOString()),
    });
    triggerToast('🎲 Idea generated! Edit or save to publish.');
  };

  // Date Shortcuts
  const setQuickDate = (offsetDays: number, hour: number) => {
    playAudio('click', soundEnabled);
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    setForm((prev) => ({ ...prev, startAt: toLocalInput(d.toISOString()) }));
  };

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.venue.toLowerCase().includes(search.toLowerCase()) ||
        (ev.description && ev.description.toLowerCase().includes(search.toLowerCase()));

      const cat = detectCategory(ev.title, ev.description, ev.venue);
      const matchesCat = selectedCat === 'all' || selectedCat === cat;

      const eventTime = new Date(ev.startAt).getTime();
      const now = Date.now();
      let matchesTime = true;
      if (timeFilter === 'upcoming') matchesTime = eventTime >= now - 4 * 3600 * 1000;
      if (timeFilter === 'past') matchesTime = eventTime < now - 4 * 3600 * 1000;

      return matchesSearch && matchesCat && matchesTime;
    });
  }, [events, search, selectedCat, timeFilter]);

  // Grouped by Venue for Radar View
  const venueGroups = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    filteredEvents.forEach((ev) => {
      const v = ev.venue.trim() || 'Unassigned Venue';
      if (!map[v]) map[v] = [];
      map[v].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Total RSVPs count
  const myRsvpCount = useMemo(() => {
    return Object.values(rsvps).filter(Boolean).length;
  }, [rsvps]);

  return (
    <div className="app-container">
      {/* Dynamic Ambient Header */}
      <header className="header-glass">
        <div className="brand-wrapper">
          <div className="brand-symbol">
            <Ticket size={24} />
          </div>
          <div className="brand-text">
            <h1>4THEPEOPLE</h1>
            <div className="subtext">CAMPUS & CLUB EVENT HUB // 2026</div>
          </div>
        </div>

        <div className="header-actions">
          {/* Backend Live Indicator */}
          <div className={`live-pill ${serverOnline ? 'online' : 'demo'}`}>
            <span className="live-dot" />
            <span>{serverOnline ? 'NESTJS API LIVE' : 'OFFLINE / DEMO'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            className="icon-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Interface Sound' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Create Button */}
          <button
            className="btn-primary"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setIsModalOpen(true);
              playAudio('pop', soundEnabled);
            }}
          >
            <Plus size={18} />
            <span>Host Event</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome */}
      <section className="hero-section">
        <div className="hero-tagline">
          <Sparkles size={14} />
          <span>Vibrant Pulse for Campus Culture, Fests & Tech</span>
        </div>
        <h2 className="hero-title">Experience What&apos;s Happening</h2>
        <p className="hero-subtitle">
          Discover college tournaments, hackathons, rooftop acoustic nights, and gatherings with holographic VIP passes and instant calendar sync.
        </p>

        {/* Live Metrics Ribbon */}
        <div className="stats-ribbon">
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Flame size={20} />
            </div>
            <div className="stat-info">
              <div className="num">{events.length}</div>
              <div className="label">Total Events</div>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <CalendarCheck size={20} />
            </div>
            <div className="stat-info">
              <div className="num">
                {events.filter((e) => new Date(e.startAt).getTime() > Date.now()).length}
              </div>
              <div className="label">Upcoming</div>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <Heart size={20} />
            </div>
            <div className="stat-info">
              <div className="num">{myRsvpCount}</div>
              <div className="label">Saved / RSVPs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Control Toolbar */}
      <section className="control-hub">
        <div className="search-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search events, venues, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Time Filter Pills */}
          <div className="view-switcher">
            <button
              className={`view-btn ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setTimeFilter('all'); playAudio('click', soundEnabled); }}
            >
              All Time
            </button>
            <button
              className={`view-btn ${timeFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => { setTimeFilter('upcoming'); playAudio('click', soundEnabled); }}
            >
              Upcoming
            </button>
            <button
              className={`view-btn ${timeFilter === 'past' ? 'active' : ''}`}
              onClick={() => { setTimeFilter('past'); playAudio('click', soundEnabled); }}
            >
              Past
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="view-switcher">
            <button
              className={`view-btn ${activeView === 'cards' ? 'active' : ''}`}
              onClick={() => { setActiveView('cards'); playAudio('click', soundEnabled); }}
              title="Hologram Ticket Passes"
            >
              <Ticket size={16} />
              <span>Passes</span>
            </button>
            <button
              className={`view-btn ${activeView === 'timeline' ? 'active' : ''}`}
              onClick={() => { setActiveView('timeline'); playAudio('click', soundEnabled); }}
              title="Chronological Timeline"
            >
              <Clock size={16} />
              <span>Timeline</span>
            </button>
            <button
              className={`view-btn ${activeView === 'venues' ? 'active' : ''}`}
              onClick={() => { setActiveView('venues'); playAudio('click', soundEnabled); }}
              title="Venues Radar"
            >
              <MapPin size={16} />
              <span>Venues</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-row">
          <button
            className={`cat-pill ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => { setSelectedCat('all'); playAudio('click', soundEnabled); }}
          >
            <Sparkles size={14} />
            <span>All Categories</span>
          </button>
          {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((catKey) => {
            const conf = CATEGORY_CONFIG[catKey];
            const Icon = conf.icon;
            return (
              <button
                key={catKey}
                className={`cat-pill ${selectedCat === catKey ? 'active' : ''}`}
                onClick={() => { setSelectedCat(catKey); playAudio('click', soundEnabled); }}
              >
                <Icon size={14} style={{ color: conf.color }} />
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Events Showcase */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Clock size={32} />
          </div>
          <h3>Syncing with NestJS Event Stream...</h3>
          <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>Fetching campus happenings</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Sparkles size={32} />
          </div>
          <h3>No events found in this category</h3>
          <p style={{ color: 'var(--text-dim)', margin: '8px 0 20px' }}>
            {search ? 'Try clearing your search query' : 'Be the first to host an epic event!'}
          </p>
          <button
            className="btn-primary"
            style={{ margin: '0 auto' }}
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create First Event</span>
          </button>
        </div>
      ) : activeView === 'cards' ? (
        /* VIEW 1: HOLOGRAPHIC TICKET PASSES GRID */
        <div className="events-grid">
          {filteredEvents.map((ev) => {
            const cat = detectCategory(ev.title, ev.description, ev.venue);
            const conf = CATEGORY_CONFIG[cat];
            const Icon = conf.icon;
            const dateObj = new Date(ev.startAt);
            const isInvalidDate = isNaN(dateObj.getTime());
            const month = isInvalidDate ? 'NOV' : dateObj.toLocaleString('en-US', { month: 'short' });
            const day = isInvalidDate ? '15' : dateObj.getDate();
            const timeStr = isInvalidDate ? 'TBA' : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const countdown = formatCountdown(ev.startAt);
            const isRsvpd = Boolean(rsvps[ev.id]);

            return (
              <div
                key={ev.id}
                className="ticket-pass"
                style={{
                  ['--card-glow' as any]: conf.glow,
                  ['--theme-gradient' as any]: conf.gradient,
                }}
              >
                {/* Holographic Header */}
                <div className="ticket-holo-header">
                  <div className="ticket-badge">
                    <Icon size={12} />
                    <span>{conf.label}</span>
                  </div>

                  <div className={`ticket-countdown ${countdown.status === 'live' ? 'live' : ''}`}>
                    <Clock size={12} />
                    <span>{countdown.text}</span>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="ticket-body">
                  <div className="ticket-meta-row">
                    <div className="date-box">
                      <div className="month">{month}</div>
                      <div className="day">{day}</div>
                    </div>

                    <div className="time-venue">
                      <div className="meta-item">
                        <Clock size={13} />
                        <span>{timeStr}</span>
                      </div>
                      <div className="meta-item">
                        <MapPin size={13} />
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{ev.venue}</span>
                      </div>
                    </div>
                  </div>

                  <h3
                    className="ticket-title"
                    onClick={() => { setSelectedPass(ev); playAudio('pop', soundEnabled); }}
                    style={{ cursor: 'pointer' }}
                    title="Click to view VIP Pass"
                  >
                    {ev.title}
                  </h3>

                  <p className="ticket-description">
                    {ev.description || 'Join fellow students and creators for an unforgettable gathering. Open to everyone.'}
                  </p>

                  {/* Perforated Stub Divider */}
                  <div className="ticket-perforation">
                    <div className="perforation-line" />
                  </div>

                  {/* Ticket Footer Actions */}
                  <div className="ticket-footer">
                    {/* Visual Barcode pattern */}
                    <div
                      className="ticket-barcode"
                      title="Ticket Verification Barcode"
                      onClick={() => { setSelectedPass(ev); playAudio('pop', soundEnabled); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {[1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1].map((w, idx) => (
                        <div key={idx} className="barcode-line" style={{ width: `${w}px` }} />
                      ))}
                    </div>

                    <div className="action-row">
                      {/* RSVP Button */}
                      <button
                        className={`ticket-action-btn ${isRsvpd ? 'active' : ''}`}
                        onClick={() => toggleRsvp(ev.id)}
                        title={isRsvpd ? 'Saved to your passes' : 'Bookmark / RSVP'}
                      >
                        <Heart size={14} fill={isRsvpd ? '#f472b6' : 'none'} />
                        <span>{isRsvpd ? 'RSVP’d' : 'RSVP'}</span>
                      </button>

                      {/* VIP Pass Modal */}
                      <button
                        className="ticket-action-btn"
                        onClick={() => { setSelectedPass(ev); playAudio('pop', soundEnabled); }}
                        title="View VIP Hologram Pass"
                      >
                        <Ticket size={14} />
                      </button>

                      {/* Add to Calendar (.ics) */}
                      <button
                        className="ticket-action-btn"
                        onClick={() => {
                          downloadCalendarFile(ev);
                          playAudio('success', soundEnabled);
                          triggerToast('📅 Calendar invite (.ics) downloaded!');
                        }}
                        title="Download Calendar Invite (.ics)"
                      >
                        <Download size={14} />
                      </button>

                      {/* Edit */}
                      <button
                        className="ticket-action-btn"
                        onClick={() => handleEdit(ev)}
                        title="Edit Event"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        className="ticket-action-btn danger"
                        onClick={() => handleDelete(ev.id, ev.title)}
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeView === 'timeline' ? (
        /* VIEW 2: CHRONOLOGICAL TIMELINE */
        <div className="timeline-container">
          <div className="timeline-line" />
          {filteredEvents.map((ev) => {
            const cat = detectCategory(ev.title, ev.description, ev.venue);
            const conf = CATEGORY_CONFIG[cat];
            const dateObj = new Date(ev.startAt);
            const countdown = formatCountdown(ev.startAt);

            return (
              <div key={ev.id} className="timeline-item">
                <div
                  className="timeline-node"
                  style={{ borderColor: conf.color, boxShadow: `0 0 12px ${conf.glow}` }}
                />
                <div className="timeline-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: conf.gradient,
                          color: '#fff',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {conf.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.78rem', color: conf.color, fontWeight: 600 }}>
                      {countdown.text}
                    </span>
                  </div>

                  <h3
                    style={{ fontSize: '1.2rem', marginBottom: 6, color: '#fff', cursor: 'pointer' }}
                    onClick={() => { setSelectedPass(ev); playAudio('pop', soundEnabled); }}
                  >
                    {ev.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 12 }}>
                    <MapPin size={14} />
                    <span>{ev.venue}</span>
                  </div>
                  {ev.description && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                      {ev.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="ticket-action-btn"
                      onClick={() => { setSelectedPass(ev); playAudio('pop', soundEnabled); }}
                    >
                      <Ticket size={14} />
                      <span>View VIP Pass</span>
                    </button>
                    <button
                      className="ticket-action-btn"
                      onClick={() => {
                        downloadCalendarFile(ev);
                        playAudio('success', soundEnabled);
                        triggerToast('📅 Calendar invite (.ics) downloaded!');
                      }}
                    >
                      <Download size={14} />
                      <span>Sync Calendar</span>
                    </button>
                    <button
                      className="ticket-action-btn"
                      onClick={() => handleEdit(ev)}
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 3: VENUES BOARD */
        <div className="venue-grid">
          {Object.entries(venueGroups).map(([venueName, venueEvents]) => (
            <div key={venueName} className="venue-card">
              <div className="venue-header">
                <div className="venue-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>{venueName}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {venueEvents.length} event{venueEvents.length !== 1 ? 's' : ''} hosted here
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {venueEvents.map((ev) => {
                  const cat = detectCategory(ev.title, ev.description, ev.venue);
                  const conf = CATEGORY_CONFIG[cat];
                  const dateObj = new Date(ev.startAt);

                  return (
                    <div
                      key={ev.id}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => { setSelectedPass(ev); playAudio('pop', soundEnabled); }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                          {ev.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: conf.color, fontWeight: 600 }}>
                          {conf.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                </div>
                <h3 className="modal-title">{editingId ? 'Update Event Details' : 'Host a New Event'}</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Inspiration Sparker */}
              {!editingId && (
                <div className="magic-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} style={{ color: '#ec4899' }} />
                    <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                      Need creative ideas for your campus club?
                    </span>
                  </div>
                  <button type="button" className="magic-btn" onClick={fillRandomPreset}>
                    <Shuffle size={14} />
                    <span>Surprise Me</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Neon Cyber Hackathon 2026"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Venue / Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Main Auditorium / Lab 404 / Skyline Terrace"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    required
                  />
                  {/* Quick Preset Time Chips */}
                  <div className="date-shortcuts">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Presets:</span>
                    <button type="button" className="shortcut-chip" onClick={() => setQuickDate(0, 19)}>
                      Tonight 7 PM
                    </button>
                    <button type="button" className="shortcut-chip" onClick={() => setQuickDate(1, 18)}>
                      Tomorrow 6 PM
                    </button>
                    <button type="button" className="shortcut-chip" onClick={() => setQuickDate(3, 14)}>
                      In 3 Days 2 PM
                    </button>
                    <button type="button" className="shortcut-chip" onClick={() => setQuickDate(7, 20)}>
                      Next Week 8 PM
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description & Vibes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="What can attendees expect? Food, prizes, acoustic sessions, dress code, swag..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Real-time Ticket Preview Tag */}
                {form.title && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px dashed var(--border-glow)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
                      Live Ticket Preview:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff' }}>{form.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                        {form.venue || 'TBA'}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="button"
                    className="ticket-action-btn"
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Sparkles size={16} />
                    <span>{editingId ? 'Save Changes' : 'Publish Event Pass'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIP PASS INSPECTOR MODAL */}
      {selectedPass && (
        <div className="modal-backdrop" onClick={() => setSelectedPass(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vip-pass-card">
              {/* Pass Top Banner */}
              <div
                className="vip-pass-top"
                style={{
                  background: CATEGORY_CONFIG[detectCategory(selectedPass.title, selectedPass.description, selectedPass.venue)].gradient,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="vip-badge">OFFICIAL VIP ACCESS PASS</span>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedPass(null)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '14px 0 6px', lineHeight: 1.2 }}>
                  {selectedPass.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', opacity: 0.9 }}>
                  <MapPin size={15} />
                  <span>{selectedPass.venue}</span>
                </div>
              </div>

              {/* Pass Mid Details */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date & Time</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
                      {new Date(selectedPass.startAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(selectedPass.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pass Token</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      #YP-{selectedPass.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      CONFIRMED
                    </div>
                  </div>
                </div>

                {selectedPass.description && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Event Intel
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {selectedPass.description}
                    </p>
                  </div>
                )}

                {/* Perforation Tear Notch */}
                <div className="ticket-perforation" style={{ margin: '10px -24px 20px' }}>
                  <div className="perforation-line" />
                </div>

                {/* Dynamic QR Box & Barcode */}
                <div className="qr-section" style={{ borderRadius: 'var(--radius-md)' }}>
                  <div className="qr-box">
                    <RenderQR seed={selectedPass.id} />
                  </div>
                  <div style={{ flex: 1, paddingLeft: 18 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                      SCAN AT ENTRY DESK
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 3 }}>
                      Valid for one attendee registration. Powered by 4thepeople.
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 2 }}>
                      {[2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((w, i) => (
                        <div key={i} style={{ width: w, height: 18, background: '#cbd5e1' }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Modal Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                  <button
                    className="btn-primary"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      downloadCalendarFile(selectedPass);
                      playAudio('success', soundEnabled);
                      triggerToast('📅 Added to Calendar!');
                    }}
                  >
                    <Download size={16} />
                    <span>Sync to iCal</span>
                  </button>

                  <button
                    className="ticket-action-btn"
                    style={{ justifyContent: 'center', padding: '10px 16px' }}
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      playAudio('pop', soundEnabled);
                      triggerToast('🔗 Event link copied to clipboard!');
                    }}
                  >
                    <Share2 size={16} />
                    <span>Share Pass</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Pop-up */}
      {toastMsg && (
        <div className="toast-notice">
          <CheckCircle2 size={18} style={{ color: '#34d399' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fab-create"
        onClick={() => {
          setEditingId(null);
          setForm(emptyForm);
          setIsModalOpen(true);
          playAudio('pop', soundEnabled);
        }}
        title="Host New Event"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

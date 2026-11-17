import type { Application, ApplicationInput, ListQuery, ListResult, Stats, User } from './types';
import { STATUSES } from './types';

// Demo mode keeps everything in this browser's localStorage, so the app works
// on a static deploy without a running API. Shapes match jobtrack-api exactly.

const KEY = 'jobtrack.demo.applications';
export const DEMO_USER: User = { id: 'demo', name: 'Demo user', email: 'demo@jobtrack.app' };

const day = 86_400_000;
const ago = (n: number) => new Date(Date.now() - n * day).toISOString();
const ahead = (n: number) => new Date(Date.now() + n * day).toISOString();

function seed(): Application[] {
  const rows: Array<Partial<Application> & Pick<Application, 'company' | 'role' | 'status'>> = [
    { company: 'Northwind Labs', role: 'Full Stack Developer', status: 'interview', location: 'Remote', salary: '$2,500/mo', appliedOn: ago(9), followUpOn: ahead(2), notes: 'Technical round on Thursday. Revise React Server Components and caching.' },
    { company: 'Harbor Health', role: 'Frontend Engineer (Next.js)', status: 'applied', location: 'Karachi, hybrid', appliedOn: ago(6), followUpOn: ago(1), notes: 'Referred by a former teammate.' },
    { company: 'Tidewater Fintech', role: 'MERN Stack Developer', status: 'applied', location: 'Remote', salary: 'PKR 350k', appliedOn: ago(4), followUpOn: ahead(3) },
    { company: 'Lumen Studio', role: 'React Developer', status: 'offer', location: 'Remote', salary: '$3,000/mo', appliedOn: ago(21), notes: 'Offer received. Reply by Friday.' },
    { company: 'Cobalt Commerce', role: 'Node.js Backend Engineer', status: 'rejected', location: 'Lahore, onsite', appliedOn: ago(25), notes: 'Looking for 5+ years of Go. Ask for feedback.' },
    { company: 'Brightline AI', role: 'Full Stack Engineer, AI products', status: 'wishlist', location: 'Remote', notes: 'Strong fit. Tailor the CV around automation work.' },
    { company: 'Saffron Logistics', role: 'Software Engineer (Night shift)', status: 'interview', location: 'Karachi, onsite', salary: 'PKR 280k', appliedOn: ago(12), followUpOn: ahead(1) },
    { company: 'Orbit Learning', role: 'Next.js Developer', status: 'applied', location: 'Remote', appliedOn: ago(2) },
    { company: 'Mosaic Media', role: 'Frontend Developer', status: 'wishlist', location: 'Dubai, remote', notes: 'Opens applications next week.' },
    { company: 'Quarry Systems', role: 'MERN Developer', status: 'rejected', location: 'Remote', appliedOn: ago(30) },
    { company: 'Pinecrest SaaS', role: 'Full Stack Developer (TypeScript)', status: 'applied', location: 'Remote', appliedOn: ago(11), followUpOn: ago(3) },
  ];
  return rows.map((r, i) => {
    const created = r.appliedOn ?? ago(i);
    return { _id: `demo-${i + 1}`, createdAt: created, updatedAt: created, ...r } as Application;
  });
}

function read(): Application[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    /* storage unavailable or corrupt: fall through to a fresh seed */
  }
  const fresh = seed();
  write(fresh);
  return fresh;
}

function write(rows: Application[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* ignore: demo still works for this session */
  }
}

export function resetDemo() {
  write(seed());
}

const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120));

export const demo = {
  async list(q: ListQuery = {}): Promise<ListResult> {
    const { status, search, sort = 'newest', page = 1, limit = 20 } = q;
    let rows = read();
    if (status) rows = rows.filter((r) => r.status === status);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) => r.company.toLowerCase().includes(s) || r.role.toLowerCase().includes(s));
    }
    const time = (r: Application) => new Date(r.appliedOn ?? r.createdAt ?? 0).getTime();
    rows.sort((a, b) =>
      sort === 'company' ? a.company.localeCompare(b.company) : sort === 'oldest' ? time(a) - time(b) : time(b) - time(a)
    );
    const total = rows.length;
    const items = rows.slice((page - 1) * limit, page * limit);
    return wait({ items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  },

  async create(input: ApplicationInput): Promise<Application> {
    const now = new Date().toISOString();
    const app: Application = { ...input, status: input.status ?? 'applied', appliedOn: input.appliedOn ?? now, _id: `demo-${Date.now()}`, createdAt: now, updatedAt: now };
    write([app, ...read()]);
    return wait(app);
  },

  async update(id: string, patch: Partial<ApplicationInput>): Promise<Application> {
    const rows = read();
    const i = rows.findIndex((r) => r._id === id);
    if (i === -1) throw new Error('Application not found');
    rows[i] = { ...rows[i], ...patch, updatedAt: new Date().toISOString() };
    write(rows);
    return wait(rows[i]);
  },

  async remove(id: string): Promise<void> {
    write(read().filter((r) => r._id !== id));
    return wait(undefined);
  },

  async stats(): Promise<Stats> {
    const rows = read();
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Stats['byStatus'];
    rows.forEach((r) => (byStatus[r.status] += 1));
    const sent = byStatus.applied + byStatus.interview + byStatus.offer + byStatus.rejected;
    const responded = byStatus.interview + byStatus.offer + byStatus.rejected;
    const now = Date.now();
    const followUpsDue = rows.filter((r) => r.status === 'applied' && r.followUpOn && new Date(r.followUpOn).getTime() <= now).length;
    return wait({ total: rows.length, byStatus, responseRate: sent ? Math.round((responded / sent) * 100) : 0, followUpsDue });
  },
};

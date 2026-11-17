'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationDrawer } from '@/components/ApplicationDrawer';
import { Board } from '@/components/Board';
import { ListView } from '@/components/ListView';
import { PipelineRibbon } from '@/components/PipelineRibbon';
import { Button, Logo, fieldBase } from '@/components/ui';
import { applications, currentUser, getMode, signOut } from '@/lib/api';
import type { Application, ApplicationInput, ListQuery, Stats, Status, User } from '@/lib/types';

type View = 'board' | 'list';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [boardItems, setBoardItems] = useState<Application[]>([]);
  const [list, setList] = useState({ items: [] as Application[], page: 1, pages: 1, total: 0 });
  const [view, setView] = useState<View>('board');
  const [status, setStatus] = useState<Status | undefined>();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<NonNullable<ListQuery['sort']>>('newest');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');
  const isDemo = getMode() === 'demo';

  useEffect(() => {
    currentUser().then((u) => (u ? setUser(u) : router.replace('/')));
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const q = { status, search: search.trim() || undefined, sort };
      const [s, board, rows] = await Promise.all([
        applications.stats(),
        applications.list({ ...q, page: 1, limit: 100 }),
        applications.list({ ...q, page, limit: 8 }),
      ]);
      setStats(s);
      setBoardItems(board.items);
      setList({ items: rows.items, page: rows.page, pages: Math.max(rows.pages, 1), total: rows.total });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your applications.');
    }
  }, [status, search, sort, page]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(refresh, search ? 200 : 0);
    return () => clearTimeout(t);
  }, [user, refresh, search]);

  useEffect(() => setPage(1), [status, search, sort]);

  const openNew = useCallback(() => {
    setEditing(null);
    setDrawerOpen(true);
  }, []);
  const openEdit = useCallback((a: Application) => {
    setEditing(a);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  async function save(input: ApplicationInput, id?: string) {
    if (id) await applications.update(id, input);
    else await applications.create(input);
    await refresh();
  }

  async function remove(id: string) {
    await applications.remove(id);
    await refresh();
  }

  async function move(id: string, to: Status) {
    const current = boardItems.find((a) => a._id === id);
    if (!current || current.status === to) return;
    setBoardItems((rows) => rows.map((a) => (a._id === id ? { ...a, status: to } : a)));
    try {
      await applications.update(id, { status: to });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not move that application.');
      await refresh();
    }
  }

  const firstName = useMemo(() => user?.name.split(' ')[0] ?? '', [user]);

  if (!user) {
    return <div className="grid min-h-screen place-items-center text-ink-faint">Loading your pipeline…</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo className="text-ink" />
          <div className="flex items-center gap-3 text-sm">
            {isDemo && <span className="hidden rounded-md bg-interview/15 px-2 py-1 font-medium text-[#9a6200] sm:inline">Sample data</span>}
            <span className="hidden text-ink-soft sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace('/');
              }}
              className="rounded-md px-2.5 py-1.5 font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {firstName === 'Demo' ? 'Your job hunt' : `${firstName}'s job hunt`}
            </h1>
            {stats && (
              <p className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-ink-soft">
                <span>
                  <strong className="font-display text-xl text-ink">{stats.total}</strong> tracked
                </span>
                <span>
                  <strong className="font-display text-xl text-ink">{stats.responseRate}%</strong> heard back
                </span>
                <span>
                  <strong className={`font-display text-xl ${stats.followUpsDue ? 'text-[#9a6200]' : 'text-ink'}`}>{stats.followUpsDue}</strong>{' '}
                  {stats.followUpsDue === 1 ? 'follow-up due' : 'follow-ups due'}
                </span>
              </p>
            )}
          </div>
          <Button onClick={openNew}>Add application</Button>
        </div>

        <div className="mt-8">{stats && <PipelineRibbon stats={stats} active={status} onSelect={setStatus} />}</div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="grid grid-cols-2 rounded-lg bg-ink/5 p-1 text-sm font-semibold" role="tablist" aria-label="View">
            {(['board', 'list'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-md px-4 py-1.5 transition-colors ${view === v ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft'}`}
              >
                {v === 'board' ? 'Board' : 'List'}
              </button>
            ))}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role"
              aria-label="Search company or role"
              className={`${fieldBase} min-w-0 flex-1 sm:w-64 sm:flex-none`}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort"
              className={`${fieldBase} shrink-0 pr-8`}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company A to Z</option>
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rejected/10 px-3 py-2 text-sm text-rejected">
            {error}
          </p>
        )}

        <div className="mt-4">
          {stats && stats.total === 0 ? (
            <div className="rounded-xl border border-dashed border-rule bg-paper px-6 py-16 text-center">
              <h2 className="font-display text-2xl font-bold">Your pipeline is empty</h2>
              <p className="mx-auto mt-2 max-w-sm text-ink-soft">Add the first job you applied for. You can drag it between stages as things move.</p>
              <Button className="mt-6" onClick={openNew}>
                Add application
              </Button>
            </div>
          ) : view === 'board' ? (
            <Board items={boardItems} onOpen={openEdit} onMove={move} />
          ) : (
            <ListView items={list.items} page={list.page} pages={list.pages} total={list.total} onPage={setPage} onOpen={openEdit} />
          )}
        </div>
      </main>

      <ApplicationDrawer app={editing} open={drawerOpen} onClose={closeDrawer} onSave={save} onDelete={remove} />
    </div>
  );
}

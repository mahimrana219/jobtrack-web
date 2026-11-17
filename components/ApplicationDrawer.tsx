'use client';

import { useEffect, useRef, useState } from 'react';
import type { Application, ApplicationInput, Status } from '@/lib/types';
import { STATUSES, STATUS_LABEL } from '@/lib/types';
import { toDateInput } from '@/lib/format';
import { Button, Field, inputClass, stageColor } from './ui';

const empty: ApplicationInput = { company: '', role: '', status: 'applied', location: '', salary: '', jobUrl: '', notes: '' };

export function ApplicationDrawer({
  app,
  open,
  onClose,
  onSave,
  onDelete,
}: {
  app: Application | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: ApplicationInput, id?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState<ApplicationInput>(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(app ? { ...empty, ...app } : { ...empty, appliedOn: new Date().toISOString() });
    setError('');
    setConfirmDelete(false);
    setTimeout(() => first.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, app, onClose]);

  if (!open) return null;

  const set = <K extends keyof ApplicationInput>(k: K, v: ApplicationInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setDate = (k: 'appliedOn' | 'followUpOn', v: string) => set(k, v ? new Date(`${v}T09:00:00`).toISOString() : undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setError('Add a company and a role to save this application.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { _id: _ignore, createdAt: _c, updatedAt: _u, ...input } = form as Application;
      await onSave(input, app?._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <form onSubmit={submit} className="drawer-in relative flex h-full w-full max-w-md flex-col bg-paper">
        <header className="flex items-center justify-between border-b border-rule px-6 py-4">
          <h2 id="drawer-title" className="font-display text-xl font-bold">
            {app ? 'Edit application' : 'Add application'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-ink-soft hover:bg-ink/5">
            Close
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <Field label="Company">
            <input ref={first} className={inputClass} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="e.g. Northwind Labs" />
          </Field>
          <Field label="Role">
            <input className={inputClass} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Full Stack Developer" />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Stage</legend>
            <div className="grid grid-cols-5 gap-1 rounded-lg bg-porcelain p-1">
              {STATUSES.map((s: Status) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  aria-pressed={form.status === s}
                  className={`rounded-md px-1 py-2 text-xs font-semibold transition-colors ${
                    form.status === s ? 'bg-paper text-ink ring-1 ring-rule' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span className="mx-auto mb-1 block h-1.5 w-6 rounded-full" style={{ background: stageColor(s), opacity: form.status === s ? 1 : 0.45 }} />
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <input className={inputClass} value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Remote" />
            </Field>
            <Field label="Salary">
              <input className={inputClass} value={form.salary ?? ''} onChange={(e) => set('salary', e.target.value)} placeholder="e.g. $2,500/mo" />
            </Field>
            <Field label="Applied on">
              <input type="date" className={inputClass} value={toDateInput(form.appliedOn)} onChange={(e) => setDate('appliedOn', e.target.value)} />
            </Field>
            <Field label="Follow up on">
              <input type="date" className={inputClass} value={toDateInput(form.followUpOn)} onChange={(e) => setDate('followUpOn', e.target.value)} />
            </Field>
          </div>

          <Field label="Job post link">
            <input type="url" className={inputClass} value={form.jobUrl ?? ''} onChange={(e) => set('jobUrl', e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Notes" hint="Interview dates, who referred you, what to prepare.">
            <textarea
              rows={4}
              className={`${inputClass} h-auto py-2`}
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              maxLength={2000}
            />
          </Field>

        </div>

        {error && (
          <p role="alert" className="mx-6 mb-0 mt-3 rounded-lg bg-rejected/10 px-3 py-2 text-sm text-rejected">
            {error}
          </p>
        )}
        <footer className="flex items-center justify-between gap-2 border-t border-rule px-6 py-4">
          {app ? (
            confirmDelete ? (
              <span className="flex items-center gap-1 text-sm">
                Delete for good?
                <Button type="button" variant="danger" className="h-9 px-3" onClick={() => onDelete(app._id).then(onClose)}>
                  Delete
                </Button>
                <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => setConfirmDelete(false)}>
                  Keep
                </Button>
              </span>
            ) : (
              <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )
          ) : (
            <span />
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : app ? 'Save changes' : 'Add application'}
          </Button>
        </footer>
      </form>
    </div>
  );
}

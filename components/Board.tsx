'use client';

import { useState } from 'react';
import type { Application, Status } from '@/lib/types';
import { STATUSES, STATUS_LABEL } from '@/lib/types';
import { isFollowUpDue, relative } from '@/lib/format';
import { stageColor } from './ui';

export function Board({
  items,
  onOpen,
  onMove,
}: {
  items: Application[];
  onOpen: (a: Application) => void;
  onMove: (id: string, to: Status) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="grid min-w-[1000px] grid-cols-5 gap-3">
        {STATUSES.map((s) => {
          const col = items.filter((a) => a.status === s);
          return (
            <section
              key={s}
              aria-label={STATUS_LABEL[s]}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(s);
              }}
              onDragLeave={() => setOver((o) => (o === s ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || dragId;
                setOver(null);
                setDragId(null);
                if (id) onMove(id, s);
              }}
              className={`flex min-h-72 flex-col rounded-xl border bg-paper/60 transition-colors ${
                over === s ? 'border-cobalt bg-cobalt/5' : 'border-rule'
              }`}
            >
              <header className="flex items-center justify-between border-b border-rule px-3 py-2.5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: stageColor(s) }} aria-hidden />
                  {STATUS_LABEL[s]}
                </h3>
                <span className="text-sm text-ink-faint">{col.length}</span>
              </header>
              <ol className="flex flex-1 flex-col gap-2 p-2">
                {col.map((a) => (
                  <li key={a._id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', a._id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDragId(a._id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOver(null);
                      }}
                      onClick={() => onOpen(a)}
                      className={`w-full cursor-grab rounded-lg border border-rule bg-paper p-3 text-left transition hover:border-ink/25 active:cursor-grabbing ${
                        dragId === a._id ? 'opacity-40' : ''
                      }`}
                      style={{ boxShadow: `inset 3px 0 0 ${stageColor(a.status)}` }}
                    >
                      <span className="block font-display text-[17px] font-bold leading-tight">{a.company}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{a.role}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-ink-faint">
                        {a.location && <span>{a.location}</span>}
                        {a.appliedOn && a.status !== 'wishlist' && <span>Applied {relative(a.appliedOn)}</span>}
                      </span>
                      {a.status === 'applied' && isFollowUpDue(a.followUpOn) && (
                        <span className="mt-2 inline-block rounded-md bg-interview/15 px-2 py-0.5 text-xs font-semibold text-[#9a6200]">
                          Follow-up due
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {col.length === 0 && (
                  <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-rule p-4 text-center text-xs text-ink-faint">
                    Drag a card here
                  </li>
                )}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

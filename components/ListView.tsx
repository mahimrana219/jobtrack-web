'use client';

import type { Application } from '@/lib/types';
import { isFollowUpDue, shortDate } from '@/lib/format';
import { StageTag } from './ui';

export function ListView({
  items,
  page,
  pages,
  total,
  onPage,
  onOpen,
}: {
  items: Application[];
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
  onOpen: (a: Application) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-paper">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="border-b border-rule text-sm text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Applied</th>
              <th className="px-4 py-3 font-medium">Follow up</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id} className="border-b border-rule last:border-0 hover:bg-porcelain">
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onOpen(a)} className="font-display font-bold hover:text-cobalt">
                    {a.company}
                  </button>
                  {a.location && <span className="block text-xs text-ink-faint">{a.location}</span>}
                </td>
                <td className="px-4 py-3 text-ink-soft">{a.role}</td>
                <td className="px-4 py-3">
                  <StageTag status={a.status} />
                </td>
                <td className="px-4 py-3 text-ink-soft">{a.status === 'wishlist' ? '' : shortDate(a.appliedOn)}</td>
                <td className="px-4 py-3">
                  {a.followUpOn && (
                    <span className={a.status === 'applied' && isFollowUpDue(a.followUpOn) ? 'font-semibold text-[#9a6200]' : 'text-ink-soft'}>
                      {shortDate(a.followUpOn)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between border-t border-rule px-4 py-2.5 text-sm text-ink-soft">
        <span>
          {total} {total === 1 ? 'application' : 'applications'}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="rounded-md px-2.5 py-1 hover:bg-ink/5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-1">
            Page {page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            className="rounded-md px-2.5 py-1 hover:bg-ink/5 disabled:opacity-40"
          >
            Next
          </button>
        </span>
      </footer>
    </div>
  );
}

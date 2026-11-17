'use client';

import type { Stats, Status } from '@/lib/types';
import { STATUSES, STATUS_LABEL } from '@/lib/types';
import { stageColor } from './ui';

// The signature element: the whole job hunt as one ribbon, each stage as wide
// as its share of applications. Click a stage to filter everything below it.
export function PipelineRibbon({
  stats,
  active,
  onSelect,
}: {
  stats: Stats;
  active?: Status;
  onSelect?: (s: Status | undefined) => void;
}) {
  const total = Math.max(stats.total, 1);
  const stages = STATUSES.filter((s) => stats.byStatus[s] > 0);

  return (
    <div>
      <div className="ribbon-grow flex h-16 w-full gap-1 sm:h-20" role="group" aria-label="Applications by stage">
        {stages.map((s) => {
          const n = stats.byStatus[s];
          const dim = active && active !== s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelect?.(active === s ? undefined : s)}
              aria-pressed={active === s}
              title={`${STATUS_LABEL[s]}: ${n}`}
              className="group relative min-w-10 overflow-hidden rounded-md text-left text-white transition-opacity first:rounded-l-xl last:rounded-r-xl"
              style={{ flexGrow: n / total, flexBasis: 0, background: stageColor(s), opacity: dim ? 0.28 : 1 }}
            >
              <span className="absolute bottom-2 left-3 font-display text-2xl font-bold leading-none sm:text-3xl">{n}</span>
            </button>
          );
        })}
        {stages.length === 0 && <div className="flex-1 rounded-xl border-2 border-dashed border-rule" />}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {STATUSES.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onSelect?.(active === s ? undefined : s)}
              className={`inline-flex items-center gap-1.5 text-sm ${active === s ? 'font-semibold text-ink' : 'text-ink-soft hover:text-ink'}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: stageColor(s) }} aria-hidden />
              {STATUS_LABEL[s]} <span className="text-ink-faint">{stats.byStatus[s]}</span>
            </button>
          </li>
        ))}
        {active && (
          <li>
            <button type="button" onClick={() => onSelect?.(undefined)} className="text-sm font-medium text-cobalt hover:underline">
              Show all stages
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

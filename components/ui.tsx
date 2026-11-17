import type { Status } from '@/lib/types';
import { STATUS_LABEL } from '@/lib/types';

export const stageColor = (s: Status) => `var(--color-${s})`;

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <rect x="6" y="13" width="5" height="6" rx="1.5" fill="#8b7cf6" />
        <rect x="12" y="13" width="7" height="6" rx="1.5" fill="#2f7df6" />
        <rect x="20" y="13" width="3" height="6" rx="1.5" fill="#e99a0b" />
        <rect x="24" y="13" width="2" height="6" rx="1" fill="#10a37f" />
      </svg>
      JobTrack
    </span>
  );
}

export function StageTag({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <span className="h-2 w-2 rounded-full" style={{ background: stageColor(status) }} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-cobalt text-white hover:bg-cobalt-deep disabled:opacity-60',
    ghost: 'bg-transparent text-ink hover:bg-ink/5',
    danger: 'bg-transparent text-rejected hover:bg-rejected/10',
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[15px] font-semibold transition-colors ${styles} ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export const fieldBase =
  'h-10 rounded-lg border border-rule bg-paper px-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-cobalt focus:outline-none focus:ring-2 focus:ring-cobalt/20';

export const inputClass = `${fieldBase} w-full`;

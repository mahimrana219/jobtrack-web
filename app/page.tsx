'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PipelineRibbon } from '@/components/PipelineRibbon';
import { Button, Field, Logo, inputClass } from '@/components/ui';
import { apiConfigured, currentUser, register, signIn, startDemo } from '@/lib/api';
import type { Stats } from '@/lib/types';

const sample: Stats = {
  total: 34,
  byStatus: { wishlist: 6, applied: 16, interview: 7, offer: 2, rejected: 3 },
  responseRate: 43,
  followUpsDue: 4,
};

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    currentUser().then((u) => u && router.replace('/dashboard'));
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (tab === 'signin') await signIn(email, password);
      else await register(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      const fields = (err as { fields?: string[] }).fields;
      setError(fields?.length ? fields.join('. ') : err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  function tryDemo() {
    startDemo();
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.25fr_1fr]">
      <section className="flex flex-col justify-between bg-ink px-6 py-8 text-white sm:px-12 lg:min-h-screen lg:py-12">
        <Logo className="text-white [&_svg>rect:first-child]:fill-white/10" />

        <div className="my-14 max-w-xl lg:my-0">
          <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
            Every application, one pipeline.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
            Log each job you apply for, drag it forward as replies come in, and see who you still owe a follow-up.
          </p>

          <div className="mt-10 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 [&_li_button]:text-white/70 [&_li_button:hover]:text-white [&_.text-ink-faint]:text-white/40">
            <PipelineRibbon stats={sample} />
            <p className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/60">
              <span>
                <strong className="font-display text-2xl font-bold text-white">43%</strong> response rate
              </span>
              <span>
                <strong className="font-display text-2xl font-bold text-white">4</strong> follow-ups due
              </span>
            </p>
          </div>
        </div>

        <p className="hidden text-sm text-white/40 lg:block">Built with Next.js, Node.js, Express and MongoDB.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-ink/5 p-1 text-sm font-semibold" role="tablist">
            {(['signin', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-md py-2 transition-colors ${tab === t ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft'}`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === 'register' && (
              <Field label="Name">
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} />
              </Field>
            )}
            <Field label="Email">
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </Field>
            <Field label="Password" hint={tab === 'register' ? 'At least 8 characters.' : undefined}>
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={tab === 'register' ? 8 : 1}
              />
            </Field>

            {error && (
              <p role="alert" className="rounded-lg bg-rejected/10 px-3 py-2 text-sm text-rejected">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy || !apiConfigured}>
              {busy ? 'One moment…' : tab === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
            {!apiConfigured && (
              <p className="text-xs leading-relaxed text-ink-faint">
                Sign in works when the JobTrack API is connected. This live demo runs on sample data instead.
              </p>
            )}
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
            <span className="h-px flex-1 bg-rule" />
            or
            <span className="h-px flex-1 bg-rule" />
          </div>

          <Button type="button" variant="ghost" className="w-full ring-1 ring-rule" onClick={tryDemo}>
            Explore with sample data
          </Button>
          <p className="mt-2 text-center text-xs text-ink-faint">Saved in this browser only. No account needed.</p>
        </div>
      </section>
    </main>
  );
}

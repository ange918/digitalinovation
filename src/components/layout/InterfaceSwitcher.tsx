'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ShieldCheck, Building2, UserCircle2, ArrowRightLeft } from 'lucide-react';
import { switchDemoAccountAction } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface InterfaceSwitcherProps {
  currentRole?: 'ADMIN' | 'RECRUITER' | 'TALENT' | null;
  className?: string;
}

export function InterfaceSwitcher({ currentRole, className }: InterfaceSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeRole: 'ADMIN' | 'RECRUITER' | 'TALENT' =
    pathname.startsWith('/admin')
      ? 'ADMIN'
      : pathname.startsWith('/recruteur')
        ? 'RECRUITER'
        : pathname.startsWith('/talent')
          ? 'TALENT'
          : currentRole || 'TALENT';

  const interfaces = [
    {
      role: 'ADMIN' as const,
      label: 'Interface Admin',
      sublabel: 'Modération & Analyse',
      href: '/admin',
      icon: ShieldCheck,
      color: 'border-royal-600 bg-royal-50/80 text-royal-900',
      tag: 'Validation centrale',
    },
    {
      role: 'RECRUITER' as const,
      label: 'Maison de Production',
      sublabel: 'Envoi d’offres & Conditions',
      href: '/recruteur',
      icon: Building2,
      color: 'border-ochre-600 bg-ochre-50/80 text-ochre-900',
      tag: 'Marques & Ateliers',
    },
    {
      role: 'TALENT' as const,
      label: 'Interface Utilisateur',
      sublabel: 'Offres publiées & Postulation',
      href: '/talent',
      icon: UserCircle2,
      color: 'border-emerald-600 bg-emerald-50/80 text-emerald-900',
      tag: 'Candidats & Modélistes',
    },
  ];

  function handleSwitch(role: 'ADMIN' | 'RECRUITER' | 'TALENT', targetHref: string) {
    startTransition(async () => {
      await switchDemoAccountAction(role);
      router.push(targetHref);
      router.refresh();
    });
  }

  return (
    <div
      id="fashlink-interface-switcher"
      className={cn(
        'border-b border-line bg-canvas-warm/70 px-4 py-2.5 backdrop-blur-sm',
        className,
      )}
    >
      <div className="container flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          <ArrowRightLeft className="h-3.5 w-3.5 text-royal-600" />
          <span>Bascule des 3 interfaces :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {interfaces.map((item) => {
            const isActive = activeRole === item.role;
            const Icon = item.icon;

            return (
              <button
                key={item.role}
                type="button"
                id={`switch-to-${item.role.toLowerCase()}`}
                disabled={isPending}
                onClick={() => handleSwitch(item.role, item.href)}
                className={cn(
                  'group flex items-center gap-2 rounded-full border px-3 py-1 text-left text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'border-midnight-900 bg-midnight-900 text-white shadow-sm ring-1 ring-midnight-900'
                    : 'border-line bg-white text-ink-muted hover:border-midnight-300 hover:text-midnight-900',
                  isPending && 'opacity-60 cursor-wait',
                )}
              >
                <Icon
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    isActive ? 'text-ochre-400' : 'text-ink-subtle group-hover:text-midnight-900',
                  )}
                />
                <span className="font-semibold">{item.label}</span>
                <span
                  className={cn(
                    'hidden rounded px-1.5 py-0.5 text-[10px] md:inline-block',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-canvas-warm text-ink-subtle group-hover:text-ink-muted',
                  )}
                >
                  {item.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

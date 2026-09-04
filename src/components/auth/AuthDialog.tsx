'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { AlertIcon, XIcon } from '@/components/ui/Icons';
import { loginAction, registerAction } from '@/app/actions/auth';
import { landingPathForRole } from '@/lib/routes';
import { cn } from '@/lib/utils';

type Mode = 'connexion' | 'inscription';
type Role = 'TALENT' | 'RECRUITER';

/**
 * Connexion et inscription en fenetre modale.
 *
 * Pilotee par l'URL (`?auth=connexion|inscription`, `&role=`, `&next=`) plutot
 * que par un etat global : chaque appel a l'action reste un simple lien, la
 * modale est partageable et profondement liable, et le retour navigateur la
 * ferme naturellement. C'est ce qui permet de tout garder sur une seule page.
 */
export function AuthDialog() {
  const router = useRouter();
  const params = useSearchParams();

  const auth = params.get('auth');
  const mode: Mode | null =
    auth === 'connexion' || auth === 'inscription' ? auth : null;

  const nextPath = params.get('next');
  const initialRole: Role = params.get('role') === 'recruteur' ? 'RECRUITER' : 'TALENT';

  const [role, setRole] = useState<Role>(initialRole);
  /**
   * Champs controles.
   *
   * Indispensable ici : sans etat, un rendu declenche par une erreur de
   * validation reinitialise les `<input>` non controles et l'utilisateur perd
   * tout ce qu'il a saisi.
   */
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Le role vient de l'URL : il doit suivre si l'utilisateur ouvre la modale
  // depuis « Je recrute » apres l'avoir ouverte depuis « Je cherche un poste ».
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (!mode) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    document.addEventListener('keydown', onKeyDown);
    // Bloque le defilement de l'arriere-plan pendant l'ouverture.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (!mode) return null;

  function close() {
    setError(null);
    // Retire les parametres d'authentification en conservant le reste.
    const rest = new URLSearchParams(params.toString());
    rest.delete('auth');
    rest.delete('role');
    rest.delete('next');
    const qs = rest.toString();
    router.push(qs ? `/?${qs}` : '/', { scroll: false });
  }

  function switchMode(target: Mode) {
    setError(null);
    const search = new URLSearchParams();
    search.set('auth', target);
    if (role === 'RECRUITER') search.set('role', 'recruteur');
    if (nextPath) search.set('next', nextPath);
    router.push(`/?${search.toString()}`, { scroll: false });
  }

  /**
   * Soumission via `onSubmit` plutot que via la prop `action` du formulaire :
   * React 19 reinitialise un formulaire passe en `action` des que l'action se
   * termine, y compris en erreur.
   *
   * Le formulaire porte `method="post"` : si le JavaScript n'a pas encore
   * charge, la soumission native part en POST et non en GET. Sans cela, le
   * navigateur ecrirait le mot de passe en clair dans l'URL — donc dans
   * l'historique, les journaux serveur et l'en-tete Referer.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (mode === 'connexion') {
        const result = await loginAction({
          email: values.email,
          password: values.password,
        });

        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(nextPath ?? landingPathForRole(result.data.role));
        return;
      }

      const result = await registerAction({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        role,
        companyName: role === 'RECRUITER' ? values.companyName : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(nextPath ?? landingPathForRole(role));
    });
  }

  const isSignup = mode === 'inscription';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-midnight-950/50 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        // Ferme au clic sur le fond, pas sur le panneau.
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="my-auto w-full max-w-md animate-fade-in-up rounded-panel border border-line bg-white p-6 shadow-panel sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-title" className="font-serif text-title-lg text-midnight-900">
              {isSignup ? 'Rejoindre FASHLINK' : 'Content de vous revoir'}
            </h2>
            <p className="mt-1.5 text-body-sm text-ink-muted">
              {isSignup
                ? 'Quelques informations et votre profil entre dans la base.'
                : 'Connectez-vous pour retrouver votre espace.'}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="-m-2 shrink-0 rounded-pill p-2 text-ink-faint transition-colors hover:bg-canvas-alt hover:text-midnight-900"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ---- Choix du type de compte ---- */}
        {isSignup && (
          <div className="mt-6">
            <p className="fl-overline">Je suis</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <RoleTile
                active={role === 'TALENT'}
                title="Un talent"
                hint="Je cherche un poste"
                onClick={() => setRole('TALENT')}
              />
              <RoleTile
                active={role === 'RECRUITER'}
                title="Une maison"
                hint="Je recrute"
                onClick={() => setRole('RECRUITER')}
              />
            </div>
          </div>
        )}

        <form method="post" onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="firstName"
                label="Prénom"
                autoComplete="given-name"
                required
                value={values.firstName}
                onValueChange={(v) => setValues((s) => ({ ...s, firstName: v }))}
              />
              <Field
                name="lastName"
                label="Nom"
                autoComplete="family-name"
                required
                value={values.lastName}
                onValueChange={(v) => setValues((s) => ({ ...s, lastName: v }))}
              />
            </div>
          )}

          {isSignup && role === 'RECRUITER' && (
            <Field
              name="companyName"
              value={values.companyName}
              onValueChange={(v) => setValues((s) => ({ ...s, companyName: v }))}
              label="Nom de la maison"
              autoComplete="organization"
              placeholder="Maison Adjovi"
              required
            />
          )}

          <Field
            name="email"
              value={values.email}
              onValueChange={(v) => setValues((s) => ({ ...s, email: v }))}
            type="email"
            label="Adresse e-mail"
            autoComplete="email"
            placeholder="vous@exemple.bj"
            required
          />

          {isSignup && (
            <Field
              name="phone"
              value={values.phone}
              onValueChange={(v) => setValues((s) => ({ ...s, phone: v }))}
              type="tel"
              label="Téléphone (facultatif)"
              autoComplete="tel"
              placeholder="+22997000000"
              hint="Format international. Sert au rapprochement Mobile Money."
            />
          )}

          <Field
            name="password"
              value={values.password}
              onValueChange={(v) => setValues((s) => ({ ...s, password: v }))}
            type="password"
            label="Mot de passe"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            hint={
              isSignup
                ? '10 caractères minimum, avec majuscule, minuscule et chiffre.'
                : undefined
            }
          />

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-card border border-danger-500/20 bg-danger-50 p-3 text-body-sm text-danger-700"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={isPending}>
            {isSignup ? 'Créer mon compte' : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-5 text-center text-body-sm text-ink-muted">
          {isSignup ? 'Vous avez déjà un compte ?' : 'Pas encore inscrit ?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'connexion' : 'inscription')}
            className="font-semibold text-royal-600 underline-offset-2 hover:underline"
          >
            {isSignup ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  );
}

function RoleTile({
  active,
  title,
  hint,
  onClick,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-card border p-3 text-left transition-all duration-150 ease-editorial',
        active
          ? 'border-royal-300 bg-royal-50 ring-1 ring-royal-200'
          : 'border-line hover:border-line-strong hover:bg-canvas-alt',
      )}
    >
      <span
        className={cn(
          'block text-body-sm font-semibold',
          active ? 'text-royal-700' : 'text-midnight-900',
        )}
      >
        {title}
      </span>
      <span className="mt-0.5 block text-caption text-ink-subtle">{hint}</span>
    </button>
  );
}

function Field({
  name,
  label,
  hint,
  value,
  onValueChange,
  type = 'text',
  ...props
}: {
  name: string;
  label: string;
  hint?: string;
  value: string;
  onValueChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="block">
      <span className="block text-caption font-medium text-ink-muted">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          'mt-1.5 h-11 w-full rounded-card border border-line bg-canvas px-3.5',
          'text-body-sm text-midnight-900 placeholder:text-ink-faint',
          'transition-colors duration-150 ease-editorial',
          'focus:border-royal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-royal-500/20',
        )}
        {...props}
      />
      {hint && <span className="mt-1 block text-caption text-ink-subtle">{hint}</span>}
    </label>
  );
}

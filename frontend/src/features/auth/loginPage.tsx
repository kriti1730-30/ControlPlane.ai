import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Globe2,
  Headphones,
  ShieldCheck,
} from 'lucide-react';

const JURISDICTION_STORAGE_KEY = 'controlplane_jurisdiction';
const SESSION_STORAGE_KEY = 'controlplane_session';

type WorkspaceRoute = '/employee' | '/customer-operations';
type DemoKey = 'employee' | 'support';

type DemoIdentity = {
  key: DemoKey;
  label: string;
  description: string;
  email: string;
  password: string;
  role: 'employee' | 'support_operator';
  workspace: WorkspaceRoute;
  icon: typeof BriefcaseBusiness;
};

type JurisdictionProfile = {
  id: string;
  label: string;
  code: string;
  description: string;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const DEMO_PASSWORD = 'demo123';

const DEMO_IDENTITIES: DemoIdentity[] = [
  {
    key: 'employee',
    label: 'Employee',
    description: 'Internal AI workspace',
    email: 'employee@controlplane.demo',
    password: DEMO_PASSWORD,
    role: 'employee',
    workspace: '/employee',
    icon: BriefcaseBusiness,
  },
  {
    key: 'support',
    label: 'Support Operator',
    description: 'Customer operations workspace',
    email: 'support@controlplane.demo',
    password: DEMO_PASSWORD,
    role: 'support_operator',
    workspace: '/customer-operations',
    icon: Headphones,
  },
];

const JURISDICTIONS: JurisdictionProfile[] = [
  {
    id: 'india',
    label: 'India',
    code: 'IN',
    description: 'Illustrative enterprise policy profile',
  },
  {
    id: 'united-states',
    label: 'United States',
    code: 'US',
    description: 'Illustrative enterprise policy profile',
  },
  {
    id: 'european-union',
    label: 'European Union',
    code: 'EU',
    description: 'Illustrative enterprise policy profile',
  },
  {
    id: 'singapore',
    label: 'Singapore',
    code: 'SG',
    description: 'Illustrative enterprise policy profile',
  },
];

const DETECTED_JURISDICTION = JURISDICTIONS[0];

function findJurisdiction(value?: string) {
  if (!value) return null;

  const normalized = value.toLowerCase();

  return (
    JURISDICTIONS.find(
      (jurisdiction) =>
        jurisdiction.id === normalized ||
        jurisdiction.code.toLowerCase() === normalized ||
        jurisdiction.label.toLowerCase() === normalized,
    ) ?? null
  );
}

function readStoredJurisdiction() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(JURISDICTION_STORAGE_KEY);

    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as {
        id?: string;
        code?: string;
        label?: string;
      };

      return (
        findJurisdiction(parsed.id) ??
        findJurisdiction(parsed.code) ??
        findJurisdiction(parsed.label)
      );
    } catch {
      return findJurisdiction(stored);
    }
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo-only persistence failure is intentionally non-fatal.
  }
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<DemoKey | null>(null);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jurisdiction, setJurisdiction] =
    useState<JurisdictionProfile | null>(readStoredJurisdiction);

  const [showJurisdictionModal, setShowJurisdictionModal] = useState(
    () => readStoredJurisdiction() === null,
  );

  const [showManualJurisdiction, setShowManualJurisdiction] = useState(false);
  const [manualJurisdictionId, setManualJurisdictionId] = useState(
    DETECTED_JURISDICTION.id,
  );

  const selectedManualJurisdiction =
    findJurisdiction(manualJurisdictionId) ?? DETECTED_JURISDICTION;

  useEffect(() => {
    if (!showJurisdictionModal || !showManualJurisdiction) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowManualJurisdiction(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showJurisdictionModal, showManualJurisdiction]);

  function clearFeedback() {
    setError('');
    setFieldErrors({});
  }

  function selectDemo(identity: DemoIdentity) {
    setEmail(identity.email);
    setPassword(identity.password);
    setSelectedDemo(identity.key);
    clearFeedback();
  }

  function confirmJurisdiction(profile: JurisdictionProfile) {
    writeLocalStorage(JURISDICTION_STORAGE_KEY, {
      id: profile.id,
      label: profile.label,
      code: profile.code,
      confirmedAt: new Date().toISOString(),
    });

    setJurisdiction(profile);
    setShowJurisdictionModal(false);
    setShowManualJurisdiction(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    const nextFieldErrors: FieldErrors = {};

    if (!trimmedEmail) {
      nextFieldErrors.email = 'Enter your work email or employee ID.';
    }

    if (!password) {
      nextFieldErrors.password = 'Enter your password.';
    }

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {


      setError('Complete the required fields to continue.');
      return;
    }

    if (!jurisdiction) {
      setShowJurisdictionModal(true);
      setError('Confirm your region before signing in.');
      return;
    }

    setIsSubmitting(true);

    const identity = DEMO_IDENTITIES.find(
      (demoIdentity) =>
        demoIdentity.email === trimmedEmail &&
        demoIdentity.password === password,
    );

    if (!identity) {
      setIsSubmitting(false);
      setSelectedDemo(null);
      setError('Invalid demo credentials. Use one of the test accounts below.');
      return;
    }

    writeLocalStorage(SESSION_STORAGE_KEY, {
      user: identity.email,
      role: identity.role,
      workspace: identity.workspace,
      jurisdiction: jurisdiction.id,
      signedInAt: new Date().toISOString(),
    });

    navigate(identity.workspace);
  }

  return (
    <main className="min-h-svh bg-[var(--cp-bg)] text-[var(--cp-text)]">
      <div className="mx-auto grid min-h-svh w-full max-w-[1440px] p-3 sm:p-4 lg:p-6">
        <div className="grid min-h-[calc(100svh-1.5rem)] overflow-hidden rounded-[24px] border border-[var(--cp-border)] bg-[var(--cp-surface)] shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:min-h-[calc(100svh-2rem)] lg:grid-cols-[1.08fr_0.92fr]">
          {/* LEFT — visual / brand panel */}
          <section className="relative hidden min-h-[680px] overflow-hidden lg:flex">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 48% 42%, rgba(145, 104, 255, 0.38), transparent 26%), radial-gradient(circle at 72% 24%, rgba(106, 76, 180, 0.24), transparent 30%), linear-gradient(145deg, #0d0b13 0%, #120d1d 48%, #09090b 100%)',
              }}
            />

            <div
              aria-hidden="true"
              className="absolute -left-[12%] top-[18%] h-[62%] w-[70%] rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(155, 110, 255, 0.36) 0%, rgba(77, 41, 131, 0.16) 42%, transparent 72%)',
              }}
            />

            <div
              aria-hidden="true"
              className="absolute bottom-[-18%] right-[-12%] h-[62%] w-[58%] rounded-full opacity-55 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(95, 69, 170, 0.28) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div className="flex items-center gap-3">
                <BrandMark compact />
                <span className="text-sm font-medium tracking-[-0.01em] text-white">
                  ControlPlane
                </span>
              </div>

              <div className="max-w-[440px]">
                

                <h1 className="max-w-[420px] text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl xl:text-[58px]">
                  ControlPlane.ai
                </h1>

                <p className="mt-6 max-w-[390px] text-sm leading-6 text-white/60 sm:text-[15px]">
                  ControlPlane continuously observes enterprise AI workflows
                  and applies the right level of control when evidence,
                  authority, or consequence demands it.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <ShieldCheck size={14} aria-hidden />
                <span>Controlled by policy. Auditable by design.</span>
              </div>
            </div>
          </section>

          {/* RIGHT — authentication */}
          <section className="flex min-h-full items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-[390px]">
              <div className="mb-8">
                <BrandMark className="lg:hidden" />

                <div className="mt-7">
                  <h2 className="text-[28px] font-semibold tracking-[-0.035em] sm:text-[32px]">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--cp-text-muted)]">
                    Sign in to continue to your enterprise workspace.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                aria-describedby={error ? 'signin-error' : undefined}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-medium text-[var(--cp-text)]"
                  >
                    Work email or employee ID
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSelectedDemo(null);
                      clearFeedback();
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? 'email-error' : undefined
                    }
                    placeholder="employee@controlplane.demo"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] px-4 text-sm text-[var(--cp-text)] outline-none transition placeholder:text-white/30 focus:border-[var(--cp-accent)] focus:ring-2 focus:ring-[var(--cp-accent-soft)]"
                  />

                  {fieldErrors.email && (
                    <p
                      id="email-error"
                      className="mt-2 text-xs text-red-300"
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-medium text-[var(--cp-text)]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setSelectedDemo(null);
                      clearFeedback();
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? 'password-error' : undefined
                    }
                    placeholder="Enter password"
                    className="mt-2 h-12 w-full rounded-[13px] border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] px-4 text-sm text-[var(--cp-text)] outline-none transition placeholder:text-white/30 focus:border-[var(--cp-accent)] focus:ring-2 focus:ring-[var(--cp-accent-soft)]"
                  />

                  {fieldErrors.password && (
                    <p
                      id="password-error"
                      className="mt-2 text-xs text-red-300"
                    >
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {error && (
                  <p
                    id="signin-error"
                    role="alert"
                    className="rounded-[12px] border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-xs leading-5 text-red-200"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || showJurisdictionModal}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-[var(--cp-accent)] px-4 text-sm font-medium text-[#0d0b12] transition hover:brightness-105 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                  {!isSubmitting && (
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--cp-border)]" />
                <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--cp-text-muted)]">
                  Demo
                </span>
                <div className="h-px flex-1 bg-[var(--cp-border)]" />
              </div>

              <div>
                <div className="mb-3">
                  <p className="text-[13px] font-medium">Use test credentials</p>
                  <p className="mt-1 text-xs text-[var(--cp-text-muted)]">
                    These accounts are for the prototype only.
                  </p>
                </div>

                <div className="space-y-2">
                  {DEMO_IDENTITIES.map((identity) => {
                    const Icon = identity.icon;
                    const selected = selectedDemo === identity.key;

                    return (
                      <button
                        key={identity.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => selectDemo(identity)}
                        disabled={showJurisdictionModal}
                        className={[
                          'flex w-full items-center gap-3 rounded-[13px] border px-3.5 py-3 text-left transition',
                          selected
                            ? 'border-[var(--cp-accent)] bg-[var(--cp-accent-soft)]'
                            : 'border-[var(--cp-border)] bg-transparent hover:border-[var(--cp-border-strong)] hover:bg-white/[0.025]',
                        ].join(' ')}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[var(--cp-border)] text-[var(--cp-accent)]">
                          <Icon size={16} strokeWidth={1.8} aria-hidden />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {identity.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--cp-text-muted)]">
                            {identity.description}
                          </span>
                        </span>

                        {selected && (
                          <span className="text-xs font-medium text-[var(--cp-accent)]">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3 text-[11px] text-[var(--cp-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 size={13} aria-hidden />
                  {jurisdiction
                    ? `${jurisdiction.label} · ${jurisdiction.code}`
                    : 'Region not confirmed'}
                </span>

                {jurisdiction && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowJurisdictionModal(true);
                      setShowManualJurisdiction(true);
                    }}
                    className="text-[var(--cp-text)] underline decoration-[var(--cp-border-strong)] underline-offset-4 transition hover:text-[var(--cp-accent)]"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {showJurisdictionModal && (
        <JurisdictionModal
          showManual={showManualJurisdiction}
          selectedManualJurisdiction={selectedManualJurisdiction}
          onShowManual={() => setShowManualJurisdiction(true)}
          onBackToDetected={() => setShowManualJurisdiction(false)}
          onSelectManual={setManualJurisdictionId}
          onConfirm={confirmJurisdiction}
        />
      )}
    </main>
  );
}

function BrandMark({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'flex items-center justify-center rounded-[10px] border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] text-[var(--cp-accent)]',
        compact ? 'h-9 w-9' : 'h-11 w-11',
        className,
      ].join(' ')}
    >
      <svg
        viewBox="0 0 32 32"
        className={compact ? 'h-5 w-5' : 'h-6 w-6'}
        fill="none"
      >
        <path
          d="M16 4.5L19.2 12.8L27.5 16L19.2 19.2L16 27.5L12.8 19.2L4.5 16L12.8 12.8L16 4.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M16 11.5L17.4 14.6L20.5 16L17.4 17.4L16 20.5L14.6 17.4L11.5 16L14.6 14.6L16 11.5Z"
          fill="currentColor"
          opacity="0.35"
        />
      </svg>
    </span>
  );
}

function JurisdictionModal({
  showManual,
  selectedManualJurisdiction,
  onShowManual,
  onBackToDetected,
  onSelectManual,
  onConfirm,
}: {
  showManual: boolean;
  selectedManualJurisdiction: JurisdictionProfile;
  onShowManual: () => void;
  onBackToDetected: () => void;
  onSelectManual: (id: string) => void;
  onConfirm: (profile: JurisdictionProfile) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="jurisdiction-title"
        aria-describedby="jurisdiction-description"
        className="w-full max-w-[420px] rounded-[18px] border border-[var(--cp-border)] bg-[var(--cp-surface)] p-5 text-[var(--cp-text)] shadow-[0_30px_100px_rgba(0,0,0,0.48)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] text-[var(--cp-accent)]">
            <Globe2 size={18} strokeWidth={1.8} aria-hidden />
          </span>

          <div>
            <h2 id="jurisdiction-title" className="text-base font-semibold">
              Region setup
            </h2>

            <p
              id="jurisdiction-description"
              className="mt-1 text-sm leading-6 text-[var(--cp-text-muted)]"
            >
              Choose the policy profile used for this demo session.
            </p>
          </div>
        </div>

        {!showManual ? (
          <>
            <div className="mt-5 rounded-[13px] border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--cp-text-muted)]">
                Region detected
              </p>

              <p className="mt-1 text-lg font-semibold">
                {DETECTED_JURISDICTION.label} · {DETECTED_JURISDICTION.code}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--cp-text-muted)]">
                {DETECTED_JURISDICTION.description}
              </p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                autoFocus
                onClick={() => onConfirm(DETECTED_JURISDICTION)}
                className="h-11 rounded-[12px] bg-[var(--cp-accent)] px-4 text-sm font-medium text-[#0d0b12] transition hover:brightness-105"
              >
                Confirm India
              </button>

              <button
                type="button"
                onClick={onShowManual}
                className="h-11 rounded-[12px] border border-[var(--cp-border)] px-4 text-sm font-medium transition hover:border-[var(--cp-border-strong)] hover:bg-white/[0.025]"
              >
                Set manually
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 space-y-2">
              {JURISDICTIONS.map((profile) => {
                const selected =
                  selectedManualJurisdiction.id === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectManual(profile.id)}
                    className={[
                      'w-full rounded-[12px] border px-3.5 py-3 text-left transition',
                      selected
                        ? 'border-[var(--cp-accent)] bg-[var(--cp-accent-soft)]'
                        : 'border-[var(--cp-border)] bg-[var(--cp-surface-raised)] hover:border-[var(--cp-border-strong)]',
                    ].join(' ')}
                  >
                    <span className="block text-sm font-medium">
                      {profile.label}
                    </span>

                    <span className="mt-0.5 block text-xs text-[var(--cp-text-muted)]">
                      {profile.code} · {profile.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] leading-5 text-[var(--cp-text-muted)]">
              Demo policy profiles are illustrative and not legal advice.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onConfirm(selectedManualJurisdiction)}
                className="h-11 rounded-[12px] bg-[var(--cp-accent)] px-4 text-sm font-medium text-[#0d0b12] transition hover:brightness-105"
              >
                Use {selectedManualJurisdiction.label}
              </button>

              <button
                type="button"
                onClick={onBackToDetected}
                className="h-11 rounded-[12px] border border-[var(--cp-border)] px-4 text-sm font-medium transition hover:border-[var(--cp-border-strong)] hover:bg-white/[0.025]"
              >
                Back
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
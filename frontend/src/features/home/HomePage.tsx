import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Globe2,
  Headphones,
  ShieldCheck,
  type LucideIcon,
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
  Icon: LucideIcon;
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
    Icon: Briefcase,
  },
  {
    key: 'support',
    label: 'Support Operator',
    description: 'Customer operations workspace',
    email: 'support@controlplane.demo',
    password: DEMO_PASSWORD,
    role: 'support_operator',
    workspace: '/customer-operations',
    Icon: Headphones,
  },
];

const JURISDICTIONS: JurisdictionProfile[] = [
  {
    id: 'india',
    label: 'India',
    code: 'IN',
    description: 'Demo policy profile for India',
  },
  {
    id: 'united-states',
    label: 'United States',
    code: 'US',
    description: 'Demo policy profile for the United States',
  },
  {
    id: 'european-union',
    label: 'European Union',
    code: 'EU',
    description: 'Demo policy profile for the European Union',
  },
  {
    id: 'singapore',
    label: 'Singapore',
    code: 'SG',
    description: 'Demo policy profile for Singapore',
  },
];

const DETECTED_JURISDICTION = JURISDICTIONS[0];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

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
      const parsed = JSON.parse(stored) as { id?: string; code?: string; label?: string };
      return findJurisdiction(parsed.id) ?? findJurisdiction(parsed.code) ?? findJurisdiction(parsed.label);
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
    return;
  }
}

function getInitialJurisdictionState() {
  const jurisdiction = readStoredJurisdiction();

  return {
    jurisdiction,
    showJurisdictionModal: jurisdiction === null,
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<DemoKey | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jurisdictionState, setJurisdictionState] = useState(getInitialJurisdictionState);
  const [showManualJurisdiction, setShowManualJurisdiction] = useState(false);
  const [manualJurisdictionId, setManualJurisdictionId] = useState(DETECTED_JURISDICTION.id);

  const { jurisdiction, showJurisdictionModal } = jurisdictionState;
  const selectedManualJurisdiction = findJurisdiction(manualJurisdictionId) ?? DETECTED_JURISDICTION;

  useEffect(() => {
    if (!showJurisdictionModal || !showManualJurisdiction) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowManualJurisdiction(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
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

    setJurisdictionState({
      jurisdiction: profile,
      showJurisdictionModal: false,
    });
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
      setJurisdictionState({
        jurisdiction: null,
        showJurisdictionModal: true,
      });
      setError('Confirm a demo jurisdiction before signing in.');
      return;
    }

    setIsSubmitting(true);

    const identity = DEMO_IDENTITIES.find(
      (demoIdentity) => demoIdentity.email === trimmedEmail && demoIdentity.password === password,
    );

    if (!identity) {
      setIsSubmitting(false);
      setSelectedDemo(null);
      setError('Invalid demo credentials. Use one of the test identities below.');
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
    <main className="relative h-svh overflow-y-auto bg-[var(--cp-bg)] px-4 py-8 text-[var(--cp-text)] sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-px bg-[var(--cp-border)]"
      />

      <div
        className={cx(
          'mx-auto flex min-h-full w-full max-w-[1120px] items-center justify-center',
          showJurisdictionModal && 'pointer-events-none select-none',
        )}
        aria-hidden={showJurisdictionModal ? true : undefined}
      >
        <section className="w-full max-w-[440px]" aria-labelledby="signin-title">
          <div className="mb-8 text-center">
            <BrandMark />
            <p className="mt-6 text-[13px] font-medium uppercase text-[var(--cp-accent)]">
              Enterprise AI control layer
            </p>
            <h1 id="signin-title" className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
              ControlPlane
            </h1>
            <p className="mx-auto mt-3 max-w-[340px] text-[15px] leading-6 text-[var(--cp-text-muted)]">
              Adaptive AI assurance for enterprise workflows
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            aria-describedby={error ? 'signin-error' : undefined}
            className="rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-6"
          >
            <fieldset disabled={showJurisdictionModal || isSubmitting} className="m-0 min-w-0 space-y-4 border-0 p-0">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--cp-text)]">
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
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  placeholder="employee@controlplane.demo"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] px-3.5 text-[15px] text-[var(--cp-text)] outline-none transition placeholder:text-[#787386] focus:border-[var(--cp-accent)] focus:ring-2 focus:ring-[var(--cp-accent-soft)]"
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-2 text-sm text-[#fca5a5]">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--cp-text)]">
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
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  placeholder="Enter password"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] px-3.5 text-[15px] text-[var(--cp-text)] outline-none transition placeholder:text-[#787386] focus:border-[var(--cp-accent)] focus:ring-2 focus:ring-[var(--cp-accent-soft)]"
                />
                {fieldErrors.password && (
                  <p id="password-error" className="mt-2 text-sm text-[#fca5a5]">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <p
                  id="signin-error"
                  role="alert"
                  className="rounded-md border border-[#7f1d1d] bg-[#2b1114] px-3 py-2 text-sm text-[#fecaca]"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--cp-accent)] px-4 text-sm font-semibold text-[#101014] transition hover:bg-[#b8a3ff] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in' : 'Sign in'}
                <ArrowRight size={16} strokeWidth={2} aria-hidden className="transition group-hover:translate-x-0.5" />
              </button>

              <div className="border-t border-[var(--cp-border)] pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--cp-text)]">Use test credentials</p>
                  <p className="text-xs text-[var(--cp-text-muted)]">Prototype only</p>
                </div>
                <div className="grid gap-2">
                  {DEMO_IDENTITIES.map((identity) => (
                    <DemoCredentialButton
                      key={identity.key}
                      identity={identity}
                      selected={selectedDemo === identity.key}
                      onSelect={() => selectDemo(identity)}
                    />
                  ))}
                </div>
              </div>
            </fieldset>
          </form>

          <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center text-xs text-[var(--cp-text-muted)] sm:flex-row">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} strokeWidth={2} aria-hidden />
              Enterprise AI entry
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[var(--cp-border-strong)] sm:block" aria-hidden />
            <span>
              Region profile:{' '}
              <span className="text-[var(--cp-text)]">
                {jurisdiction ? `${jurisdiction.label} · ${jurisdiction.code}` : 'Pending confirmation'}
              </span>
            </span>
          </div>
        </section>
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

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)] text-[var(--cp-accent)]"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
        <path d="M16 4.5L19.2 12.8L27.5 16L19.2 19.2L16 27.5L12.8 19.2L4.5 16L12.8 12.8L16 4.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 11.5L17.4 14.6L20.5 16L17.4 17.4L16 20.5L14.6 17.4L11.5 16L14.6 14.6L16 11.5Z" fill="currentColor" opacity="0.35" />
      </svg>
    </span>
  );
}

function DemoCredentialButton({
  identity,
  selected,
  onSelect,
}: {
  identity: DemoIdentity;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = identity.Icon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cx(
        'flex w-full flex-col items-start gap-2 rounded-md border px-3 py-3 text-left transition sm:flex-row sm:items-center sm:justify-between sm:gap-3',
        selected
          ? 'border-[var(--cp-accent)] bg-[var(--cp-accent-soft)]'
          : 'border-[var(--cp-border)] bg-[var(--cp-surface-raised)] hover:border-[var(--cp-border-strong)]',
      )}
    >
      <span className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--cp-border)] text-[var(--cp-accent)]"
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-[var(--cp-text)]">{identity.label}</span>
          <span className="block text-xs text-[var(--cp-text-muted)]">{identity.description}</span>
        </span>
      </span>
      <span className="max-w-full break-all text-xs text-[var(--cp-text-muted)] sm:shrink-0">{identity.email}</span>
    </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="jurisdiction-title"
        aria-describedby="jurisdiction-description"
        className="w-full max-w-[420px] rounded-lg border border-[var(--cp-border)] bg-[var(--cp-surface)] p-5 text-[var(--cp-text)] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] text-[var(--cp-accent)]"
          >
            <Globe2 size={17} strokeWidth={2} />
          </span>
          <div>
            <p id="jurisdiction-title" className="text-base font-semibold">
              Region setup
            </p>
            <p id="jurisdiction-description" className="mt-1 text-sm leading-6 text-[var(--cp-text-muted)]">
              Detecting your region to apply the appropriate compliance rules.
            </p>
          </div>
        </div>

        {!showManual ? (
          <>
            <div className="mt-5 rounded-md border border-[var(--cp-border)] bg-[var(--cp-surface-raised)] p-4">
              <p className="text-xs font-medium uppercase text-[var(--cp-text-muted)]">Region detected</p>
              <p className="mt-1 text-lg font-semibold">
                {DETECTED_JURISDICTION.label} · {DETECTED_JURISDICTION.code}
              </p>
              <p className="mt-1 text-sm text-[var(--cp-text-muted)]">{DETECTED_JURISDICTION.description}</p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                autoFocus
                onClick={() => onConfirm(DETECTED_JURISDICTION)}
                className="h-11 rounded-md bg-[var(--cp-accent)] px-4 text-sm font-semibold text-[#101014] transition hover:bg-[#b8a3ff] active:translate-y-px"
              >
                Confirm India
              </button>
              <button
                type="button"
                onClick={onShowManual}
                className="h-11 rounded-md border border-[var(--cp-border)] px-4 text-sm font-medium text-[var(--cp-text)] transition hover:border-[var(--cp-border-strong)] hover:bg-[var(--cp-surface-raised)]"
              >
                Set manually
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 grid gap-2" aria-label="Manual jurisdiction options">
              {JURISDICTIONS.map((profile) => {
                const selected = selectedManualJurisdiction.id === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectManual(profile.id)}
                    className={cx(
                      'rounded-md border px-3 py-3 text-left transition',
                      selected
                        ? 'border-[var(--cp-accent)] bg-[var(--cp-accent-soft)]'
                        : 'border-[var(--cp-border)] bg-[var(--cp-surface-raised)] hover:border-[var(--cp-border-strong)]',
                    )}
                  >
                    <span className="block text-sm font-medium">{profile.label}</span>
                    <span className="block text-xs text-[var(--cp-text-muted)]">
                      {profile.code} · {profile.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs leading-5 text-[var(--cp-text-muted)]">
              Demo policy profiles are illustrative and not legal advice.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onConfirm(selectedManualJurisdiction)}
                className="h-11 rounded-md bg-[var(--cp-accent)] px-4 text-sm font-semibold text-[#101014] transition hover:bg-[#b8a3ff] active:translate-y-px"
              >
                Use {selectedManualJurisdiction.label}
              </button>
              <button
                type="button"
                onClick={onBackToDetected}
                className="h-11 rounded-md border border-[var(--cp-border)] px-4 text-sm font-medium text-[var(--cp-text)] transition hover:border-[var(--cp-border-strong)] hover:bg-[var(--cp-surface-raised)]"
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

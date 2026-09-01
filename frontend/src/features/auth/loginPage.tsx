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
    label: 'Employee credentials',
    description: 'Internal AI workspace',
    email: 'employee@controlplane.demo',
    password: DEMO_PASSWORD,
    role: 'employee',
    workspace: '/employee',
    icon: BriefcaseBusiness,
  },
  {
    key: 'support',
    label: 'Support operator credentials',
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
    <main className="min-h-screen overflow-y-auto bg-white px-2 py-3 text-[#292722] sm:px-4 sm:py-5">
      <div className="mx-auto flex w-full justify-center">
        <div
          className="relative aspect-square w-full max-w-[1024px] overflow-hidden"
          style={{ width: 'min(100%, calc(100vh - 28px))' }}
        >
          <img
            src="/illustrations/login-hero.webp"
            alt="Illustrated ControlPlane login scene"
            className="absolute inset-0 h-full w-full object-contain select-none"
            draggable={false}
          />

          {/* Real interactive controls, visually embedded in the computer monitor. */}
          <section
            aria-label="ControlPlane sign in"
            className="absolute z-10"
            style={{
              left: '12.2%',
              top: '44.8%',
              width: '50.3%',
              height: '37.5%',
            }}
          >
            <div
              className="flex h-full w-full flex-col overflow-y-auto rounded-[18px] border border-[#d86726] bg-[#ff9448]/95 p-[4%] shadow-[0_10px_26px_rgba(151,70,25,0.25)] backdrop-blur-[1px] sm:rounded-[22px]"
            >
              <div className="mb-[3%]">
                <h1 className="text-[clamp(14px,2.2vw,30px)] font-semibold leading-[0.98] tracking-[-0.035em] text-[#51200b]">
                  Welcome,
                </h1>
                <p className="mt-0.5 text-[clamp(10px,1.45vw,19px)] font-medium leading-tight text-[#6b2b10]">
                  let&apos;s get signed in!
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                aria-describedby={error ? 'signin-error' : undefined}
                className="flex min-h-0 flex-1 flex-col gap-[3%]"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-[clamp(7px,1vw,12px)] font-semibold text-[#54210d]"
                  >
                    Work email / ID
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
                    className="h-[clamp(21px,3vw,40px)] w-full rounded-[clamp(6px,0.9vw,12px)] border border-[#efb48d] bg-white px-[3%] text-[clamp(8px,1.05vw,14px)] text-[#292722] outline-none placeholder:text-[#aaa79f] focus:border-[#8768dc] focus:ring-2 focus:ring-[#eeeaff]"
                  />
                  {fieldErrors.email && (
                    <p
                      id="email-error"
                      className="mt-1 text-[clamp(7px,0.85vw,11px)] text-red-700"
                    >
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-[clamp(7px,1vw,12px)] font-semibold text-[#54210d]"
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
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    placeholder="Enter password"
                    className="h-[clamp(21px,3vw,40px)] w-full rounded-[clamp(6px,0.9vw,12px)] border border-[#efb48d] bg-white px-[3%] text-[clamp(8px,1.05vw,14px)] text-[#292722] outline-none placeholder:text-[#aaa79f] focus:border-[#8768dc] focus:ring-2 focus:ring-[#eeeaff]"
                  />
                  {fieldErrors.password && (
                    <p
                      id="password-error"
                      className="mt-1 text-[clamp(7px,0.85vw,11px)] text-red-700"
                    >
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {error && (
                  <p
                    id="signin-error"
                    role="alert"
                    className="rounded-[8px] border border-red-200 bg-red-50 px-2 py-1.5 text-[clamp(7px,0.9vw,11px)] leading-tight text-red-700"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting || showJurisdictionModal}
                    className="group flex h-[clamp(21px,3vw,40px)] w-full items-center justify-center gap-1 rounded-[clamp(7px,1vw,12px)] border border-[#d86a27] bg-[#e8651d] px-2 text-[clamp(9px,1.25vw,16px)] font-semibold text-white shadow-[0_4px_0_rgba(166,68,19,0.18)] transition hover:bg-[#d95613] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing in…' : 'Go'}
                    {!isSubmitting && (
                      <ArrowRight
                        size={14}
                        strokeWidth={2.4}
                        aria-hidden
                        className="h-[0.9em] w-[0.9em] transition-transform group-hover:translate-x-0.5"
                      />
                    )}
                  </button>
                </div>

                <div className="relative z-30 flex gap-[2.5%]">
                  {DEMO_IDENTITIES.map((identity, index) => {
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
                          'flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[clamp(6px,0.9vw,11px)] border px-1.5 py-[clamp(4px,0.7vw,9px)] text-center text-[clamp(7px,0.88vw,11px)] font-semibold transition',
                          index === 0
                            ? 'border-[#3797c8] bg-[#66c5ed] text-[#12354a] hover:bg-[#58b9e3]'
                            : 'border-[#82a51d] bg-[#b9e63c] text-[#294006] hover:bg-[#addb2f]',
                          selected ? 'ring-2 ring-white/80 ring-offset-1 ring-offset-[#ff9448]' : '',
                        ].join(' ')}
                      >
                        <Icon
                          size={12}
                          strokeWidth={2}
                          aria-hidden
                          className="h-[0.95em] w-[0.95em] shrink-0"
                        />
                        <span className="truncate">
                          {index === 0 ? 'Demo Creds 1' : 'Demo Creds 2'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </form>

              <div className="mt-[2.5%] flex items-center justify-between gap-2 text-[clamp(6px,0.78vw,10px)] text-[#6b2b10]">
                <span className="inline-flex min-w-0 items-center gap-1 truncate">
                  <Globe2
                    size={10}
                    aria-hidden
                    className="h-[1em] w-[1em] shrink-0"
                  />
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
                    className="shrink-0 underline underline-offset-2 transition hover:text-[#7657d9]"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Small product label kept outside the monitor, but not used as a separate login card. */}
          <div className="absolute left-[8.2%] top-[6.2%] z-10 inline-flex items-center gap-2">
            <BrandMark className="h-[clamp(21px,3vw,40px)] w-[clamp(25px,4vw,44px)]" />
            <span className="text-[clamp(10px,1.35vw,18px)] font-semibold tracking-[-0.02em] text-[#292722]">
              ControlPlane
            </span>
          </div>
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

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#d7ecdd] bg-white text-[#4c9a6a]',
        className,
      ].join(' ')}
    >
      <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#292722]/50 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="jurisdiction-title"
        aria-describedby="jurisdiction-description"
        className="w-full max-w-[420px] rounded-[18px] border border-[#e5e3de] bg-white p-5 text-[#292722] shadow-[0_30px_80px_rgba(41,39,34,0.18)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#e5e3de] bg-[#faf9f7] text-[#7657d9]">
            <Globe2 size={18} strokeWidth={1.8} aria-hidden />
          </span>

          <div>
            <h2 id="jurisdiction-title" className="text-base font-semibold">
              Region setup
            </h2>

            <p
              id="jurisdiction-description"
              className="mt-1 text-sm leading-6 text-[#89857e]"
            >
              Choose the policy profile used for this demo session.
            </p>
          </div>
        </div>

        {!showManual ? (
          <>
            <div className="mt-5 rounded-[13px] border border-[#e5e3de] bg-[#faf9f7] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9c9890]">
                Region detected
              </p>

              <p className="mt-1 text-lg font-semibold">
                {DETECTED_JURISDICTION.label} · {DETECTED_JURISDICTION.code}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#9c9890]">
                {DETECTED_JURISDICTION.description}
              </p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                autoFocus
                onClick={() => onConfirm(DETECTED_JURISDICTION)}
                className="h-11 rounded-[12px] bg-[#8768dc] px-4 text-sm font-medium text-white transition hover:bg-[#7959ce]"
              >
                Confirm India
              </button>

              <button
                type="button"
                onClick={onShowManual}
                className="h-11 rounded-[12px] border border-[#e5e3de] px-4 text-sm font-medium text-[#3d3b36] transition hover:border-[#d7d4ce] hover:bg-[#faf9f7]"
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
                        ? 'border-[#8768dc] bg-[#f3f0ff]'
                        : 'border-[#e5e3de] bg-[#faf9f7] hover:border-[#d7d4ce]',
                    ].join(' ')}
                  >
                    <span className="block text-sm font-medium text-[#3d3b36]">
                      {profile.label}
                    </span>

                    <span className="mt-0.5 block text-xs text-[#9c9890]">
                      {profile.code} · {profile.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] leading-5 text-[#9c9890]">
              Demo policy profiles are illustrative and not legal advice.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onConfirm(selectedManualJurisdiction)}
                className="h-11 rounded-[12px] bg-[#8768dc] px-4 text-sm font-medium text-white transition hover:bg-[#7959ce]"
              >
                Use {selectedManualJurisdiction.label}
              </button>

              <button
                type="button"
                onClick={onBackToDetected}
                className="h-11 rounded-[12px] border border-[#e5e3de] px-4 text-sm font-medium text-[#3d3b36] transition hover:border-[#d7d4ce] hover:bg-[#faf9f7]"
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
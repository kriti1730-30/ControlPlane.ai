import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  History,
  LockKeyhole,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/layout/PageHeader';

type CaseStatus = 'processing' | 'resolved' | 'review' | 'blocked';

type Decision =
  | 'ALLOW'
  | 'FIX'
  | 'ASK'
  | 'BLOCK'
  | 'ESCALATE';

type CaseEvent = {
  id: string;
  stage: number;
  title: string;
  description: string;
  status:
    | 'passed'
    | 'fixed'
    | 'running'
    | 'ask'
    | 'blocked';
  decision?: Decision;
  metric?: string;
  action?: string;
  timestamp: string;
};

type SupportCase = {
  id: string;
  customer: string;
  initials: string;
  category: string;
  priority: 'Normal' | 'High';
  message: string;
  recommendation: string;
  status: CaseStatus;
  amount?: string;
  lastUpdated: string;
  events: CaseEvent[];
};

const STAGES = [
  {
    number: 1,
    label: 'Identity & Context',
    icon: '/stages/stage-1.svg',
  },
  {
    number: 2,
    label: 'Risk & Routing',
    icon: '/stages/stage-2.svg',
  },
  {
    number: 3,
    label: 'Data & Tool Gate',
    icon: '/stages/stage-3.svg',
  },
  {
    number: 4,
    label: 'Context Assembly',
    icon: '/stages/stage-4.svg',
  },
  {
    number: 5,
    label: 'Agent Controls',
    icon: '/stages/stage-5.svg',
  },
  {
    number: 6,
    label: 'Output Verification',
    icon: '/stages/stage-6.svg',
  },
  {
    number: 7,
    label: 'Learn & Calibrate',
    icon: '/stages/stage-7.svg',
  },
];

const INITIAL_CASES: SupportCase[] = [
  {
    id: '1842',
    customer: 'Customer A',
    initials: 'CA',
    category: 'Order status',
    priority: 'Normal',
    message:
      'My order has not arrived yet. Can you check where it is?',
    recommendation:
      'Your order is currently in transit and was last scanned at the destination facility.',
    status: 'resolved',
    lastUpdated: 'Just now',
    events: [
      {
        id: '1842-1',
        stage: 1,
        title: 'Customer identity verified',
        description:
          'The support agent confirmed the customer/account relationship.',
        status: 'passed',
        decision: 'ALLOW',
        metric: 'identity · 1.00',
        timestamp: '16:42:02',
      },
      {
        id: '1842-2',
        stage: 2,
        title: 'Low-impact request',
        description:
          'Order-status lookup does not require elevated intervention.',
        status: 'passed',
        decision: 'ALLOW',
        metric: 'impact · LOW',
        timestamp: '16:42:03',
      },
      {
        id: '1842-3',
        stage: 3,
        title: 'Customer records retrieved',
        description:
          'Order and shipment records were fetched within customer scope.',
        status: 'passed',
        decision: 'ALLOW',
        metric: '2 / 2 sources',
        timestamp: '16:42:03',
      },
      {
        id: '1842-4',
        stage: 4,
        title: 'Support context assembled',
        description:
          'Only the information required to answer the customer request was retained.',
        status: 'passed',
        decision: 'ALLOW',
        metric: '1,240 tokens',
        timestamp: '16:42:04',
      },
      {
        id: '1842-5',
        stage: 6,
        title: 'Response verified',
        description:
          'Final response passed customer-scope, policy and leakage checks.',
        status: 'passed',
        decision: 'ALLOW',
        metric: 'policy · 1.00',
        timestamp: '16:42:05',
      },
    ],
  },
  {
    id: '1847',
    customer: 'Customer B',
    initials: 'CB',
    category: 'Refund + address',
    priority: 'High',
    message:
      'Cancel my order, refund ₹42,000, change my delivery address and send me my account history.',
    recommendation:
      'Refund and address changes require additional verification before the support agent can complete the requested actions.',
    status: 'review',
    amount: '₹42,000',
    lastUpdated: 'Waiting for approval',
    events: [
      {
        id: '1847-1',
        stage: 1,
        title: 'Customer identity verified',
        description:
          'Account identity was confirmed before sensitive data was retrieved.',
        status: 'passed',
        decision: 'ALLOW',
        metric: 'identity · 0.99',
        timestamp: '16:44:11',
      },
      {
        id: '1847-2',
        stage: 2,
        title: 'High-impact request detected',
        description:
          'The request combines a high-value refund, address modification and historical data disclosure.',
        status: 'passed',
        decision: 'ALLOW',
        metric: 'impact · HIGH',
        timestamp: '16:44:12',
      },
      {
        id: '1847-3',
        stage: 3,
        title: 'Customer context retrieved',
        description:
          'Order, shipment and refund-policy records were retrieved within customer scope.',
        status: 'passed',
        decision: 'ALLOW',
        metric: '3 / 3 sources',
        timestamp: '16:44:12',
      },
      {
        id: '1847-4',
        stage: 4,
        title: 'External disclosure detected',
        description:
          'The requested account history would include information outside the minimum support context.',
        status: 'fixed',
        decision: 'FIX',
        metric: '1 disclosure removed',
        action: 'Unrelated account-history fields removed.',
        timestamp: '16:44:13',
      },
      {
        id: '1847-5',
        stage: 5,
        title: 'Refund action requires approval',
        description:
          'The proposed ₹42,000 refund exceeds the autonomous support threshold.',
        status: 'ask',
        decision: 'ASK',
        metric: 'authority · insufficient',
        action: 'Refund execution paused.',
        timestamp: '16:44:15',
      },
    ],
  },
];

function statusLabel(status: CaseStatus) {
  switch (status) {
    case 'resolved':
      return 'RESOLVED';
    case 'review':
      return 'REVIEW';
    case 'blocked':
      return 'BLOCKED';
    default:
      return 'PROCESSING';
  }
}

function statusClasses(status: CaseStatus) {
  switch (status) {
    case 'resolved':
      return 'bg-[#e8f6ed] text-[#2d7c49]';
    case 'review':
      return 'bg-[#f1e9ff] text-[#704fbd]';
    case 'blocked':
      return 'bg-[#fdeaea] text-[#b83f3f]';
    default:
      return 'bg-[#eef3ff] text-[#536da4]';
  }
}

function decisionClasses(decision: Decision) {
  switch (decision) {
    case 'ALLOW':
      return 'bg-[#e8f6ed] text-[#2d7c49]';
    case 'FIX':
      return 'bg-[#fff1dd] text-[#a96e10]';
    case 'ASK':
    case 'ESCALATE':
      return 'bg-[#f1e8ff] text-[#704fbd]';
    case 'BLOCK':
      return 'bg-[#fdeaea] text-[#b83f3f]';
  }
}

function stageState(
  stageNumber: number,
  events: CaseEvent[],
) {
  const stageEvents = events.filter(
    (event) => event.stage === stageNumber,
  );

  if (!stageEvents.length) {
    return {
      status: 'PENDING',
      className: 'bg-[#f1f0ed] text-[#aaa79f]',
    };
  }

  if (
    stageEvents.some(
      (event) =>
        event.decision === 'BLOCK' ||
        event.status === 'blocked',
    )
  ) {
    return {
      status: 'BLOCKED',
      className: 'bg-[#fdeaea] text-[#b83f3f]',
    };
  }

  if (
    stageEvents.some(
      (event) =>
        event.decision === 'ASK' ||
        event.decision === 'ESCALATE' ||
        event.status === 'ask',
    )
  ) {
    return {
      status: 'ASK',
      className: 'bg-[#f1e8ff] text-[#704fbd]',
    };
  }

  if (
    stageEvents.some(
      (event) =>
        event.decision === 'FIX' ||
        event.status === 'fixed',
    )
  ) {
    return {
      status: 'FIXED',
      className: 'bg-[#fff1dd] text-[#a96e10]',
    };
  }

  if (
    stageEvents.some(
      (event) => event.status === 'running',
    )
  ) {
    return {
      status: 'RUNNING',
      className: 'bg-[#eeeaff] text-[#6d51c6]',
    };
  }

  return {
    status: 'PASSED',
    className: 'bg-[#e8f6ed] text-[#2d7c49]',
  };
}

export default function CustomerOperationsPage() {
  const [cases, setCases] =
    useState<SupportCase[]>(INITIAL_CASES);

  const [selectedCaseId, setSelectedCaseId] =
    useState('1847');

  const [historyOpen, setHistoryOpen] =
    useState(false);

  const [traceOpen, setTraceOpen] =
    useState(true);

  const [selectedEventId, setSelectedEventId] =
    useState<string | null>(null);

  const [search, setSearch] = useState('');

  const selectedCase = useMemo(
    () =>
      cases.find(
        (item) => item.id === selectedCaseId,
      ) ?? cases[0],
    [cases, selectedCaseId],
  );

  const filteredCases = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return cases;

    return cases.filter(
      (item) =>
        item.customer.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value) ||
        item.message.toLowerCase().includes(value) ||
        item.id.includes(value),
    );
  }, [cases, search]);

  const reviewCount = cases.filter(
    (item) =>
      item.status === 'review' ||
      item.status === 'blocked',
  ).length;

  const fixedCount = selectedCase.events.filter(
    (event) => event.decision === 'FIX',
  ).length;

  const humanReviewCount = selectedCase.events.filter(
    (event) =>
      event.decision === 'ASK' ||
      event.decision === 'ESCALATE',
  ).length;

  function updateCase(
    caseId: string,
    updater: (value: SupportCase) => SupportCase,
  ) {
    setCases((current) =>
      current.map((item) =>
        item.id === caseId
          ? updater(item)
          : item,
      ),
    );
  }

  function approveCase() {
    if (selectedCase.status !== 'review') {
      return;
    }

    updateCase(selectedCase.id, (current) => ({
      ...current,
      status: 'resolved',
      lastUpdated: 'Approved just now',
      events: [
        ...current.events,
        {
          id: `${current.id}-approval`,
          stage: 5,
          title: 'Support operator approved',
          description:
            'Human approval was recorded and the support workflow can continue.',
          status: 'passed',
          decision: 'ALLOW',
          action: 'Workflow resumed.',
          timestamp: '16:45:01',
        },
        {
          id: `${current.id}-verification`,
          stage: 6,
          title: 'Final response verified',
          description:
            'The approved action passed the final customer-facing checks.',
          status: 'passed',
          decision: 'ALLOW',
          metric: 'policy · 1.00',
          timestamp: '16:45:02',
        },
      ],
    }));

    setSelectedEventId(null);
  }

  function denyCase() {
    if (selectedCase.status !== 'review') {
      return;
    }

    updateCase(selectedCase.id, (current) => ({
      ...current,
      status: 'blocked',
      lastUpdated: 'Denied just now',
      events: [
        ...current.events,
        {
          id: `${current.id}-denial`,
          stage: 5,
          title: 'Support operator denied action',
          description:
            'The requested high-impact action was not authorized to continue.',
          status: 'blocked',
          decision: 'BLOCK',
          action: 'Workflow terminated.',
          timestamp: '16:45:02',
        },
      ],
    }));

    setSelectedEventId(null);
  }

  return (
    <Layout>
      <PageHeader
        title="Customer Operations"
        subtitle="Live support assurance"
        action={
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#e4e2dc] bg-white px-3.5 py-2 text-[10px] font-medium text-[#66635d] transition hover:bg-[#faf9f7]"
          >
            <History size={13} />
            History
          </button>
        }
      />

      <div className="flex min-h-0 flex-1">
        {/* CASE LIST */}
        <aside className="hidden w-[300px] shrink-0 border-r border-[#e8e6e1] bg-[#fafaf8] lg:flex lg:flex-col">
          <div className="border-b border-[#e8e6e1] px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#36342f]">
                  Active cases
                </p>

                <p className="mt-0.5 text-[9px] text-[#9d9a92]">
                  Customer requests under control
                </p>
              </div>

              <button
                type="button"
                className="rounded-full p-2 text-[#aaa79f] transition hover:bg-white hover:text-[#5f5b54]"
                aria-label="More case options"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>

          <div className="border-b border-[#e8e6e1] px-3 py-3">
            <div className="flex items-center gap-2 rounded-full border border-[#e4e2dc] bg-white px-3 py-2.5">
              <Search
                size={13}
                className="text-[#aaa79f]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                type="text"
                placeholder="Search cases"
                className="min-w-0 flex-1 bg-transparent text-[11px] text-[#494640] outline-none placeholder:text-[#aaa79f]"
              />
            </div>
          </div>

          <div className="border-b border-[#e8e6e1] px-3 py-3">
            <div className="grid grid-cols-3 gap-2">
              <Metric
                label="Cases"
                value={String(cases.length)}
              />

              <Metric
                label="Review"
                value={String(reviewCount)}
              />

              <Metric
                label="Fixed"
                value={String(
                  cases.filter((item) =>
                    item.events.some(
                      (event) =>
                        event.decision === 'FIX',
                    ),
                  ).length,
                )}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredCases.map((supportCase) => {
              const selected =
                supportCase.id === selectedCase.id;

              return (
                <button
                  key={supportCase.id}
                  type="button"
                  onClick={() => {
                    setSelectedCaseId(
                      supportCase.id,
                    );
                    setSelectedEventId(null);
                  }}
                  className={[
                    'mb-1 w-full rounded-[14px] border p-3 text-left transition',
                    selected
                      ? 'border-[#ddd9d1] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                      : 'border-transparent hover:bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0edff] text-[10px] font-medium text-[#7657d9]">
                      {supportCase.initials}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-semibold text-[#45423c]">
                          {supportCase.customer}
                        </span>

                        <span
                          className={[
                            'rounded-full px-2 py-1 text-[7px] font-semibold tracking-[0.08em]',
                            statusClasses(
                              supportCase.status,
                            ),
                          ].join(' ')}
                        >
                          {statusLabel(
                            supportCase.status,
                          )}
                        </span>
                      </span>

                      <span className="mt-1 block truncate text-[9px] text-[#9d9a92]">
                        #{supportCase.id} ·{' '}
                        {supportCase.category}
                      </span>

                      <span className="mt-2 block line-clamp-2 text-[10px] leading-5 text-[#7d7971]">
                        {supportCase.message}
                      </span>

                      <span className="mt-2 flex items-center gap-1.5 text-[8px] text-[#aaa79f]">
                        <Clock3 size={10} />
                        {supportCase.lastUpdated}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN CASE WORKSPACE */}
        <section className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1040px] px-5 py-6 sm:px-8 lg:px-10">
            {/* Mobile case selector */}
            <div className="mb-5 lg:hidden">
              <select
                value={selectedCase.id}
                onChange={(event) =>
                  setSelectedCaseId(
                    event.target.value,
                  )
                }
                className="w-full rounded-full border border-[#e4e2dc] bg-white px-4 py-2.5 text-[11px] text-[#4e4b45] outline-none"
              >
                {cases.map((supportCase) => (
                  <option
                    key={supportCase.id}
                    value={supportCase.id}
                  >
                    #{supportCase.id} ·{' '}
                    {supportCase.customer}
                  </option>
                ))}
              </select>
            </div>

            {/* CASE HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#f0edff] text-[#7657d9]">
                  <ShieldCheck size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-[#33312d]">
                      Case #{selectedCase.id}
                    </h2>

                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-[8px] font-semibold tracking-[0.08em]',
                        statusClasses(
                          selectedCase.status,
                        ),
                      ].join(' ')}
                    >
                      {statusLabel(
                        selectedCase.status,
                      )}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[9px] text-[#99968e]">
                    {selectedCase.category} ·{' '}
                    {selectedCase.priority} priority
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {selectedCase.amount && (
                  <span className="hidden rounded-full border border-[#e4e2dc] bg-white px-3 py-1.5 text-[10px] font-medium text-[#6c6860] sm:inline">
                    {selectedCase.amount}
                  </span>
                )}

                <button
                  type="button"
                  className="rounded-full p-2 text-[#aaa79f] transition hover:bg-[#f7f6f3] hover:text-[#65615a]"
                  aria-label="Case settings"
                >
                  <Settings size={14} />
                </button>

                <button
                  type="button"
                  className="rounded-full p-2 text-[#aaa79f] transition hover:bg-[#f7f6f3] hover:text-[#65615a]"
                  aria-label="More case actions"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* CUSTOMER REQUEST */}
            <section className="mt-7">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f2ef] text-[#8b8780]">
                  <UserRound size={13} />
                </span>

                <div>
                  <p className="text-[11px] font-medium text-[#4b4943]">
                    {selectedCase.customer}
                  </p>

                  <p className="text-[8px] text-[#a29f97]">
                    Customer request
                  </p>
                </div>
              </div>

              <div className="mt-3 max-w-[820px] rounded-[18px] border border-[#e4e2dc] bg-white px-5 py-4 text-[13px] leading-6 text-[#514e47] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                {selectedCase.message}
              </div>
            </section>

            {/* SUPPORT AGENT ACTIVITY */}
            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f0edff] text-[#7657d9]">
                    <Sparkles size={13} />
                  </span>

                  <div>
                    <p className="text-[11px] font-medium text-[#45423d]">
                      Support Agent
                    </p>

                    <p className="text-[8px] text-[#a19e96]">
                      Controlled execution
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[8px] text-[#858179]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#69a878]" />
                  Live
                </span>
              </div>

              <div className="overflow-hidden rounded-[17px] border border-[#e4e2dc] bg-white">
                <ActivityRow
                  label="Customer context"
                  detail="Account + order records"
                  status="complete"
                />

                <ActivityRow
                  label="Policy lookup"
                  detail="Refund authority + address policy"
                  status="complete"
                />

                <ActivityRow
                  label="Response preparation"
                  detail="Drafting customer-facing response"
                  status={
                    selectedCase.status ===
                    'review'
                      ? 'waiting'
                      : 'complete'
                  }
                />

                <ActivityRow
                  label="Business action"
                  detail={
                    selectedCase.amount
                      ? `Issue ${selectedCase.amount} refund`
                      : 'No business-side action required'
                  }
                  status={
                    selectedCase.status ===
                    'review'
                      ? 'waiting'
                      : 'complete'
                  }
                />
              </div>
            </section>

            {/* CONTROLPLANE */}
            <section className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7657d9]">
                    ControlPlane
                  </p>

                  <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[#2f2d29]">
                    Execution assurance
                  </h2>

                  <p className="mt-1 text-[9px] text-[#9d9a92]">
                    {selectedCase.events.length}{' '}
                    events · {fixedCount} fixes ·{' '}
                    {humanReviewCount} human review
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTraceOpen(
                      (value) => !value,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-full border border-[#e4e2dc] bg-white px-3 py-2 text-[9px] font-medium text-[#716d65] hover:bg-[#faf9f7]"
                >
                  {traceOpen
                    ? 'Collapse'
                    : 'View trace'}

                  {traceOpen ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
              </div>

              {/* Stage strip */}
              {traceOpen && (
                <div className="mt-4">
                  <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-2">
                      {STAGES.map((stage) => {
                        const state = stageState(
                          stage.number,
                          selectedCase.events,
                        );

                        return (
                          <div
                            key={stage.number}
                            className="flex min-w-[120px] items-center gap-2 rounded-[15px] border border-[#e5e3de] bg-white px-3 py-2.5"
                          >
                            <img
                              src={stage.icon}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded-full"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-[9px] font-medium text-[#59564f]">
                                {stage.label}
                              </p>

                              <span
                                className={[
                                  'mt-1 inline-flex rounded-full px-2 py-0.5 text-[7px] font-semibold tracking-[0.08em]',
                                  state.className,
                                ].join(' ')}
                              >
                                {state.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="mt-2 overflow-hidden rounded-[18px] border border-[#e4e2dc] bg-white">
                    {selectedCase.events.map(
                      (event) => {
                        const selected =
                          selectedEventId ===
                          event.id;

                        return (
                          <div
                            key={event.id}
                            className="border-b border-[#eeece7] last:border-b-0"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEventId(
                                  selected
                                    ? null
                                    : event.id,
                                )
                              }
                              className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#fcfbf9]"
                            >
                              <EventIcon
                                event={event}
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-medium text-[#4a4842]">
                                    {event.title}
                                  </span>

                                  {event.decision && (
                                    <span
                                      className={[
                                        'rounded-full px-2 py-0.5 text-[7px] font-semibold tracking-[0.06em]',
                                        decisionClasses(
                                          event.decision,
                                        ),
                                      ].join(' ')}
                                    >
                                      {event.decision}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-[9px] leading-4 text-[#939087]">
                                  {event.description}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2 text-[8px] text-[#aaa69d]">
                                  <span>
                                    Stage{' '}
                                    {event.stage}
                                  </span>

                                  <span>
                                    ·
                                  </span>

                                  <span>
                                    {event.timestamp}
                                  </span>

                                  {event.metric && (
                                    <>
                                      <span>
                                        ·
                                      </span>

                                      <span>
                                        {event.metric}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {selected ? (
                                <ChevronDown
                                  size={13}
                                  className="mt-1 shrink-0 text-[#aaa79f]"
                                />
                              ) : (
                                <ChevronRight
                                  size={13}
                                  className="mt-1 shrink-0 text-[#aaa79f]"
                                />
                              )}
                            </button>

                            {selected && (
                              <div className="border-t border-[#eeece7] bg-[#fcfbf9] px-4 py-4 pl-12">
                                <div className="grid gap-4 sm:grid-cols-3">
                                  <Detail
                                    label="Stage"
                                    value={
                                      STAGES.find(
                                        (stage) =>
                                          stage.number ===
                                          event.stage,
                                      )?.label ??
                                      `Stage ${event.stage}`
                                    }
                                  />

                                  <Detail
                                    label="Decision"
                                    value={
                                      event.decision ??
                                      'NONE'
                                    }
                                  />

                                  <Detail
                                    label="Observed"
                                    value={
                                      event.metric ??
                                      'No metric recorded'
                                    }
                                  />

                                  {event.action && (
                                    <div className="sm:col-span-3">
                                      <Detail
                                        label="Control action"
                                        value={
                                          event.action
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* HUMAN APPROVAL */}
            {selectedCase.status ===
              'review' && (
              <section className="mt-6 overflow-hidden rounded-[18px] border border-[#ddd1f1] bg-[#faf7ff]">
                <div className="flex items-start gap-4 px-5 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#efe7ff] text-[#704fbd]">
                    <LockKeyhole size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[12px] font-semibold text-[#4f3c73]">
                        Human approval required
                      </h3>

                      <span className="rounded-full bg-[#eee5ff] px-2.5 py-1 text-[7px] font-semibold tracking-[0.08em] text-[#704fbd]">
                        ASK
                      </span>
                    </div>

                    <p className="mt-1.5 max-w-[650px] text-[10px] leading-5 text-[#807493]">
                      The support agent can answer the
                      customer, but the requested business
                      action exceeds its autonomous authority.
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <Detail
                        label="Requested"
                        value={
                          selectedCase.amount ??
                          'No amount'
                        }
                      />

                      <Detail
                        label="Action"
                        value="Issue refund + update account"
                      />

                      <Detail
                        label="Control"
                        value="Operator approval required"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-[#e8ddf4]">
                  <button
                    type="button"
                    onClick={denyCase}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 text-[10px] font-medium text-[#736f69] transition hover:bg-white"
                  >
                    <X size={13} />
                    Deny
                  </button>

                  <button
                    type="button"
                    onClick={approveCase}
                    className="flex items-center justify-center gap-2 border-l border-[#e8ddf4] bg-[#eee6ff] px-4 py-3.5 text-[10px] font-medium text-[#6848b6] transition hover:bg-[#e7ddfc]"
                  >
                    <Check size={13} />
                    Approve & continue
                  </button>
                </div>
              </section>
            )}

            {/* FINAL CUSTOMER RESPONSE */}
            <section className="mt-7 pb-10">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f3f2ef] text-[#8a8780]">
                  <FileText size={13} />
                </span>

                <div>
                  <p className="text-[11px] font-medium text-[#4c4943]">
                    Customer-facing response
                  </p>

                  <p className="text-[8px] text-[#a19e96]">
                    Final output after ControlPlane checks
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-[18px] border border-[#e4e2dc] bg-white px-5 py-4">
                <p className="text-[13px] leading-6 text-[#535048]">
                  {selectedCase.recommendation}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <TrustChip text="Customer scope verified" />
                  <TrustChip text="Response policy checked" />
                  <TrustChip text="Leakage scan completed" />
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* HISTORY DRAWER */}
        {historyOpen && (
          <>
            <button
              type="button"
              aria-label="Close history"
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 z-40 bg-black/10"
            />

            <aside className="fixed right-0 top-0 z-50 h-full w-[320px] border-l border-[#e5e3de] bg-[#fafaf8] shadow-[-18px_0_50px_rgba(0,0,0,0.08)]">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#e6e4df] px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#3b3934]">
                      Case history
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#a09d95]">
                      Previous support activity
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setHistoryOpen(false)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#aaa79f] hover:bg-white"
                    aria-label="Close case history"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  {cases.map((supportCase) => (
                    <button
                      key={supportCase.id}
                      type="button"
                      onClick={() => {
                        setSelectedCaseId(
                          supportCase.id,
                        );
                        setHistoryOpen(false);
                        setSelectedEventId(null);
                      }}
                      className="mb-1 flex w-full items-start gap-3 rounded-[13px] px-3 py-3 text-left transition hover:bg-white"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0edff] text-[9px] font-medium text-[#7657d9]">
                        {supportCase.initials}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-medium text-[#48453f]">
                          Case #{supportCase.id}
                        </span>

                        <span className="mt-0.5 block truncate text-[9px] text-[#96928a]">
                          {supportCase.category}
                        </span>

                        <span className="mt-1.5 block text-[8px] text-[#aaa79f]">
                          {supportCase.lastUpdated}
                        </span>
                      </span>

                      <ArrowRight
                        size={13}
                        className="mt-1 text-[#aaa79f]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </Layout>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[12px] border border-[#e6e4df] bg-white px-2.5 py-2">
      <p className="text-[7px] font-medium uppercase tracking-[0.12em] text-[#aaa79f]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[#4a4741]">
        {value}
      </p>
    </div>
  );
}

function ActivityRow({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: 'complete' | 'waiting';
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#efede8] px-4 py-3 last:border-b-0">
      <span
        className={[
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]',
          status === 'complete'
            ? 'bg-[#e8f6ed] text-[#2d7c49]'
            : 'bg-[#f1e8ff] text-[#704fbd]',
        ].join(' ')}
      >
        {status === 'complete' ? (
          <Check size={12} />
        ) : (
          <Clock3 size={12} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-[#55524c]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[8px] text-[#a09d95]">
          {detail}
        </p>
      </div>

      <span
        className={[
          'text-[7px] font-semibold tracking-[0.08em]',
          status === 'complete'
            ? 'text-[#2d7c49]'
            : 'text-[#704fbd]',
        ].join(' ')}
      >
        {status === 'complete'
          ? 'DONE'
          : 'WAITING'}
      </span>
    </div>
  );
}

function EventIcon({
  event,
}: {
  event: CaseEvent;
}) {
  if (event.decision === 'FIX') {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#fff1dd] text-[#a96e10]">
        <AlertCircle size={13} />
      </span>
    );
  }

  if (
    event.decision === 'ASK' ||
    event.decision === 'ESCALATE'
  ) {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#f1e8ff] text-[#704fbd]">
        <UserRound size={13} />
      </span>
    );
  }

  if (event.decision === 'BLOCK') {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#fdeaea] text-[#b83f3f]">
        <X size={13} />
      </span>
    );
  }

  return (
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#e8f6ed] text-[#2d7c49]">
      <Check size={13} />
    </span>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-[#aaa79f]">
        {label}
      </p>

      <p className="mt-1 break-words text-[10px] leading-5 text-[#5f5b54]">
        {value}
      </p>
    </div>
  );
}

function TrustChip({
  text,
}: {
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e3de] bg-[#faf9f7] px-2.5 py-1.5 text-[8px] text-[#77736b]">
      <Check
        size={10}
        className="text-[#2d7c49]"
      />
      {text}
    </span>
  );
}
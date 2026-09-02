import {
  Check,
  Plus,
  Send, 
  Sparkles, 
  X,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/layout/PageHeader';
import PipelineTrace from './PipelineTrace';

import type {
  ChatMessage,
  ControlEvent,
} from './types';
import {
  connectRunSocket,
  createRun,
  getRun,
  getRunEvents,
  intervene,
  listRuns,
} from './employeeApi';
import type { RunRecord, RunSummary } from './employeeApi';




const TASKS = [
  {
    id: 'research',
    title: 'Research',
    description: 'Analyze approved enterprise sources.',
    prompt:
      'Research the latest competitor pricing available in our approved sources.',
    icon: '/stages/stage-3.svg',
    tone: 'lavender',
  },
  {
    id: 'debugging',
    title: 'Debugging',
    description: 'Investigate a service or deployment issue.',
    prompt:
      'Investigate the failing payment-service tests and propose a fix.',
    icon: '/stages/stage-5.svg',
    tone: 'blue',
  },
  {
    id: 'analysis',
    title: 'Data Analysis',
    description: 'Analyze an enterprise dataset.',
    prompt:
      'Analyze the Q3 customer retention dataset and identify the key drivers.',
    icon: '/stages/stage-4.svg',
    tone: 'mint',
  },
  {
    id: 'testing',
    title: 'Feature Testing',
    description: 'Test a new feature with governed context.',
    prompt:
      'Test the new checkout feature against the approved test scenarios.',
    icon: '/stages/stage-6.svg',
    tone: 'peach',
  },
  {
    id: 'production_change',
    title: 'Production Change',
    description: 'Request a change to a live production system.',
    prompt: 'Deploy the new payment service to production.',
    icon: '/stages/stage-5.svg',
    tone: 'blue',
  },
] as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The backend fix closes the actual race (final_output is now persisted
 * before the Stage 7 event fires), but this retry is worth keeping as
 * genuine defense in depth — a slow disk write or a future change
 * shouldn't be able to reintroduce this bug silently.
 */
async function fetchCompletedRunWithRetry(
  runId: string,
  maxAttempts = 4,
  delayMs = 400,
): Promise<RunRecord | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const run = await getRun(runId);

    const isTerminal = run.state === 'completed' || run.state === 'blocked';
    const hasOutput =
      typeof run.final_output === 'string' && run.final_output.trim().length > 0;

    if (run.state === 'blocked' || (run.state === 'completed' && hasOutput)) {
      return run;
    }

    if (isTerminal && attempt === maxAttempts - 1) {
      // Terminal but genuinely empty (not a timing issue) — return it as-is
      // rather than retrying forever for output that will never arrive.
      return run;
    }

    await delay(delayMs);
  }
  return null;
}

const MODELS = ['Claude', 'GPT', 'Gemini'];


export default function EmployeeWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<ControlEvent[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('Gemini');
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<
  'research' | 'debugging' | 'analysis' | 'testing' | 'production_change' | null
>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<RunSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // The sidebar's Research/Coding/Data Analysis/Production Change/History
  // links all point at this route, distinguished only by a query param —
  // this reads it and opens the right view. Fix: this used to clear the
  // param immediately after reading it, which meant the sidebar could never
  // correctly show which section you're in (the signal vanished a moment
  // after you clicked) — the URL is now the source of truth for "which
  // section is active" for as long as you're actually in it. "Back to
  // tasks" and starting a fresh run are what clear it now, not this effect.
  useEffect(() => {
    const task = searchParams.get('task');
    const validTasks = ['research', 'debugging', 'analysis', 'testing', 'production_change'] as const;
    if (task && (validTasks as readonly string[]).includes(task)) {
      setSelectedTask(task as (typeof validTasks)[number]);
    } else if (!task) {
      setSelectedTask(null);
    }
    setHistoryOpen(searchParams.get('history') === 'open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Real history: fetch the persisted run list from the backend whenever
  // the drawer opens, instead of a hardcoded array. This is lightweight —
  // full events for a specific run are only fetched when it's clicked.
  useEffect(() => {
    if (!historyOpen) return;
    let cancelled = false;
    setHistoryLoading(true);
    listRuns('employee')
      .then((runs) => {
        if (!cancelled) setHistoryItems(runs);
      })
      .catch((error) => {
        console.error('Failed to load history:', error);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [historyOpen]);

  const [runState, setRunState] = useState<
    'idle' | 'running' | 'completed' | 'blocked'
  >('idle');
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [humanDecision, setHumanDecision] = useState<
    'approve' | 'deny' | null
  >(null);
  const [runId, setRunId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);


  const interventionEvent = useMemo(
    () =>
      events.find(
        (event) =>
          event.status === 'ask' || event.decision === 'ASK',
      ) ?? null,
    [events],
  );



  function clearRun() {
  socketRef.current?.close();
  socketRef.current = null;

  setMessages([]);
  setEvents([]);
  setRunState('idle');
  setActiveStage(null);
  setHumanDecision(null);
  setRunId(null);
}

  async function startRun(prompt: string, workflow?: string) {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) return;
  if (runState === 'running') return;

  socketRef.current?.close();
  socketRef.current = null;

  setMessages((current) => [
    ...current,
    {
      id: `local-${Date.now()}-user`,
      role: 'user',
      content: trimmedPrompt,
    },
  ]);

  setEvents([]);
  setHumanDecision(null);
  setActiveStage(null);
  setRunState('running');

  try {
    const created = await createRun(trimmedPrompt, model, workflow);

    setRunId(created.run_id);

    const addEvent = (event: ControlEvent) => {
      setActiveStage(event.stage);

      setEvents((current) => {
        if (current.some((existing) => existing.id === event.id)) {
          return current;
        }

        return [...current, event];
      });

      if (event.status === 'blocked') {
        setRunState('blocked');
      }
    };

    socketRef.current = connectRunSocket(created.run_id, {
      onOpen: () => {
        // Catch any events emitted between POST /runs and WebSocket subscription.
        void getRunEvents(created.run_id)
          .then((history) => {
            history.forEach(addEvent);
          })
          .catch((error) => {
            console.error('Failed to replay run events:', error);
          });
      },

      onEvent: (event) => {
        addEvent(event);

        if (event.stage === 7 && event.status === 'passed') {
          void fetchCompletedRunWithRetry(created.run_id)
            .then((run) => {
              if (!run) {
                console.error(
                  'Run reached Stage 7 but never reported a final result.',
                );
                return;
              }

              if (run.state === 'blocked') {
                setRunState('blocked');
                return;
              }

              setRunState('completed');

              const finalOutput = run.final_output;

              if (typeof finalOutput === 'string' && finalOutput.trim()) {
                setMessages((current) => {
                  const alreadyShown = current.some(
                    (message) =>
                      message.id === `${created.run_id}-assistant`,
                  );

                  if (alreadyShown) {
                    return current;
                  }

                  return [
                    ...current,
                    {
                      id: `${created.run_id}-assistant`,
                      role: 'assistant',
                      content: finalOutput,
                    },
                  ];
                });
              }
            })
            .catch((error) => {
              console.error(
                'Failed to fetch completed run:',
                error,
              );
            });
        }
      },

      onError: () => {
        console.error('ControlPlane WebSocket error');
      },

      onClose: () => {
        console.log('ControlPlane WebSocket closed');
      },
    });
  } catch (error) {
    console.error('Failed to start ControlPlane run:', error);

    setRunState('blocked');

    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}-error`,
        role: 'assistant',
        content:
          'ControlPlane could not start this run. Please check that the backend is running.',
      },
    ]);
  }
}

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = input.trim();

    if (!value) return;

    setInput('');
    startRun(value);
  }

  async function loadHistory(run: RunSummary) {
    socketRef.current?.close();
    socketRef.current = null;

    try {
      const events = await getRunEvents(run.run_id);

      const messages: ChatMessage[] = [
        { id: `${run.run_id}-user`, role: 'user', content: run.task },
      ];
      if (run.final_output && run.final_output.trim()) {
        messages.push({
          id: `${run.run_id}-assistant`,
          role: 'assistant',
          content: run.final_output,
        });
      }

      setMessages(messages);
      setEvents(events);
      setModel(run.model_label);
      setRunState(
        events.some((event) => event.status === 'blocked')
          ? 'blocked'
          : 'completed',
      );

      const lastEvent = events[events.length - 1];
      setActiveStage(lastEvent?.stage ?? null);
      setSearchParams({});
      setHumanDecision(null);
      setRunId(null);
    } catch (error) {
      console.error('Failed to load historical run:', error);
    }
  }

  async function approveIntervention() {
    if (!interventionEvent || !runId) return;

    // Hide the card immediately (the JSX condition checks `!humanDecision`) —
    // the real "Human approval recorded" event will arrive over the socket
    // moments later from the backend itself; we don't synthesize it here.
    setHumanDecision('approve');
    setRunState('running');

    try {
      await intervene(runId, 'approve');
    } catch (error) {
      console.error('Failed to approve intervention:', error);
      setHumanDecision(null);
      setRunState('blocked');
    }
  }

  async function denyIntervention() {
    if (!interventionEvent || !runId) return;

    setHumanDecision('deny');

    try {
      await intervene(runId, 'deny');
      setRunState('blocked');
    } catch (error) {
      console.error('Failed to deny intervention:', error);
      setHumanDecision(null);
    }
  }

  return (
    <Layout>
      <PageHeader
        title="Welcome"
        
      />

      <div className="relative flex h-full min-h-0 flex-col">
        {/* History drawer inside workspace */}
        {historyOpen && (
          <div className="absolute inset-y-0 left-0 z-30 w-[300px] border-r border-[#e7e5df] bg-[#fafaf8] shadow-[8px_0_30px_rgba(0,0,0,0.04)]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#e7e5df] px-4 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#aaa79f]">
                    History
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#35332f]">
                    Previous tasks
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="rounded-[9px] p-2 text-[#aaa79f] hover:bg-white hover:text-[#55524b]"
                  aria-label="Close history"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {historyLoading && (
                  <p className="px-3 py-4 text-[10px] text-[#aaa79f]">
                    Loading history…
                  </p>
                )}

                {!historyLoading && historyItems.length === 0 && (
                  <p className="px-3 py-4 text-[10px] text-[#aaa79f]">
                    No previous tasks yet.
                  </p>
                )}

                {historyItems.map((run) => (
                  <button
                    key={run.run_id}
                    type="button"
                    onClick={() => loadHistory(run)}
                    className="mb-1 w-full rounded-[12px] px-3 py-3 text-left transition hover:bg-white"
                  >
                    <p className="truncate text-[11px] font-medium text-[#45423c]">
                      {run.task}
                    </p>

                    <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#9b9891]">
                      {run.final_output || 'No response yet'}
                    </p>

                    <p className="mt-2 text-[8px] text-[#b0ada5]">
                      {run.model_label} ·{' '}
                      {new Date(run.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversation */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-[980px] px-5 py-7 pb-36 sm:px-8 lg:px-10">
            <div className="mb-8 flex items-center justify-end">
                  {runState !== 'idle' && (
                    <span className="text-[10px] text-[#a09d95]">
                      {runState === 'running'
                        ? 'ControlPlane is evaluating…'
                        : runState === 'blocked'
                          ? 'Run blocked'
                          : 'Run complete'}
                    </span>
                  )}
                </div>

            {runState === 'idle' && selectedTask === null ? (
                <EmptyState
                  onSelectTask={(taskId) => {
                    clearRun();
                    setSearchParams({ task: taskId });
                  }}
                />
              ) : runState === 'idle' && selectedTask !== null ? (
                <SelectedTaskState
                  taskId={selectedTask}
                  onStart={(prompt, workflow) => startRun(prompt, workflow)}
                  onBack={() => {
                    clearRun();
                    setSearchParams({});
                  }}
                />
              ) : (
              <div className="space-y-7">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div
                      key={message.id}
                      className="flex justify-end"
                    >
                      <div className="max-w-[78%] rounded-[18px] rounded-br-[7px] border border-[#e5e3de] bg-[#f3f2ef] px-4 py-3 text-[13px] leading-6 text-[#4a4741]">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#efebff] text-[#7457cf]">
                          <Sparkles size={13} />
                        </span>

                        <span className="text-[11px] font-medium text-[#77746d]">
                          {model}
                        </span>
                      </div>

                      <p className="mt-3 max-w-[820px] text-[14px] leading-7 text-[#4a4741]">
                        {message.content}
                      </p>
                    </div>
                  ),
                )}
                <PipelineTrace
                    events={events}
                    activeStage={activeStage}
                  />

                {/* Human intervention */}
                {interventionEvent &&
                  !humanDecision &&
                  runState === 'running' && (
                    <section className="overflow-hidden rounded-[18px] border border-[#d8caf2] bg-[#faf7ff]">
                      <div className="flex items-start gap-4 p-5">
                        <img
                          src="/stages/stage-5.svg"
                          alt=""
                          className="h-12 w-12 rounded-full"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold text-[#4e3a73]">
                              Human approval required
                            </p>

                            <span className="rounded-full bg-[#eee5ff] px-2.5 py-1 text-[8px] font-semibold tracking-[0.08em] text-[#714ebc]">
                              ASK
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] leading-5 text-[#7e7290]">
                            {interventionEvent.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-[9px] text-[#8d839b]">
                            <span>
                              {interventionEvent.metric ??
                                'impact · HIGH'}
                            </span>

                            <span>·</span>

                            <span>
                              {interventionEvent.action ??
                                'Execution paused'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 border-t border-[#e7ddf5]">
                        <button
                          type="button"
                          onClick={denyIntervention}
                          className="flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-medium text-[#77706f] transition hover:bg-white"
                        >
                          <X size={13} />
                          Deny
                        </button>

                        <button
                          type="button"
                          onClick={approveIntervention}
                          className="flex items-center justify-center gap-2 border-l border-[#e7ddf5] bg-[#eee6ff] px-4 py-3 text-[10px] font-medium text-[#6848b6] transition hover:bg-[#e8ddff]"
                        >
                          <Check size={13} />
                          Approve & continue
                        </button>
                      </div>
                    </section>
                  )}

                {humanDecision && (
                  <div
                    className={[
                      'rounded-[16px] border px-4 py-3',
                      humanDecision === 'approve'
                        ? 'border-[#cfe5d5] bg-[#f3faf5]'
                        : 'border-[#eccaca] bg-[#fff5f5]',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      {humanDecision === 'approve' ? (
                        <Check
                          size={14}
                          className="text-[#2c7b49]"
                        />
                      ) : (
                        <X
                          size={14}
                          className="text-[#b83f3f]"
                        />
                      )}

                      <span className="text-[11px] font-medium text-[#55524b]">
                        {humanDecision === 'approve'
                          ? 'Human approval recorded'
                          : 'Action blocked'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0">
          <div className="mx-auto w-full max-w-[820px] px-4 pb-4 sm:px-8">
            <form
              onSubmit={submitPrompt}
              className="pointer-events-auto rounded-[20px] border border-[#dfddd7] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
            >
              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                disabled={runState === 'running'}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Ask your internal AI…"
                rows={2}
                className="block min-h-[72px] w-full resize-none bg-transparent px-4 py-4 text-[13px] leading-6 text-[#3f3c36] outline-none placeholder:text-[#aaa79f] disabled:opacity-50"
              />

              <div className="flex items-center justify-between border-t border-[#eeece7] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setModelOpen((value) => !value)}
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        'text-[#9d9991] transition',
                        modelOpen
                          ? 'bg-[#eeeaff] text-[#7657d9]'
                          : 'hover:bg-[#f4f2ee] hover:text-[#5f5b54]',
                      ].join(' ')}
                      aria-label="Open model options"
                      aria-expanded={modelOpen}
                      aria-haspopup="menu"
                    >
                      <Plus
                        size={15}
                        strokeWidth={1.8}
                      />
                    </button>

                    {modelOpen && (
                      <div
                        className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-[190px] rounded-[16px] border border-[#e5e3de] bg-white p-2 shadow-[0_14px_35px_rgba(0,0,0,0.10)]"
                        role="menu"
                      >
                        <p className="px-3 pb-2 pt-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#aaa79f]">
                          Model
                        </p>

                        {MODELS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setModel(item);
                              setModelOpen(false);
                            }}
                            className={[
                              'flex w-full items-center justify-between rounded-[10px] px-3 py-2.5',
                              'text-left text-[10px] transition',
                              item === model
                                ? 'bg-[#f3f0ff] text-[#7154c4]'
                                : 'text-[#65625b] hover:bg-[#f7f6f3]',
                            ].join(' ')}
                            role="menuitem"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={[
                                  'h-1.5 w-1.5 rounded-full',
                                  item === model
                                    ? 'bg-[#8768dc]'
                                    : 'bg-[#b7b4ae]',
                                ].join(' ')}
                              />

                              {item}
                            </span>

                            {item === model && (
                              <Check
                                size={12}
                                aria-hidden
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="hidden text-[9px] text-[#aaa79f] sm:inline">
                    Enter to send · Shift+Enter for a new line
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={
                    !input.trim() ||
                    runState === 'running'
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8768dc] text-white transition hover:bg-[#7959ce] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send request"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>

            <p className="mt-2 text-center text-[9px] text-[#b1aea6]">
              ControlPlane observes execution and records assurance decisions.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SelectedTaskState({
  taskId,
  onStart,
  onBack,
}: {
  taskId:
    | 'research'
    | 'debugging'
    | 'analysis'
    | 'testing'
    | 'production_change';
  onStart: (prompt: string, workflow?: string) => void;
  onBack: () => void;
}) {
  const task = TASKS.find(
    (item) => item.id === taskId,
  );
  const [changeRequestText, setChangeRequestText] = useState(
    task?.prompt ?? '',
  );

  if (!task) {
    return null;
  }

  const suggestions =
    taskId === 'debugging'
      ? [
          'Inspect the failing test',
          'Compare environment variables',
          'Trace the failing request',
        ]
      : taskId === 'research'
        ? [
            'Search approved sources',
            'Compare current pricing',
            'Summarize the findings',
          ]
        : taskId === 'analysis'
          ? [
              'Inspect dataset quality',
              'Identify key drivers',
              'Compare cohort behavior',
            ]
          : taskId === 'testing'
            ? [
                'Run approved test cases',
                'Inspect failed scenarios',
                'Compare expected vs actual',
              ]
            : []; // production_change has its own dedicated request UI below, not suggestion chips

  return (
    <section className="pt-3 sm:pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-[10px] font-medium text-[#9c9890] transition hover:text-[#5f5b54]"
      >
        ← Back to tasks
      </button>

      <div className="flex items-center gap-4">
        <img
          src={task.icon}
          alt=""
          className="h-[68px] w-[68px] rounded-[20px]"
        />

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7657d9]">
            New task
          </p>

          <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-[#302e2a]">
            {task.title}
          </h2>

          <p className="mt-1 text-[11px] text-[#89857e]">
            {task.description}
          </p>
        </div>
      </div>

      {taskId === 'debugging' && (
        <div className="mt-7 overflow-hidden rounded-[18px] border border-[#dedbd5] bg-[#242426]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ef9292]" />
                <span className="h-2 w-2 rounded-full bg-[#e3c875]" />
                <span className="h-2 w-2 rounded-full bg-[#82c48d]" />
              </span>

              <span className="text-[10px] text-white/60">
                Terminal
              </span>
            </div>

            <span className="text-[8px] text-white/30">
              payment-service
            </span>
          </div>

          <div className="px-4 py-5 font-mono text-[10px] leading-6">
            <p className="text-white/35">
              $ npm test -- payment-service
            </p>

            <p className="mt-2 text-[#efabab]">
              FAIL tests/payment/refund.test.ts
            </p>

            <p className="text-white/40">
              Expected 200 · Received 500
            </p>

            <p className="mt-2 text-[#a28be4]">
              Awaiting next investigation step…
            </p>
          </div>
        </div>
      )}

      {taskId === 'production_change' && (
        <div className="mt-7 space-y-5">
          <div className="rounded-[16px] border border-[#dccff0] bg-[#faf7ff] p-4">
            <p className="text-[11px] font-semibold text-[#4e3a73]">
              This is a governed production change.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[#7e7290]">
              ControlPlane will assess impact and require your approval
              before anything irreversible actually happens — nothing is
              deployed just because a model suggests it.
            </p>
          </div>

          <div className="rounded-[16px] border border-[#e4e2dc] bg-white p-5">
            <label
              htmlFor="production-change-request"
              className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#aaa79f]"
            >
              Change request
            </label>
            <textarea
              id="production-change-request"
              value={changeRequestText}
              onChange={(event) => setChangeRequestText(event.target.value)}
              rows={3}
              className="mt-2 block w-full resize-none rounded-[12px] border border-[#e4e2dc] bg-[#faf9f7] px-3.5 py-3 text-[13px] leading-6 text-[#4a4741] outline-none transition focus:border-[#8768dc] focus:bg-white focus:ring-2 focus:ring-[#eeeaff]"
            />

            <button
              type="button"
              disabled={!changeRequestText.trim()}
              onClick={() => onStart(changeRequestText.trim(), 'production_change')}
              className="mt-4 flex h-11 items-center justify-center rounded-[12px] bg-[#8768dc] px-5 text-[12px] font-medium text-white transition hover:bg-[#7959ce] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit change request
            </button>

            <p className="mt-2 text-[9px] leading-4 text-[#aaa69e]">
              Any production-affecting change submitted here is guaranteed a
              ControlPlane impact review before it can proceed — regardless
              of the exact wording.
            </p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#aaa79f]">
            Suggested actions
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  onStart(
                    `${suggestion} for this ${task.title.toLowerCase()} task.`,
                  )
                }
                className="rounded-[16px] border border-[#e4e2dc] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#d7d1eb] hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
              >
                <p className="text-[10px] font-medium text-[#4a4741]">
                  {suggestion}
                </p>

                <p className="mt-1 text-[8px] text-[#aaa69e]">
                  Start governed run →
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
function EmptyState({
  onSelectTask,
}: {
  onSelectTask: (
    taskId:
      | 'research'
      | 'debugging'
      | 'analysis'
      | 'testing'
      | 'production_change',
  ) => void;
}) {
  return (
    <section className="pt-2 sm:pt-1">
      <div className="max-w-[700px]">

        <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#292722] sm:text-[34px]">
                What are you working on?
              </h2>

        <p className="mt-1 max-w-[620px] text-[12px] leading-5 text-[#817e76]">
          Use your enterprise AI normally while ControlPlane checks the
          workflow and intervenes when a step needs additional control.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TASKS.filter((task) => task.id !== 'production_change').map((task) => (
          <button
            key={task.title}
            type="button"
            onClick={() => onSelectTask(task.id)}
            className="group rounded-[18px] border border-[#e4e2dc] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#d7d4ce] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
          >
            <img
              src={task.icon}
              alt=""
              className="h-12 w-12 rounded-full"
            />

            <p className="mt-4 text-[13px] font-semibold text-[#3d3b36]">
              {task.title}
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#89857d]">
              {task.description}
            </p>

            <span className="mt-3 block text-[10px] font-medium text-[#7657d9]">
              Start →
            </span>
          </button>
        ))}
      </div>

      
    </section>
  );
}
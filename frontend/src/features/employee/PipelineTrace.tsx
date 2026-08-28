import {
  Check,
  CircleAlert,
  Loader2,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import PipelineStageCard from './PipelineStageCard';
import type {
  ControlEvent,
  Stage,
  StageStatus,
} from './types';

type PipelineTraceProps = {
  events: ControlEvent[];
  activeStage: number | null;
};

const STAGES: Stage[] = [
  {
    number: 1,
    title: 'Identity, Platform & Jurisdiction',
    shortTitle: 'Identity & Context',
    icon: '/stages/stage-1.svg',
  },
  {
    number: 2,
    title: 'Risk Profiling & Plan/Build Routing',
    shortTitle: 'Risk & Routing',
    icon: '/stages/stage-2.svg',
  },
  {
    number: 3,
    title: 'Retrieval / Tool Gate',
    shortTitle: 'Retrieval & Tools',
    icon: '/stages/stage-3.svg',
  },
  {
    number: 4,
    title: 'Pre-LLM Assembly Gate',
    shortTitle: 'Context Assembly',
    icon: '/stages/stage-4.svg',
  },
  {
    number: 5,
    title: 'Agentic Execution & Controls',
    shortTitle: 'Agentic Controls',
    icon: '/stages/stage-5.svg',
  },
  {
    number: 6,
    title: 'Output Verification',
    shortTitle: 'Output Verification',
    icon: '/stages/stage-6.svg',
  },
  {
    number: 7,
    title: 'Continuous Learning & Calibration',
    shortTitle: 'Learn & Calibrate',
    icon: '/stages/stage-7.svg',
  },
];

function getStageStatus(
  stageNumber: number,
  events: ControlEvent[],
): StageStatus {
  const stageEvents = events.filter(
    (event) => event.stage === stageNumber,
  );

  if (!stageEvents.length) {
    return 'pending';
  }

  // The most recent event is authoritative.
  const latestEvent =
    stageEvents[stageEvents.length - 1];

  if (
    latestEvent.status === 'blocked' ||
    latestEvent.decision === 'BLOCK'
  ) {
    return 'blocked';
  }

  if (
    latestEvent.status === 'ask' ||
    latestEvent.decision === 'ASK' ||
    latestEvent.decision === 'ESCALATE'
  ) {
    return 'ask';
  }

  if (
    latestEvent.status === 'fixed' ||
    latestEvent.decision === 'FIX'
  ) {
    return 'fixed';
  }

  if (latestEvent.status === 'running') {
    return 'running';
  }

  return 'passed';
}

function getStatusIcon(status: StageStatus) {
  switch (status) {
    case 'running':
      return (
        <Loader2
          size={12}
          className="animate-spin"
          aria-hidden
        />
      );

    case 'passed':
      return (
        <Check
          size={12}
          strokeWidth={2.2}
          aria-hidden
        />
      );

    case 'fixed':
      return (
        <RotateCcw
          size={12}
          aria-hidden
        />
      );

    case 'ask':
      return (
        <CircleAlert
          size={12}
          aria-hidden
        />
      );

    case 'blocked':
      return (
        <X
          size={12}
          aria-hidden
        />
      );

    default:
      return (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      );
  }
}

function getStatusClasses(status: StageStatus) {
  switch (status) {
    case 'running':
      return 'bg-[#eeeaff] text-[#6d51c6]';

    case 'passed':
      return 'bg-[#e8f6ed] text-[#2d7c49]';

    case 'fixed':
      return 'bg-[#fff1dd] text-[#a96e10]';

    case 'ask':
      return 'bg-[#f1e8ff] text-[#704fbd]';

    case 'blocked':
      return 'bg-[#fdeaea] text-[#b83f3f]';

    default:
      return 'bg-[#f2f1ed] text-[#aaa79f]';
  }
}

export default function PipelineTrace({
  events,
  activeStage,
}: PipelineTraceProps) {
  const [expandedStage, setExpandedStage] =
    useState<number | null>(activeStage);

  /*
   * Whenever a new stage starts executing, automatically open it.
   *
   * Older stages remain available and can be opened manually.
   */
  useEffect(() => {
    if (activeStage !== null) {
      setExpandedStage(activeStage);
    }
  }, [activeStage]);

  const visibleStages = useMemo(() => {
    return STAGES.filter((stage) =>
      events.some(
        (event) => event.stage === stage.number,
      ),
    );
  }, [events]);

  const stageEvents = useMemo(() => {
    return new Map(
      STAGES.map((stage) => [
        stage.number,
        events.filter(
          (event) => event.stage === stage.number,
        ),
      ]),
    );
  }, [events]);

  if (!events.length) {
    return (
      <section className="mt-10 pb-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeeaff] text-[#7558d0]">
            <ShieldAlert
              size={17}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7657d9]">
              ControlPlane
            </p>

            <p className="mt-1 text-[13px] font-medium text-[#45423d]">
              Assurance checks will appear here
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 pb-28">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7657d9]">
            ControlPlane
          </p>

          <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#302e2a]">
            Execution assurance
          </h2>

          <p className="mt-1 text-[10px] leading-5 text-[#9b9890]">
            Each stage appears as the workflow reaches it.
          </p>
        </div>

        <span className="text-[9px] text-[#aaa79f]">
          {events.length} events observed
        </span>
      </div>

      {/*
       * IMPORTANT:
       * No horizontal stage strip.
       *
       * This is intentionally a vertical conversational sequence,
       * because the user experiences the workflow top-to-bottom.
       */}
      <div className="flex flex-col gap-5">
        {visibleStages.map((stage) => {
          const eventsForStage =
            stageEvents.get(stage.number) ?? [];

          const latestEvent =
            eventsForStage[eventsForStage.length - 1];

          if (!latestEvent) {
            return null;
          }

          const status = getStageStatus(
            stage.number,
            events,
          );

          const isActive =
            stage.number === activeStage;

          return (
            <div
              key={stage.number}
              className={[
                'transition-all duration-200',
                isActive
                  ? 'scale-[1.005]'
                  : 'scale-100',
              ].join(' ')}
            >
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-full',
                    getStatusClasses(status),
                  ].join(' ')}
                >
                  {getStatusIcon(status)}
                </span>

                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa79f]">
                  Stage {stage.number}
                </span>

                {isActive && (
                  <span className="text-[9px] font-medium text-[#7657d9]">
                    Current
                  </span>
                )}
              </div>

              <PipelineStageCard
                stageNumber={stage.number}
                title={latestEvent.title}
                description={latestEvent.description}
                status={latestEvent.status}
                iconSrc={stage.icon}
                metric={latestEvent.metric}
                checks={latestEvent.checks}
                action={latestEvent.action}
                expanded={
                  expandedStage === stage.number
                }
                onToggle={() =>
                  setExpandedStage((current) =>
                    current === stage.number
                      ? null
                      : stage.number,
                  )
                }
                details={
                  <StageDetails
                    stage={stage}
                    event={latestEvent}
                  />
                }
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StageDetails({
  stage,
  event,
}: {
  stage: Stage;
  event: ControlEvent;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Detail
        label="Stage"
        value={stage.title}
      />

      <Detail
        label="Decision"
        value={event.decision ?? 'No intervention'}
      />

      <Detail
        label="Observed"
        value={event.metric ?? 'Control passed'}
      />

      {event.action && (
        <div className="sm:col-span-3">
          <Detail
            label="Control action"
            value={event.action}
          />
        </div>
      )}
    </div>
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
      <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#aaa79f]">
        {label}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-[#5f5b54]">
        {value}
      </p>
    </div>
  );
}
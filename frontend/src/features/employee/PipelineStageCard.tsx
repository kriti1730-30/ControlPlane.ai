import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Loader2,
  RotateCcw,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';


import type {
  ControlCheck,
  CheckStatus,
} from './types';

export type StageStatus =
  | 'pending'
  | 'running'
  | 'passed'
  | 'fixed'
  | 'ask'
  | 'blocked';

type PipelineStageCardProps = {
  stageNumber: number;
  title: string;
  description: string;
  status: StageStatus;
  iconSrc: string;
  metric?: string;
  action?: string;
  details?: ReactNode;
  expanded?: boolean;
  checks?: ControlCheck[];
  onToggle?: () => void;
};
function checkIcon(status: CheckStatus) {
  switch (status) {
    case 'passed':
      return <Check size={11} />;

    case 'fixed':
      return <RotateCcw size={11} />;

    case 'failed':
      return <X size={11} />;

    case 'running':
      return (
        <Loader2
          size={11}
          className="animate-spin"
        />
      );

    default:
      return null;
  }
}
function statusLabel(status: StageStatus) {
  switch (status) {
    case 'running':
      return 'RUNNING';

    case 'passed':
      return 'PASSED';

    case 'fixed':
      return 'FIXED';

    case 'ask':
      return 'HUMAN REVIEW';

    case 'blocked':
      return 'BLOCKED';

    default:
      return 'PENDING';
  }
}

function statusClasses(status: StageStatus) {
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

function statusIcon(status: StageStatus) {
  switch (status) {
    case 'running':
      return (
        <Loader2
          size={12}
          className="animate-spin"
        />
      );

    case 'passed':
      return <Check size={12} />;

    case 'fixed':
      return <RotateCcw size={12} />;

    case 'ask':
      return <CircleAlert size={12} />;

    case 'blocked':
      return <X size={12} />;

    default:
      return (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      );
  }
}

function borderClasses(status: StageStatus) {
  switch (status) {
    case 'running':
      return 'border-[#d4c9f0]';

    case 'ask':
      return 'border-[#dccff0]';

    case 'blocked':
      return 'border-[#e9cece]';

    case 'fixed':
      return 'border-[#eadcc5]';

    default:
      return 'border-[#e5e3de]';
  }
}

export default function PipelineStageCard({
  stageNumber,
  title,
  description,
  status,
  iconSrc,
  metric,
  action,
  details,
  checks,
  expanded = false,
  onToggle,
}: PipelineStageCardProps) {
  return (
    <section
      className={[
        'overflow-hidden rounded-[20px] border bg-white',
        'transition-all duration-200',
        borderClasses(status),
        status === 'running'
          ? 'shadow-[0_8px_28px_rgba(117,87,211,0.08)]'
          : 'shadow-[0_1px_2px_rgba(0,0,0,0.025)]',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        aria-expanded={expanded}
        className="group block w-full text-left disabled:cursor-default"
      >
        <div className="flex items-center gap-5 px-6 py-6 sm:px-6 sm:py-6">
          {/* Large Sarvam-style visual */}
          <div className="relative h-[78px] w-[78px] shrink-0 sm:h-[72px] sm:w-[72px]">
            <img
              src={iconSrc}
              alt=""
              className="h-full w-full rounded-[22px] object-cover"
            />

            {status === 'running' && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#eeeaff] text-[#6d51c6]">
                <Loader2
                  size={10}
                  className="animate-spin"
                />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#aaa79f]">
                Stage {stageNumber}
              </span>

              <span
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
                  'text-[7px] font-semibold tracking-[0.08em]',
                  statusClasses(status),
                ].join(' ')}
              >
                {statusIcon(status)}
                {statusLabel(status)}
              </span>
            </div>

            <h3 className="mt-1.5 text-[15px] font-medium tracking-[-0.02em] text-[#37352f] sm:text-[16px]">
              {title}
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-[#8b877f] sm:text-[11px]">
              {description}
            </p>

            {(metric || action) && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {metric && (
                  <span className="rounded-full border border-[#e8e6e1] bg-[#faf9f7] px-2.5 py-1 text-[8px] text-[#77736c]">
                    {metric}
                  </span>
                )}

                {action && (
                  <span className="rounded-full border border-[#e8e6e1] bg-[#faf9f7] px-2.5 py-1 text-[8px] text-[#77736c]">
                    {action}
                  </span>
                )}
              </div>
            )}
          </div>

          {onToggle && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#aaa79f] transition group-hover:bg-[#f7f6f3] group-hover:text-[#77736d]">
              {expanded ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronRight size={15} />
              )}
            </span>
          )}
        </div>
      </button>
      {checks && checks.length > 0 && (
  <div className="mt-4">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa79f]">
        Checks performed
      </span>

      <span className="text-[9px] font-medium text-[#77736c]">
        {checks.filter(
          (check) =>
            check.status === 'passed' ||
            check.status === 'fixed',
        ).length}{' '}
        / {checks.length} passed
      </span>
    </div>

    <div className="space-y-1.5">
      {checks.map((check) => (
        <div
          key={check.id}
          className="flex items-center gap-2.5 rounded-[10px] bg-[#faf9f7] px-3 py-2"
        >
          <span
            className={[
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
              check.status === 'passed'
                ? 'bg-[#e8f6ed] text-[#2d7c49]'
                : check.status === 'fixed'
                  ? 'bg-[#fff1dd] text-[#a96e10]'
                  : check.status === 'failed'
                    ? 'bg-[#fdeaea] text-[#b83f3f]'
                    : 'bg-[#f0eeff] text-[#7154c4]',
            ].join(' ')}
          >
            {checkIcon(check.status)}
          </span>

          <span className="min-w-0 flex-1 text-[10px] text-[#5f5b54]">
            {check.name}
          </span>

          <span
            className={[
              'text-[8px] font-semibold uppercase tracking-[0.06em]',
              check.status === 'passed'
                ? 'text-[#2d7c49]'
                : check.status === 'fixed'
                  ? 'text-[#a96e10]'
                  : check.status === 'failed'
                    ? 'text-[#b83f3f]'
                    : 'text-[#7154c4]',
            ].join(' ')}
          >
            {check.status}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

      {expanded && details && (
        <div className="border-t border-[#eceae5] bg-[#fcfbf9] px-5 py-5 sm:px-6">
          {details}
        </div>
      )}
    </section>
  );
}
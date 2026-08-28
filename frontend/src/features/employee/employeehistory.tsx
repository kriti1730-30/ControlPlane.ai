import { History, MessageSquareText, X } from 'lucide-react';

export type HistoryItem = {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  model: string;
};

type EmployeeHistoryProps = {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClose?: () => void;
};

function getGroup(timestamp: string) {
  if (timestamp.toLowerCase().includes('today')) {
    return 'TODAY';
  }

  if (timestamp.toLowerCase().includes('yesterday')) {
    return 'YESTERDAY';
  }

  return 'EARLIER';
}

export default function EmployeeHistory({
  items,
  onSelect,
  onClose,
}: EmployeeHistoryProps) {
  const groups = ['TODAY', 'YESTERDAY', 'EARLIER'];

  return (
    <aside className="flex h-full w-[290px] shrink-0 flex-col border-r border-[#e8e6e1] bg-[#fafaf8]">
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#e8e6e1] px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f0edff] text-[#7657d9]">
            <History size={15} strokeWidth={1.8} />
          </span>

          <div>
            <p className="text-[12px] font-medium text-[#393733]">
              History
            </p>

            <p className="text-[9px] text-[#9d9a92]">
              Previous tasks
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#aaa79f] transition hover:bg-white hover:text-[#5e5b54]"
            aria-label="Close history"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => {
          const groupItems = items.filter(
            (item) => getGroup(item.timestamp) === group,
          );

          if (!groupItems.length) {
            return null;
          }

          return (
            <section key={group} className="mb-5">
              <p className="px-3 pb-2 text-[8px] font-semibold tracking-[0.16em] text-[#aaa79f]">
                {group}
              </p>

              <div className="space-y-0.5">
                {groupItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="group flex w-full items-start gap-3 rounded-[11px] px-3 py-3 text-left transition hover:bg-white"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#f3f2ef] text-[#8d8980] transition group-hover:bg-[#eeeaff] group-hover:text-[#7455cf]">
                      <MessageSquareText
                        size={13}
                        strokeWidth={1.7}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-[#47443e]">
                        {item.title}
                      </span>

                      <span className="mt-1 block line-clamp-2 text-[9px] leading-4 text-[#959189]">
                        {item.preview}
                      </span>

                      <span className="mt-1.5 block text-[8px] text-[#b0ada5]">
                        {item.model} · {item.timestamp}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {!items.length && (
          <div className="px-3 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f0ed] text-[#aaa79f]">
              <History size={16} />
            </div>

            <p className="mt-3 text-[10px] font-medium text-[#77736b]">
              No previous tasks
            </p>

            <p className="mt-1 text-[9px] leading-4 text-[#aaa79f]">
              Completed conversations will appear here.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
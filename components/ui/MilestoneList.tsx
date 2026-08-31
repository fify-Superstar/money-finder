import { EmptyState } from "@/components/ui/EmptyState";

export type DisplayListItem = {
  id: string;
  title: string;
  detail?: string;
};

type MilestoneListProps = {
  items: DisplayListItem[];
  heading?: string;
};

export function MilestoneList({
  items,
  heading = "Milestones",
}: MilestoneListProps) {
  const headingId = "milestones-heading";

  if (items.length === 0) {
    return (
      <EmptyState
        title="No milestones yet"
        description="Milestones from your personalised Money Map will be listed here."
      />
    );
  }

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h2 id={headingId} className="font-display text-2xl tracking-tight">
        {heading}
      </h2>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex gap-4 rounded-2xl border border-line bg-cream px-4 py-3"
          >
            <span
              aria-hidden="true"
              className="font-display text-lg text-copper"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-medium">{item.title}</p>
              {item.detail ? (
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.detail}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

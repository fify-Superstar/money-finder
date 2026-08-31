import { EmptyState } from "@/components/ui/EmptyState";
import type { DisplayListItem } from "@/components/ui/MilestoneList";

type ActionListProps = {
  items: DisplayListItem[];
  heading?: string;
  headingId?: string;
};

export function ActionList({
  items,
  heading = "First actions",
  headingId = "actions-heading",
}: ActionListProps) {

  if (items.length === 0) {
    return (
      <EmptyState
        title="No first actions yet"
        description="Your first actions will appear here once a Money Map is produced."
      />
    );
  }

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h2 id={headingId} className="font-display text-2xl tracking-tight">
        {heading}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-line bg-cream px-4 py-3"
          >
            <p className="font-medium">{item.title}</p>
            {item.detail ? (
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {item.detail}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-moss">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}

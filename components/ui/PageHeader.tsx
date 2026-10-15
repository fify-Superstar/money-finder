type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="workspace-heading mb-8 space-y-4">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-moss">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-medium text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
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

type HeadlineProps = {
  title: string;
  subTitle: string;
};

export function Headline({ title, subTitle }: HeadlineProps) {
  return (
    <header className="mb-6 pb-4 -mx-6 px-6 border-b border-[var(--color-border-default)] flex flex-col gap-0">
      <h1 className="leading-none">{title}</h1>
      <h4 className="font-medium text-[var(--color-text-secondary)] leading-none">
        {subTitle}
      </h4>
    </header>
  );
}

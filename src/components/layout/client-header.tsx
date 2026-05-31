interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function ClientHeader({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 lg:px-8 border-b border-white/5">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
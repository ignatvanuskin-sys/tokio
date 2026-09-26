import Link from 'next/link';

type Crumb = { href: string; label: string };

/**
 * Shared page header for inner pages.
 * Keeps the H1 pattern and breadcrumbs consistent, and stays compact on mobile
 * so the first screen still shows real content.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-hairline bg-graphite">
      <div className="shell py-8 md:py-14">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Хлебные крошки" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-steel-600">
              {breadcrumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-steel-400" aria-current="page">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={c.href} className="hover:text-steel-200">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-2 max-w-3xl text-display-2 font-extrabold text-white">{title}</h1>
        {lead && (
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-steel-400 md:text-base">
            {lead}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

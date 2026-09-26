import { faq } from '@/data/faq';
import { business } from '@/data/business';
import { ActionLink } from './actions';

/**
 * FAQ built on native <details> — zero JavaScript, works before hydration,
 * announced correctly by screen readers, and still fast on a slow phone.
 */
export function FaqSection({ limit }: { limit?: number }) {
  const items = limit ? faq.slice(0, limit) : faq;

  return (
    <section aria-labelledby="faq-heading" className="shell py-12 md:py-20">
      <div className="max-w-xl">
        <span className="eyebrow">Вопросы</span>
        <h2 id="faq-heading" className="mt-2 text-display-3 font-semibold text-white">
          Частые вопросы
        </h2>
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-steel-400">
          Ответы только на то, что известно точно. Если чего-то нет в списке — позвоните или
          напишите в WhatsApp.
        </p>
      </div>

      <div className="mt-7 divide-y divide-hairline border-y border-hairline">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-left">
              <h3 className="text-[0.9375rem] font-semibold leading-snug text-steel-50 md:text-[1.0625rem]">
                {item.q}
              </h3>
              <span
                aria-hidden="true"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-steel-400 transition duration-300 group-open:rotate-45 group-open:border-accent/60 group-open:text-accent-bright"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <div className="pb-5 pr-8">
              <p className="max-w-prose text-[0.875rem] leading-relaxed text-steel-400">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ActionLink
          href={business.phone.e164}
          event="phone_clicked"
          payload={{ placement: 'faq' }}
          className="btn btn-primary btn-sm"
        >
          Позвонить {business.phone.display}
        </ActionLink>
        <ActionLink
          href={business.whatsapp.deepLink}
          event="whatsapp_clicked"
          payload={{ placement: 'faq' }}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          Спросить в WhatsApp
        </ActionLink>
      </div>
    </section>
  );
}

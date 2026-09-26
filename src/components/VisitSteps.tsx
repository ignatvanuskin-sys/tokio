import { photoRoles } from '@/data/gallery';
import { srcSet, fallbackSrc, intrinsicSize } from '@/lib/images';
import { Reveal } from './Reveal';

/**
 * "Как проходит запись" — the four steps, each with the real photo that shows
 * it (a car arriving on a tow truck → alignment work → on the lift → ready).
 *
 * This is uncertainty reduction, not persuasion: it tells a first-time visitor
 * exactly what will happen after they press the button.
 */
const steps = [
  {
    n: '01',
    title: 'Выберите услугу',
    body: 'Не знаете, что именно сломалось — выберите «диагностика». Этого достаточно, чтобы приехать и разобраться на месте.',
    photo: photoRoles.visitSteps.request,
    alt: 'Toyota Camry на платформе эвакуатора перед въездом в сервис',
  },
  {
    n: '02',
    title: 'Выберите удобное время',
    body: 'Слоты с 09:00 до 19:00, каждый день. Свободные часы показаны из реального расписания — занятые выбрать нельзя.',
    photo: photoRoles.visitSteps.diagnostics,
    alt: 'Измерительный датчик развал-схождения закреплён на колесе автомобиля',
  },
  {
    n: '03',
    title: 'Оставьте контакты',
    body: 'Имя, телефон и, если хотите, марка и модель. Комментарий — по желанию. Заполнение занимает меньше минуты.',
    photo: photoRoles.visitSteps.repair,
    alt: 'Автомобиль на подъёмнике в цехе автосервиса, работа снизу',
  },
  {
    n: '04',
    title: 'Мы подтвердим время',
    body: 'Заявка сразу уходит в сервис. Мы звоним по указанному номеру и подтверждаем время — оно подтверждается мастером, а не автоматом.',
    photo: photoRoles.visitSteps.handover,
    alt: 'Автомобиль после работ на площадке перед сервисом',
  },
];

export function VisitSteps() {
  return (
    <section aria-labelledby="steps-heading" className="shell py-12 md:py-20">
      <div className="max-w-xl">
        <span className="eyebrow">Как это работает</span>
        <h2 id="steps-heading" className="mt-2 text-display-3 font-semibold text-white">
          Как проходит запись
        </h2>
        <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-steel-400">
          Четыре шага, меньше минуты, без регистрации и без звонка «для начала».
        </p>
      </div>

      {/* Mobile: horizontal snap rail. Desktop: 4-up grid. */}
      <ol className="rail mt-7 -mx-gutter px-gutter md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {steps.map((s, i) => {
          const { width, height } = intrinsicSize(s.photo, 640);
          return (
            <Reveal
              as="li"
              key={s.n}
              delay={i * 60}
              className="w-[74vw] max-w-[300px] shrink-0 md:w-auto md:max-w-none"
            >
              <figure className="card metal-top flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-sunken">
                  <img
                    src={fallbackSrc(s.photo)}
                    srcSet={srcSet(s.photo)}
                    sizes="(min-width: 768px) 24vw, 74vw"
                    width={width}
                    height={height}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-3 top-3 grid h-8 min-w-8 place-items-center rounded-md border border-white/15 bg-ink/70 px-2 font-mono text-[0.75rem] font-bold text-white backdrop-blur-sm tnum"
                  >
                    {s.n}
                  </span>
                </div>
                <figcaption className="flex flex-1 flex-col p-4">
                  <h3 className="text-[0.9375rem] font-bold text-white">{s.title}</h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-steel-400">{s.body}</p>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}

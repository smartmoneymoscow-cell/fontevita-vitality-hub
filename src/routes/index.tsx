import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Baby,
  BadgeCheck,
  Leaf,
  Lock,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Truck,
  Droplets,
  Package,
  CheckCircle2,
} from "lucide-react";
import { CartProvider } from "@/components/cart-context";
import { CartPanel } from "@/components/cart-panel";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Quiz } from "@/components/quiz";
import { Reviews } from "@/components/reviews";
import { Faq } from "@/components/faq";
import { products } from "@/data/products";
import {
  organizationSchema,
  productSchema,
  websiteSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/seo-schema";
import logo from "@/assets/logo-mark.png.asset.json";
import { HeroBottles } from "@/components/hero-bottles";
import combo from "@/assets/combo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "FonteVita — витамины и БАДы для всей семьи" },
      {
        name: "description",
        content:
          "FonteVita: коллаген, магний + B6 и омега 3 в проверенных дозировках. Сертифицированные БАДы для энергии, спокойствия и красоты. Доставка по России.",
      },
      { property: "og:title", content: "FonteVita — витамины и БАДы для всей семьи" },
      {
        property: "og:description",
        content:
          "Коллаген, магний + B6 и омега 3 в честных дозировках. Сертифицированное качество FonteVita.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://fontevita.ru/" },
      { property: "og:image", content: "https://fontevita.ru/__l5e/assets-v1/ace176ff-1b22-489c-a209-196f67f2c7b6/logo-mark.png" },
      { property: "og:locale", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FonteVita — витамины и БАДы для всей семьи" },
      {
        name: "twitter:description",
        content:
          "Коллаген, магний + B6 и омега 3 в честных дозировках. Сертифицированное качество FonteVita.",
      },
      { name: "twitter:image", content: "https://fontevita.ru/__l5e/assets-v1/ace176ff-1b22-489c-a209-196f67f2c7b6/logo-mark.png" },
    ],
    links: [{ rel: "canonical", href: "https://fontevita.ru/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationSchema()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteSchema()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(faqSchema()),
      },
      ...productSchema().map((schema) => ({
        type: "application/ld+json" as const,
        children: JSON.stringify(schema),
      })),
    ],
  }),
});

const advantages = [
  { icon: ShieldCheck, title: "Сертифицировано", text: "Каждая партия проходит контроль качества" },
  { icon: Leaf, title: "Честный состав", text: "Без лишних добавок и красителей" },
  { icon: Sparkles, title: "Рабочие дозировки", text: "Дозировки указаны прямо на упаковке" },
  { icon: Truck, title: "Быстрая доставка", text: "По всей России, бесплатно от 3000 ₽" },
];

const qualityPoints = [
  {
    icon: Baby,
    title: "Крышка с защитой от детей",
    text: "Открывается только с нажатием — банка безопасна дома, где есть малыши.",
  },
  {
    icon: Lock,
    title: "Защитная мембрана",
    text: "Герметичная фольга под крышкой подтверждает, что банку никто не вскрывал.",
  },
  {
    icon: Droplets,
    title: "Непрозрачная банка",
    text: "Плотный пластик не пропускает свет и сохраняет активность формулы до конца курса.",
  },
  {
    icon: Package,
    title: "Термоусадочная плёнка",
    text: "Заводская плёнка на крышке — гарантия целостности при доставке.",
  },
];

const authSteps = [
  { icon: QrCode, title: "Найдите код", text: "Код Data Matrix напечатан на упаковке продукта." },
  {
    icon: ScanLine,
    title: "Отсканируйте",
    text: "Наведите камеру в бесплатном приложении «Честный знак».",
  },
  {
    icon: BadgeCheck,
    title: "Проверьте статус",
    text: "Приложение покажет производителя, партию и срок годности.",
  },
];

const stats = [
  { value: 12000, suffix: "+", label: "семей уже с нами" },
  { value: 4.9, suffix: "", decimals: 1, label: "средняя оценка покупателей" },
  { value: 100, suffix: "%", label: "партий с лабораторным протоколом" },
];

function AnimatedCounter({ value, suffix, decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = eased * value;
            setDisplay(decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString("ru-RU"));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, decimals]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

function Index() {
  return (
    <CartProvider>
      <div id="top" className="min-h-dvh pb-20">
        <SiteHeader />
        <CartPanel />

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-sand via-background to-background">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--sun)_16%,transparent),transparent_72%)] blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-40 top-40 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--sky)_12%,transparent),transparent_72%)] blur-2xl"
            />
            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-12 md:grid-cols-[0.95fr_1.05fr] md:gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">

              <div className="animate-rise-in flex h-full flex-col justify-center text-center md:text-left">
                <h1 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
                  Забота, которая
                  <span className="sun-blob mx-2 inline-block px-2">чувствуется</span>
                  каждый день
                </h1>
                <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                  Коллаген, магний с витамином B6 и омега 3 в честных дозировках. Спокойный сон,
                  крепкий иммунитет и энергия для родителей и детей.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <a
                    href="#products"
                    className="cta-lift rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft"
                  >
                    Выбрать продукт
                  </a>
                  <a
                    href="#quiz"
                    className="cta-lift rounded-full border-2 border-border px-7 py-3 text-sm font-extrabold hover:border-primary hover:bg-sun-soft"
                  >
                    Подобрать за 30 секунд
                  </a>
                </div>

                <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 md:mx-0">
                  {stats.map((s) => (
                    <div key={s.label} className="text-center lg:text-left">
                      <dt className="font-display text-2xl font-bold sm:text-3xl">
                        <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                      </dt>
                      <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Bottle carousel */}
              <HeroBottles />

            </div>
          </section>

          {/* Advantages */}
          <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map((a, i) => (
                <Reveal key={a.title} delay={i * 90} className="h-full">
                  <div className="group soft-card relative flex h-full items-start gap-4 overflow-hidden p-5 text-left sm:p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--sun)_28%,transparent),transparent_70%)] opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sun-soft to-sand shadow-soft transition-transform duration-500 group-hover:scale-105">
                      <a.icon className="h-5 w-5 text-primary-foreground/80" />
                    </div>
                    <div className="relative min-w-0">
                      <h3 className="text-base font-bold leading-snug">{a.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>


          {/* Products */}
          <section id="products" className="scroll-mt-24 bg-sand py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold sm:text-4xl">Наши продукты</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    Три формулы, которые закрывают базовые потребности организма. Раскройте карточку,
                    чтобы увидеть состав и схему приёма.
                  </p>
                </div>
              </Reveal>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <Reveal key={p.id} delay={i * 110} className="h-full">
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Quiz */}
          <section id="quiz" className="scroll-mt-24 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <Reveal>
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <h2 className="text-3xl font-bold sm:text-4xl">Какой БАД вам подойдёт</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    Три вопроса о самочувствии — и мы подскажем формулу, с которой стоит начать.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <Quiz />
              </Reveal>
            </div>
          </section>

          {/* Quality */}
          <section id="quality" className="scroll-mt-24 bg-sand py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold sm:text-4xl">Качество и подлинность</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    Мы бережём каждую капсулу: от непрозрачной банки до маркировки «Честный знак»,
                    которую вы можете проверить сами.
                  </p>
                </div>
              </Reveal>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <Reveal>
                  <div className="soft-card h-full p-6 sm:p-8">
                    <h3 className="text-xl font-bold">Четыре уровня защиты банки</h3>
                    <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                      {qualityPoints.map((p) => (
                        <li key={p.title} className="flex gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-soft">
                            <p.icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-bold">{p.title}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                              {p.text}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>

                <Reveal delay={120}>
                  <div className="soft-card h-full p-6 sm:p-8">
                    <h3 className="text-xl font-bold">Проверьте подлинность за 10 секунд</h3>
                    <ol className="mt-6">
                      {authSteps.map((s, i) => (
                        <li key={s.title} className={`flex gap-4 ${i < authSteps.length - 1 ? "pb-6" : ""}`}>
                          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun-soft font-display text-base font-bold">
                            {i + 1}
                            {i < authSteps.length - 1 && (
                              <span
                                aria-hidden
                                className="absolute left-1/2 top-full h-full w-px -translate-x-1/2 bg-border"
                              />
                            )}
                          </span>
                          <span>
                            <span className="flex items-center gap-2 text-sm font-bold">
                              <s.icon className="h-4 w-4" />
                              {s.title}
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                              {s.text}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-6 flex items-start gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                      Все продукты FonteVita зарегистрированы и промаркированы в государственной
                      системе «Честный знак».
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Combo */}
          <section className="relative overflow-hidden bg-gradient-to-b from-sky-soft via-sky-soft to-background py-16 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-32 top-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--sky)_28%,transparent),transparent_72%)] blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 bottom-0 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--sun)_22%,transparent),transparent_72%)] blur-2xl"
            />
            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
              <Reveal>
                <div className="text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground shadow-soft backdrop-blur">
                    Комплексный приём
                  </span>
                  <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Работают лучше вместе</h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed lg:mx-0">
                    Для укрепления иммунитета сочетайте приём Омега-3 с витамином D3. Магний с B6
                    поддержит спокойствие, а коллаген — кожу, волосы и суставы.
                  </p>
                  <ul className="mx-auto mt-6 max-w-md space-y-2.5 text-left">
                    {[
                      "Омега 3 + D3 — иммунитет и сосуды",
                      "Магний + B6 — сон и спокойствие",
                      "Коллаген — кожа, волосы, суставы",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#products"
                    className="cta-lift mt-7 inline-block rounded-full bg-card px-7 py-3.5 text-sm font-extrabold shadow-soft"
                  >
                    Собрать комплекс
                  </a>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="relative mx-auto w-full max-w-md">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-6 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--card)_75%,transparent),transparent_72%)] blur-2xl"
                  />
                  <img
                    src={combo.url}
                    alt="Омега 3 и витамин D3+K2 FonteVita рядом"
                    className="relative w-full rounded-[2rem] object-contain drop-shadow-[0_30px_40px_rgba(60,70,90,0.18)]"
                    loading="lazy"
                  />
                </div>
              </Reveal>
            </div>
          </section>


          {/* Reviews */}
          <section id="reviews" className="scroll-mt-24 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold sm:text-4xl">Отзывы покупателей</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    Более 12 000 семей уже принимают FonteVita. Вот что они рассказывают.
                  </p>
                </div>
              </Reveal>
              <div className="mt-10">
                <Reveal delay={100}>
                  <Reviews />
                </Reveal>
              </div>
            </div>
          </section>

          {/* About */}
          <section id="about" className="scroll-mt-24 bg-sand py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="soft-card grid items-center gap-10 p-7 sm:p-12 lg:grid-cols-[0.9fr_1.1fr]">
                <Reveal>
                  <div className="relative flex items-center justify-center">
                    <div
                      aria-hidden
                      className="absolute h-40 w-40 rounded-full bg-sun-soft blur-2xl"
                    />
                    <img
                      src={logo.url}
                      alt="Логотип FonteVita"
                      className="relative w-full max-w-[180px] animate-float-soft object-contain"
                      loading="lazy"
                    />
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <div>
                    <h2 className="text-3xl font-bold sm:text-4xl">О бренде FonteVita</h2>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      Мы делаем добавки, которые не стыдно поставить на общий стол: понятные формулы,
                      честные дозировки и упаковка, нарисованная про настоящую семейную жизнь —
                      рыбалку, утреннюю йогу и сборы в школу.
                    </p>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      Каждый продукт производится на сертифицированной площадке, проходит
                      лабораторный контроль и получает маркировку «Честный знак». Мы не обещаем
                      чудес — мы даём рабочие дозировки и прозрачный состав.
                    </p>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {[
                        "Сырьё европейских поставщиков",
                        "Лабораторный протокол на партию",
                        "Никаких скрытых наполнителей",
                        "Поддержка до конца курса",
                      ].map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm leading-relaxed">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold sm:text-4xl">Частые вопросы</h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    Коротко о составах, сочетаниях и доставке.
                  </p>
                </div>
              </Reveal>
              <div className="mt-10">
                <Reveal delay={100}>
                  <Faq />
                </Reveal>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </CartProvider>
  );
}

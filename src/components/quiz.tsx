import { useMemo, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles, Check } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { products, formatPrice } from "@/data/products";

type Answer = "collagen" | "magnesium" | "omega";

const questions: { q: string; options: { label: string; value: Answer }[] }[] = [
  {
    q: "Что беспокоит вас чаще всего?",
    options: [
      { label: "Тусклая кожа, ломкие волосы и ногти", value: "collagen" },
      { label: "Тревога, раздражительность, плохой сон", value: "magnesium" },
      { label: "Нет энергии, частые простуды", value: "omega" },
    ],
  },
  {
    q: "Как проходит ваш обычный день?",
    options: [
      { label: "Много зеркал, встреч и фотографий", value: "collagen" },
      { label: "Стресс, дедлайны, поздние засыпания", value: "magnesium" },
      { label: "Работа за экраном и мало рыбы в рационе", value: "omega" },
    ],
  },
  {
    q: "Какой результат хотите увидеть через 2 месяца?",
    options: [
      { label: "Упругая кожа и крепкие суставы", value: "collagen" },
      { label: "Спокойствие и лёгкое засыпание", value: "magnesium" },
      { label: "Ясная голова и крепкий иммунитет", value: "omega" },
    ],
  },
];

export function Quiz() {
  const { add, setOpen } = useCart();
  const [step, setStep] = useState(0);
  const [fillingIdx, setFillingIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<"in" | "out" | "idle">("in");
  const [showResult, setShowResult] = useState(false);

  const results = useMemo(() => {
    if (answers.length < questions.length) return null;
    const tally = answers.reduce<Record<string, number>>((acc, a) => {
      acc[a] = (acc[a] ?? 0) + 1;
      return acc;
    }, {});
    const picked = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => products.find((p) => p.id === id))
      .filter((p): p is (typeof products)[number] => Boolean(p));
    return picked.length ? picked : [products[0]];
  }, [answers]);

  const total = results?.reduce((sum, p) => sum + p.price, 0) ?? 0;

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
    setPhase("in");
  };

  const progress = (Math.min(step, questions.length) / questions.length) * 100;

  // Trigger result animation after answers complete
  if (results && !showResult) {
    setTimeout(() => setShowResult(true), 100);
  }

  return (
    <div className="soft-card no-lift overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]" style={{ minHeight: "520px" }}>
        {/* Left: questions / results — fixed min-height to prevent layout jump */}
        <div className="flex flex-col p-6 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-sun-soft px-3 py-1.5 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Мини-подбор за 30 секунд
          </span>

          {!results ? (
            <div className="mt-6 flex flex-1 flex-col">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`mt-4 flex flex-1 flex-col ${phase === "out" ? "quiz-slide-out" : ""}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Вопрос {step + 1} из {questions.length}
                </p>
                <h3 className={"mt-2 text-2xl font-bold sm:text-3xl" + (phase === "in" ? " quiz-slide-in" : "")}>
                  {questions[step].q}
                </h3>
                <div className="mt-6 grid gap-3">
                  {questions[step].options.map((o, i) => (
                    <button
                      key={o.value + i}
                      onClick={() => {
                        setFillingIdx(i);
                        setTimeout(() => {
                          setAnswers((prev) => [...prev, o.value]);
                          setPhase("out");
                          setTimeout(() => {
                            setStep((s) => s + 1);
                            setFillingIdx(null);
                            setPhase("in");
                          }, 350);
                        }, 500);
                      }}
                      className={`quiz-fill group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left text-sm font-semibold transition-all duration-300 hover:border-primary active:scale-[0.98] ${fillingIdx === i ? "filling" : ""}`}
                      style={{
                        animationDelay: phase === "in" ? `${i * 80}ms` : "0ms",
                        animation: phase === "in" ? `rise-in 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both` : undefined,
                      }}
                    >
                      {o.label}
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Result with animated entrance */
            <div
              className={`mt-6 flex flex-1 flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Animated check icon */}
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf/15 transition-all duration-500 ${
                  showResult ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <Check className="h-7 w-7 text-leaf" />
              </div>

              <h3 className="text-2xl font-bold sm:text-3xl">
                {results.length === 1
                  ? `Ваш продукт — ${results[0].name}`
                  : `Ваша комбинация — ${results.map((p) => p.name).join(" + ")}`}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {results.length === 1
                  ? "По вашим ответам достаточно одного продукта."
                  : "По вашим ответам подойдёт связка из нескольких продуктов — они дополняют друг друга."}
              </p>

              <div className="mt-5 grid gap-3">
                {results.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 transition-all duration-500 ${
                      showResult ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: `${300 + i * 150}ms` }}
                  >
                    <img
                      src={p.image}
                      alt={`${p.name} FonteVita`}
                      className="h-14 w-14 shrink-0 object-contain"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.tagline}</p>
                    </div>
                    <span className="ml-auto shrink-0 text-sm font-bold">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={`mt-6 flex flex-wrap items-center gap-3 transition-all duration-500 ${
                  showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                <button
                  onClick={() => {
                    results.forEach((p) => add(p.id));
                    setOpen(true);
                  }}
                  className="cta-lift rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft"
                >
                  {results.length === 1 ? "Добавить в корзину" : "Добавить всё в корзину"} ·{" "}
                  {formatPrice(total)}
                </button>
                <button
                  onClick={reset}
                  className="cta-lift flex items-center gap-2 rounded-full border-2 border-border px-5 py-3 text-sm font-extrabold hover:border-foreground/20 hover:bg-secondary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Пройти заново
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: product images */}
        <div className="relative flex items-center justify-center gap-2 bg-gradient-to-br from-sky-soft to-sun-soft p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-card/60 blur-3xl"
          />
          {(results ?? [products[1]]).map((p, i) => {
            const count = (results ?? [products[1]]).length;
            const maxH = count >= 3 ? "max-h-[200px] sm:max-h-[260px]" : "max-h-[280px] sm:max-h-[340px]";
            return (
              <img
                key={p.id}
                src={p.image}
                alt={`${p.name} FonteVita`}
                style={{ animationDelay: `${i * 0.4}s` }}
                className={`relative w-auto animate-float-soft object-contain drop-shadow-[0_24px_30px_rgba(60,70,90,0.2)] ${maxH}`}
                loading="lazy"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

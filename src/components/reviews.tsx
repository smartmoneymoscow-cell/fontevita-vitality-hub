import { Star } from "lucide-react";


const base = import.meta.env.BASE_URL;

const defaultReviews = [
  {
    name: "Анна, 34",
    city: "Москва",
    product: "Коллаген",
    text: "Пью второй месяц вместе с витамином C. Кожа стала заметно ровнее, а ногти перестали слоиться. Отдельное спасибо за честную дозировку на банке.",
    avatar: `${base}anna-avatar.png`,
    rating: 5,
  },
  {
    name: "Дмитрий, 41",
    city: "Казань",
    product: "Омега 3",
    text: "Брал для всей семьи. Капсулы без рыбного послевкусия, дети пьют спокойно. Проверил маркировку в «Честном знаке» — всё сходится.",
    avatar: `${base}dmitry-avatar.png`,
    rating: 5,
  },
  {
    name: "Ольга, 29",
    city: "Санкт-Петербург",
    product: "Магний + B6",
    text: "Наконец-то засыпаю без пролистывания ленты до двух ночи. Стало меньше судорог в икрах после тренировок.",
    avatar: `${base}olga-avatar.png`,
    rating: 5,
  },
  {
    name: "Мария, 47",
    city: "Екатеринбург",
    product: "Коллаген",
    text: "Заказывала маме и себе. Упаковка приехала в плёнке, банка непрозрачная, мембрана целая — доверие с первой секунды.",
    avatar: `${base}maria-avatar.png`,
    rating: 5,
  },
];

export function Reviews() {

  return (
    <div className="space-y-8">
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {defaultReviews.map((r) => (
          <figure
            key={r.name + r.product}
            className="soft-card flex h-auto w-[86%] shrink-0 snap-center flex-col gap-4 p-6 sm:w-[72%] sm:p-7 md:w-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {r.avatar ? (
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-soft font-display text-base font-bold">
                    {r.name.charAt(0)}
                  </div>
                )}
                <div>
                  <figcaption className="text-sm font-bold">{r.name}</figcaption>
                  {r.city && (
                    <p className="text-xs text-muted-foreground">{r.city}</p>
                  )}
                </div>
              </div>
              <div
                className="flex gap-0.5"
                aria-label={`Оценка ${r.rating} из 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.rating
                        ? "fill-sun text-sun"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
            </div>
            <blockquote className="text-sm leading-relaxed text-muted-foreground">
              «{r.text}»
            </blockquote>
            <span className="mt-auto w-fit rounded-full bg-secondary px-3 py-1 text-xs font-bold">
              {r.product}
            </span>
          </figure>
        ))}
      </div>
    </div>
  );
}

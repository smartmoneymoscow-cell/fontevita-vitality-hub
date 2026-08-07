import { useRef, useState } from "react";
import { ChevronDown, ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPrice, type Product } from "@/data/products";

const tint: Record<Product["accent"], string> = {
  sun: "from-sun-soft to-card",
  sky: "from-sky-soft to-card",
  coral: "from-coral-soft to-card",
};

export function ProductCard({ product }: { product: Product }) {
  const { lines, add, inc, dec, setOpen } = useCart();
  const [expanded, setExpanded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const line = lines.find((l) => l.product.id === product.id);
  const qty = line?.qty ?? 0;

  const triggerFly = () => {
    const img = imgRef.current;
    const target = document.getElementById("cart-button");
    if (!img || !target) return;

    // Temporarily remove float animation for stable position
    const prevAnim = img.style.animation;
    img.style.animation = "none";
    void img.offsetHeight;
    const a = img.getBoundingClientRect();
    img.style.animation = prevAnim;
    const b = target.getBoundingClientRect();

    // Create flying image directly on body (escapes overflow:hidden)
    const flyer = document.createElement("img");
    flyer.src = product.image;
    flyer.alt = "";
    flyer.setAttribute("aria-hidden", "true");
    Object.assign(flyer.style, {
      position: "fixed",
      left: a.left + "px",
      top: a.top + "px",
      width: a.width + "px",
      height: a.height + "px",
      zIndex: "9999",
      pointerEvents: "none",
      objectFit: "contain",
      "--fly-x": (b.left + b.width / 2 - (a.left + a.width / 2)) + "px",
      "--fly-y": (b.top + b.height / 2 - (a.top + a.height / 2)) + "px",
      animation: "fly-to-cart 0.7s cubic-bezier(0.5,0,0.75,0) forwards",
    } as any);
    document.body.appendChild(flyer);
    setTimeout(() => flyer.remove(), 750);
  };

  const handleAdd = () => {
    triggerFly();
    add(product.id);
    setTimeout(() => setOpen(true), 650);
  };

  const handleInc = () => {
    triggerFly();
    inc(product.id);
  };

  return (
    <article id={`product-${product.id}`} className="soft-card no-lift relative flex h-full scroll-mt-24 flex-col overflow-hidden">
      <span className="absolute left-4 top-4 z-10 rounded-full bg-card/95 px-3 py-1 text-xs font-bold shadow-soft">
        {product.capsules}
      </span>
      <div className="relative">
        <div
          className={`relative flex items-end justify-center overflow-hidden bg-gradient-to-b ${tint[product.accent]} px-6 pt-16 pb-8 sm:pt-20 sm:pb-10`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-8 h-44 w-44 -translate-x-1/2 rounded-full bg-card/70 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/60 to-transparent blur-sm"
          />
          <div className="relative">
            <img
              ref={imgRef}
              src={product.image}
              alt={`${product.name} FonteVita — ${product.capsules}`}
              className="relative h-56 w-auto animate-float-soft object-contain drop-shadow-[0_22px_28px_rgba(60,70,90,0.18)] sm:h-64"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-bold sm:text-2xl">{product.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          {product.highlights.map((h) => (
            <div key={h.label} className="flex flex-col items-center rounded-xl bg-secondary/80 px-2 py-3 text-center">
              <dt className="font-display text-sm font-bold leading-none">{h.value}</dt>
              <dd className="mt-1.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">{h.label}</dd>
            </div>
          ))}
        </dl>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-5 flex items-center gap-1.5 self-start text-sm font-bold text-muted-foreground transition-all duration-200 hover:text-foreground hover:scale-[1.02] active:scale-95"
        >
          {expanded ? "Свернуть" : "Подробнее"}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className="grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pb-1 pt-1">
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-sm leading-relaxed">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 rounded-2xl bg-secondary/70 p-4 text-sm">
                <p>
                  <span className="font-bold">Дозировка: </span>
                  <span className="text-muted-foreground">{product.dose}</span>
                </p>
                <p>
                  <span className="font-bold">Приём: </span>
                  <span className="text-muted-foreground">{product.intake}</span>
                </p>
                <p>
                  <span className="font-bold">Состав: </span>
                  <span className="text-muted-foreground">{product.composition}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          {qty > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-leaf px-1 py-1 shadow-soft">
              <button
                onClick={() => dec(product.id)}
                aria-label="Уменьшить количество"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-leaf transition-all duration-200 hover:bg-white hover:scale-110 active:scale-90"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-extrabold text-white">{qty}</span>
              <button
                onClick={handleInc}
                aria-label="Увеличить количество"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-leaf transition-all duration-200 hover:bg-white hover:scale-110 active:scale-90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="cta-lift flex h-[3.125rem] w-[9.25rem] shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-sm font-extrabold text-primary-foreground shadow-soft sm:w-[9.5rem] hover:bg-leaf hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              В корзину
            </button>
          )}
        </div>
      </div>

    </article>
  );
}

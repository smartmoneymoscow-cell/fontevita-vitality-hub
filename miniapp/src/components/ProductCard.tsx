import { useRef, useState } from "react";
import { ChevronDown, ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useTelegram } from "@/hooks/useTelegram";
import { formatPrice, type Product } from "@/data/products";

const tint: Record<Product["accent"], string> = {
  sun: "from-sun-soft to-card",
  sky: "from-sky-soft to-card",
  coral: "from-coral-soft to-card",
};

export function ProductCard({ product }: { product: Product }) {
  const { add, inc, dec, lines } = useCart();
  const { haptic, hapticSuccess } = useTelegram();
  const [expanded, setExpanded] = useState(false);
  const [flying, setFlying] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fly, setFly] = useState({ x: 0, y: 0, left: 0, top: 0, w: 0, h: 0 });

  const line = lines.find((l) => l.product.id === product.id);
  const qty = line?.qty ?? 0;

  const triggerFly = () => {
    const stage = stageRef.current;
    const target = document.getElementById("cart-button");
    if (stage && target) {
      const a = stage.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const size = 140;
      const cx = a.left + a.width / 2;
      const cy = a.top + a.height / 2;
      setFly({
        left: cx - size / 2,
        top: cy - size / 2,
        w: size,
        h: size,
        x: b.left + b.width / 2 - cx,
        y: b.top + b.height / 2 - cy,
      });
      setFlying(true);
      setTimeout(() => setFlying(false), 750);
    }
  };

  const handleAdd = () => {
    haptic("medium");
    triggerFly();
    add(product.id);
    hapticSuccess();
  };

  const handleInc = () => {
    haptic("light");
    triggerFly();
    inc(product.id);
  };

  const toggleExpanded = () => {
    haptic("light");
    setExpanded((v) => !v);
  };

  return (
    <article className="soft-card relative flex h-full flex-col overflow-hidden">
      <span className="absolute left-4 top-4 z-10 rounded-full bg-card/95 px-3 py-1 text-xs font-bold shadow-soft">
        {product.capsules}
      </span>

      <div className="relative">
        <div
          ref={stageRef}
          className={`relative flex items-end justify-center overflow-hidden bg-gradient-to-b ${tint[product.accent]} px-6 pt-16 pb-8`}
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
              className="relative h-56 w-auto animate-float-soft object-contain drop-shadow-[0_22px_28px_rgba(60,70,90,0.18)]"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-2">
          {product.highlights.map((h) => (
            <div
              key={h.label}
              className="flex flex-col items-center rounded-xl bg-secondary/80 px-2 py-3 text-center"
            >
              <dt className="font-display text-sm font-bold leading-none">{h.value}</dt>
              <dd className="mt-1.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                {h.label}
              </dd>
            </div>
          ))}
        </dl>

        <button
          onClick={toggleExpanded}
          aria-expanded={expanded}
          className="mt-5 flex items-center gap-1.5 self-start text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
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

        {/* Price + Cart button — fixed width, never wraps */}
        <div className="mt-2 flex min-w-0 items-center justify-between gap-2 pt-2">
          <div className="min-w-0 flex-1">
            <span className="font-display text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {qty > 0 ? (
            <div className="flex h-[3.125rem] w-[9.25rem] shrink-0 items-center justify-between rounded-full bg-leaf px-1.5 shadow-soft">
              <button
                onClick={() => {
                  haptic("light");
                  dec(product.id);
                }}
                aria-label="Уменьшить количество"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card/90 text-leaf transition-all duration-200 hover:scale-110 hover:bg-card active:scale-90"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-extrabold text-card">{qty}</span>
              <button
                onClick={handleInc}
                aria-label="Увеличить количество"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card/90 text-leaf transition-all duration-200 hover:scale-110 hover:bg-card active:scale-90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex h-[3.125rem] w-[9.25rem] shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-sm font-extrabold text-primary-foreground shadow-soft transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              В корзину
            </button>
          )}
        </div>
      </div>

      {flying && (
        <img
          src={product.image}
          alt=""
          aria-hidden
          className="pointer-events-none fixed z-[60] object-contain"
          style={
            {
              left: fly.left,
              top: fly.top,
              width: fly.w,
              height: fly.h,
              "--fly-x": `${fly.x}px`,
              "--fly-y": `${fly.y}px`,
              animation: "fly-to-cart 0.7s cubic-bezier(0.5,0,0.75,0) forwards",
            } as React.CSSProperties
          }
        />
      )}
    </article>
  );
}

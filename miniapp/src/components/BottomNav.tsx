import { ShoppingBag, User, Store, HeartPulse } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useTelegram } from "@/hooks/useTelegram";

type Tab = "catalog" | "health" | "cart" | "profile";

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  const { count } = useCart();
  const { haptic } = useTelegram();

  const tabs: { id: Tab; label: string; icon: typeof Store; badge?: number }[] = [
    { id: "catalog", label: "Каталог", icon: Store },
    { id: "health", label: "Здоровье", icon: HeartPulse },
    { id: "cart", label: "Корзина", icon: ShoppingBag, badge: count },
    { id: "profile", label: "Профиль", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic("light");
                onChange(tab.id);
              }}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 pt-2.5 text-[11px] font-bold transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="relative" id={tab.id === "cart" ? "cart-button" : undefined}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-extrabold text-card animate-pop-badge">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Lock,
  Edit3,
  Check,
  Clock,
  Truck,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";
import { CartPanel } from "@/components/cart-panel";
import { SiteFooter } from "@/components/site-footer";
import { getOrders, type Order, type OrderCustomer } from "@/lib/order-service";
import { formatPrice, products } from "@/data/products";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "Личный кабинет — FonteVita" },
      { name: "description", content: "Ваши заказы, личные данные и история покупок FonteVita." },
    ],
    links: [{ rel: "canonical", href: "/account" }],
  }),
});

const statusMap: Record<Order["status"], { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Ожидает подтверждения", icon: Clock, color: "text-muted-foreground" },
  confirmed: { label: "Подтверждён", icon: Check, color: "text-sky" },
  shipped: { label: "Отправлен", icon: Truck, color: "text-primary" },
  delivered: { label: "Доставлен", icon: CheckCircle2, color: "text-leaf" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProductImage(productId: string): string | undefined {
  return products.find((p) => p.id === productId)?.image;
}

/* ─── Order Card ─── */
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusMap[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="soft-card overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-base font-bold">{order.id}</span>
            <span className={`flex items-center gap-1 text-xs font-bold ${status.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold">{formatPrice(order.total)}</span>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className="grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-border px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            {/* Items */}
            <ul className="space-y-3">
              {order.items.map((item) => {
                const img = getProductImage(item.productId);
                return (
                  <li key={item.productId} className="flex items-center gap-3">
                    {img && (
                      <img
                        src={img}
                        alt={item.name}
                        className="h-14 w-14 shrink-0 rounded-xl bg-secondary object-contain"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-extrabold">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Delivery info */}
            <div className="rounded-2xl bg-secondary/70 p-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{order.customer.address}</span>
              </div>
              {order.customer.comment && (
                <p className="mt-2 text-muted-foreground">💬 {order.customer.comment}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Editor ─── */
function ProfileEditor() {
  const [profile, setProfile] = useState<OrderCustomer>({
    name: "",
    phone: "",
    email: "",
    address: "",
    comment: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fontevita-profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  const update = (field: keyof OrderCustomer, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("fontevita-profile", JSON.stringify(profile));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="soft-card space-y-5 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 text-xl font-bold">
        <Edit3 className="h-5 w-5" />
        Личные данные
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <User className="h-4 w-4" />
            Имя и фамилия
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Иван Иванов"
            autoComplete="name"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <Phone className="h-4 w-4" />
            Телефон
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+7 900 123-45-67"
            autoComplete="tel"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="ivan@example.com"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="h-4 w-4" />
            Адрес доставки
          </label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="г. Москва, ул. Пушкина, д. 10"
            autoComplete="street-address"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-soft transition-all duration-300 hover:brightness-105 active:scale-95"
        >
          <Check className="h-4 w-4" />
          Сохранить
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-bold text-leaf animate-rise-in">
            <CheckCircle2 className="h-4 w-4" />
            Сохранено
          </span>
        )}
      </div>
    </form>
  );
}

/* ─── Main Account Page ─── */
function AccountPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    try {
      setIsAuthed(localStorage.getItem("fontevita-authed") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthed) {
      setOrders(getOrders().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
    }
  }, [isAuthed]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("fontevita-authed");
    } catch {}
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return (
      <CartProvider>
        <div className="min-h-dvh overflow-x-hidden">
          <SiteHeader />
          <CartPanel />
          <main className="mx-auto flex w-full max-w-md flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sun-soft">
              <User className="h-10 w-10 text-foreground" />
            </div>
            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Вход в кабинет</h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              Войдите, чтобы видеть заказы и личные данные.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                try { localStorage.setItem("fontevita-authed", "1"); } catch {}
                setIsAuthed(true);
              }}
              className="mt-8 w-full space-y-4"
            >
              <div className="text-left">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="ivan@example.com"
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="text-left">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <Lock className="h-4 w-4" />
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
              >
                Войти
              </button>
              <p className="text-sm text-muted-foreground">
                <button type="button" className="underline transition-colors hover:text-foreground">
                  Забыли пароль?
                </button>
              </p>
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <button type="button" className="font-bold underline transition-colors hover:text-foreground">
                  Зарегистрироваться
                </button>
              </p>
            </form>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
          </main>
          <SiteFooter />
        </div>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-dvh overflow-x-hidden">
        <SiteHeader />
        <CartPanel />

        <main>
          {/* Header */}
          <section className="bg-gradient-to-b from-sand via-background to-background">
            <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sun-soft">
                    <User className="h-7 w-7 text-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">Личный кабинет</h1>
                    <p className="text-sm text-muted-foreground">
                      Заказы и личные данные
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:border-destructive hover:text-destructive active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-8 flex gap-2">
                <button
                  onClick={() => setTab("orders")}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                    tab === "orders"
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Мои заказы
                  {orders.length > 0 && (
                    <span className="ml-1 rounded-full bg-white/30 px-2 py-0.5 text-xs">
                      {orders.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTab("profile")}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                    tab === "profile"
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                  Личные данные
                </button>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
            {tab === "orders" ? (
              orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sun-soft">
                    <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold">Пока нет заказов</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Самое время начать — выберите витамины для всей семьи.
                  </p>
                  <Link
                    to="/"
                    className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-soft transition-all hover:brightness-105 active:scale-95"
                  >
                    Перейти к продуктам
                  </Link>
                </div>
              )
            ) : (
              <ProfileEditor />
            )}
          </section>
        </main>

        <SiteFooter />
      </div>
    </CartProvider>
  );
}

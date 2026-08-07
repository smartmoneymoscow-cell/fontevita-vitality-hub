import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Lock,
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
          className="cta-lift flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-soft"
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


/* ─── Auth (login / register / reset) ─── */
type AuthMode = "login" | "register" | "reset";

function AuthScreen({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "reset") {
      if (!email.includes("@")) return setError("Введите корректный email");
      setSent(true);
      return;
    }

    if (!email.includes("@")) return setError("Введите корректный email");
    if (password.length < 6) return setError("Пароль должен быть не короче 6 символов");
    if (mode === "register" && name.trim().length < 2) return setError("Укажите имя");

    try {
      localStorage.setItem("fontevita-authed", "1");
      const raw = localStorage.getItem("fontevita-profile");
      const profile = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "fontevita-profile",
        JSON.stringify({ ...profile, email, ...(mode === "register" ? { name } : {}) }),
      );
    } catch {}
    onAuthed();
  };

  return (
    <div className="soft-card no-lift w-full max-w-md p-6 text-left sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sun-soft">
          <User className="h-8 w-8 text-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
          {mode === "login" ? "Вход в кабинет" : mode === "register" ? "Регистрация" : "Восстановление пароля"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {mode === "login"
            ? "Войдите, чтобы видеть заказы и личные данные."
            : mode === "register"
              ? "Создайте аккаунт — это займёт минуту."
              : "Пришлём ссылку для смены пароля на почту."}
        </p>
      </div>

      {mode === "reset" && sent ? (
        <div className="mt-6 space-y-5 text-center">
          <div className="rounded-2xl bg-leaf/10 p-5 text-sm leading-relaxed text-foreground">
            Если аккаунт с адресом <span className="font-bold">{email}</span> существует, мы отправили
            письмо со ссылкой для восстановления пароля.
          </div>
          <button
            onClick={() => {
              setSent(false);
              setMode("login");
            }}
            className="cta-lift w-full rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft"
          >
            Вернуться ко входу
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold" htmlFor="auth-name">
                <User className="h-4 w-4" />
                Имя
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                autoComplete="name"
                className={inputCls}
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm font-bold" htmlFor="auth-email">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mail.ru"
              autoComplete="email"
              className={inputCls}
            />
          </div>

          {mode !== "reset" && (
            <div>
              <label className="flex items-center gap-2 text-sm font-bold" htmlFor="auth-password">
                <Lock className="h-4 w-4" />
                Пароль
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={inputCls}
              />
            </div>
          )}

          {error && <p className="text-sm font-bold text-destructive">{error}</p>}

          <button
            type="submit"
            className="cta-lift w-full rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft"
          >
            {mode === "login" ? "Войти" : mode === "register" ? "Создать аккаунт" : "Отправить ссылку"}
          </button>
        </form>
      )}

      <div className="mt-5 space-y-2 text-center text-sm">
        {mode === "login" && (
          <>
            <button
              onClick={() => {
                setMode("reset");
                setError("");
              }}
              className="font-bold text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Забыли пароль?
            </button>
            <p className="text-muted-foreground">
              Нет аккаунта?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="font-bold text-primary underline-offset-4 transition-colors hover:underline"
              >
                Зарегистрироваться
              </button>
            </p>
          </>
        )}
        {mode !== "login" && (
          <button
            onClick={() => {
              setMode("login");
              setError("");
              setSent(false);
            }}
            className="font-bold text-primary underline-offset-4 transition-colors hover:underline"
          >
            Вернуться ко входу
          </button>
        )}
      </div>

      <Link
        to="/"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        На главную
      </Link>
    </div>
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
        <div className="min-h-dvh overflow-x-hidden bg-gradient-to-b from-sand via-background to-background">
          <SiteHeader />
          <CartPanel />
          <main className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 py-14 sm:px-6 sm:py-20">
            <AuthScreen onAuthed={() => setIsAuthed(true)} />
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
                    className="cta-lift mt-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-soft"
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

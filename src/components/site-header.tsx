import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/cart-context";
import logo from "@/assets/logo-mark.png.asset.json";


const links = [
  { to: "/", label: "Главная" },
  { to: "/#products", label: "Продукты" },
  { to: "/#quiz", label: "Подбор" },
  { to: "/#quality", label: "Качество" },
  { to: "/#reviews", label: "Отзывы" },
  { to: "/#faq", label: "Вопросы" },
];


export function SiteHeader() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const check = () => {
      try { setIsAuthed(localStorage.getItem("fontevita-authed") === "1"); } catch {}
    };
    check();
    window.addEventListener("storage", check);
    window.addEventListener("focus", check);
    return () => { window.removeEventListener("storage", check); window.removeEventListener("focus", check); };
  }, []);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-background/85 shadow-soft backdrop-blur-md" : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center" aria-label="FonteVita — на главную">
          <img
            src={logo.url}
            alt="Логотип FonteVita"
            className="h-11 w-auto object-contain sm:h-14"
            width={160}
            height={112}
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative rounded-full px-2 py-2 text-sm font-bold text-muted-foreground transition-all duration-200 hover:bg-sun-soft hover:text-primary active:scale-95 active:text-foreground lg:px-3.5 lg:text-base"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/blog"
            className="relative rounded-full px-2 py-2 text-sm font-bold text-muted-foreground transition-all duration-200 hover:bg-sun-soft hover:text-primary active:scale-95 lg:px-3.5 lg:text-base"
          >
            Блог
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            id="cart-button"
            onClick={() => setOpen(true)}
            aria-label={`Открыть корзину, товаров: ${count}`}
            className="cta-lift relative flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground shadow-soft"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Корзина</span>
            {count > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-extrabold text-card ${
                  bump ? "animate-pop-badge" : ""
                }`}
              >
                {count}
              </span>
            )}
          </button>

          <Link
            to="/account"
            aria-label={isAuthed ? "Личный кабинет" : "Войти в аккаунт"}
            className="cta-lift flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-2 text-sm font-bold text-foreground backdrop-blur hover:border-primary hover:bg-sun-soft"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{isAuthed ? "Личный кабинет" : "Войти"}</span>
          </Link>
        </div>
      </div>


    </header>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import logo from "@/assets/logo-mark.png.asset.json";

const base = import.meta.env.BASE_URL;

const links = [
  { href: `${base}#top`, label: "Главная" },
  { href: `${base}#products`, label: "Продукты" },
  { href: `${base}#quiz`, label: "Подбор" },
  { href: `${base}#quality`, label: "Качество" },
  { href: `${base}#reviews`, label: "Отзывы" },
  { href: `${base}#faq`, label: "Вопросы" },
];

export function BlogHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-background/85 shadow-soft backdrop-blur-md" : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="FonteVita — на главную">
          <img
            src={logo.url}
            alt="Логотип FonteVita"
            className="h-11 w-auto object-contain sm:h-14"
            width={160}
            height={112}
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-base font-bold text-muted-foreground transition-all duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:text-foreground hover:after:origin-bottom-left hover:after:scale-x-100 active:scale-95 active:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/blog"
            className="relative text-base font-bold text-foreground transition-all duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:text-foreground hover:after:origin-bottom-left hover:after:scale-x-100 active:scale-95"
          >
            Блог
          </Link>
        </nav>

        <a
          href={`${base}#products`}
          className="cta-lift flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground shadow-soft"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Корзина</span>
        </a>
      </div>
    </header>
  );
}

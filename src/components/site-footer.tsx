import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-mark.png.asset.json";

const base = import.meta.env.BASE_URL;

export function SiteFooter() {
  return (
    <footer className="bg-sand py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <Link to="/" className="shrink-0" aria-label="FonteVita — на главную">
          <img src={logo.url} alt="FonteVita" className="h-12 w-auto object-contain" loading="lazy" />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Главная
          </Link>
          <a href={`${base}#products`} className="transition-colors hover:text-foreground">
            Продукты
          </a>
          <Link to="/blog" className="transition-colors hover:text-foreground">
            Блог
          </Link>
          <a href={`${base}#faq`} className="transition-colors hover:text-foreground">
            Вопросы
          </a>
        </nav>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          БАД. Не является лекарственным средством. Перед применением проконсультируйтесь со специалистом.
        </p>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FonteVita</p>
      </div>
    </footer>
  );
}

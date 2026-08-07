import { createFileRoute, notFound, useLocation } from "@tanstack/react-router";
import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";
import { CartPanel } from "@/components/cart-panel";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/blog/article-card";
import { CategoryPill } from "@/components/blog/category-pill";
import { Breadcrumbs, buildBreadcrumbJsonLd } from "@/components/blog/breadcrumbs";
import { getPostsByCategory, type BlogPost } from "@/data/blog-posts";
import { blogCategories, getCategoryBySlug } from "@/data/blog-categories";

export const Route = createFileRoute("/blog/category/$category")({
  loader: ({ params }) => {
    const category = getCategoryBySlug(params.category);
    if (!category) throw notFound();
    return { category, posts: getPostsByCategory(category.slug) };
  },
  component: CategoryPage,
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { category } = loaderData;
    return {
      meta: [
        { title: `${category.name}: статьи и советы — блог FonteVita` },
        { name: "description", content: category.seoDescription },
        { property: "og:title", content: `${category.name} — блог FonteVita` },
        { property: "og:description", content: category.seoDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/blog/category/${category.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/blog/category/${category.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${category.name} — блог FonteVita`,
            description: category.seoDescription,
            url: `/blog/category/${category.slug}`,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "Главная", url: "/" },
              { name: "Блог", url: "/blog" },
              { name: category.name, url: `/blog/category/${category.slug}` },
            ]),
          ),
        },
      ],
    };
  },
});

function getCategoryFromPath(): string {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function CategoryPage() {
  const location = useLocation();
  const categorySlug = getCategoryFromPath();
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  const posts = getPostsByCategory(category.slug);
  const otherCategories = blogCategories.filter((c) => c.slug !== category.slug);

  return (
    <CartProvider>
    <div className="min-h-dvh">
      <SiteHeader />
      <CartPanel />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-sand via-background to-background">
          <div className="relative mx-auto w-full max-w-4xl px-4 pb-12 pt-8 text-center sm:px-6 sm:pt-12">
            <Breadcrumbs items={[{ label: "Блог", to: "/blog" }, { label: category.shortName }]} />
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold shadow-soft sm:text-sm">
              <category.icon className="h-4 w-4" />
              Раздел блога
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-5xl">{category.name}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {category.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {otherCategories.map((c) => (
                <CategoryPill key={c.slug} category={c} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: BlogPost) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              В этом разделе пока нет статей — загляните позже.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
    </CartProvider>
  );
}

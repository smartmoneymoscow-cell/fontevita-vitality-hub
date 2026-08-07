import { createFileRoute, notFound } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { CartProvider } from "@/components/cart-context";
import { SiteHeader } from "@/components/site-header";
import { CartPanel } from "@/components/cart-panel";
import { SiteFooter } from "@/components/site-footer";
import { ArticleContent } from "@/components/blog/article-content";
import { ArticleFaq } from "@/components/blog/article-faq";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleCover } from "@/components/blog/article-cover";
import { CategoryPill } from "@/components/blog/category-pill";
import { RelatedProducts } from "@/components/blog/related-products";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Breadcrumbs, buildBreadcrumbJsonLd } from "@/components/blog/breadcrumbs";
import { getPostBySlug, getRelatedPosts, formatDate } from "@/data/blog-posts";
import { getCategoryBySlug } from "@/data/blog-categories";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return post;
  },
  component: ArticlePage,
  head: ({ loaderData: post }) => {
    if (!post) return {};
    const category = getCategoryBySlug(post.categorySlug);
    const title = post.metaTitle ?? `${post.title} — блог FonteVita`;

    return {
      meta: [
        { title },
        { name: "description", content: post.metaDescription },
        { name: "keywords", content: post.keywords.join(", ") },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${post.slug}` },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.metaDescription },
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.metaDescription,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            inLanguage: "ru-RU",
            url: `/blog/${post.slug}`,
            mainEntityOfPage: { "@type": "WebPage", "@id": `/blog/${post.slug}` },
            author: { "@type": "Organization", name: "FonteVita" },
            publisher: {
              "@type": "Organization",
              name: "FonteVita",
              logo: { "@type": "ImageObject", url: "/favicon.ico" },
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "Главная", url: "/" },
              { name: "Блог", url: "/blog" },
              ...(category ? [{ name: category.shortName, url: `/blog/category/${category.slug}` }] : []),
              { name: post.title, url: `/blog/${post.slug}` },
            ]),
          ),
        },
        ...(post.faq.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: post.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
});

function ArticlePage() {
  const post = Route.useLoaderData();
  const category = getCategoryBySlug(post.categorySlug);
  const related = getRelatedPosts(post);

  if (!category) return null;

  return (
    <CartProvider>
    <div className="min-h-dvh overflow-x-hidden">
      <SiteHeader />
      <CartPanel />

      <main>
        <section className="mx-auto w-full max-w-4xl px-4 pb-6 pt-6 sm:px-6 sm:pt-10">
          <Breadcrumbs
            items={[
              { label: "Блог", to: "/blog" },
              { label: category.shortName, to: "/blog/category/$category", params: { category: category.slug } },
              { label: post.title },
            ]}
          />

          <div className="mt-6">
            <CategoryPill category={category} />
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-[1.15] sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
            <span>FonteVita</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime} мин чтения
            </span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="soft-card overflow-hidden">
            <ArticleCover category={category} size="hero" imageUrl={post.coverImage} />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-10">
              <ArticleContent blocks={post.content} />
              <ArticleFaq items={post.faq} />

              {related.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">Читайте также</h2>
                  <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((p) => (
                      <ArticleCard key={p.slug} post={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
              <TableOfContents blocks={post.content} />
              <RelatedProducts productIds={post.relatedProductIds} />
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
    </CartProvider>
  );
}

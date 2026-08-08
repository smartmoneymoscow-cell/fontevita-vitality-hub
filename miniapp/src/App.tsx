import { useState } from "react";
import { CartProvider } from "@/components/CartContext";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { CartPage } from "@/components/CartPage";
import { ProfilePage } from "@/components/ProfilePage";
import { HealthPage } from "@/components/HealthPage";
import { BottomNav } from "@/components/BottomNav";
import { products } from "@/data/products";

type Tab = "catalog" | "health" | "cart" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("catalog");

  return (
    <CartProvider>
      <div className="min-h-dvh overflow-x-hidden bg-background">
        {tab === "catalog" && <SiteHeader />}

        <main>
          {tab === "catalog" && <CatalogPage />}
          {tab === "health" && <HealthPage />}
          {tab === "cart" && <CartPage />}
          {tab === "profile" && <ProfilePage />}
        </main>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </CartProvider>
  );
}

function CatalogPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-3">
      <div className="space-y-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

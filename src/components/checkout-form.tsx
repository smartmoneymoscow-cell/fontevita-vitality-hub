import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Phone,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/data/products";
import {
  submitOrder,
  validatePhone,
  validateEmail,
  type OrderItem,
  type OrderCustomer,
} from "@/lib/order-service";

type FormStep = "form" | "payment" | "success";

type FieldErrors = Partial<Record<keyof OrderCustomer, string>>;

export function CheckoutForm({ onBack }: { onBack: () => void }) {
  const { lines, total, clear } = useCart();
  const [step, setStep] = useState<FormStep>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [orderText, setOrderText] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<OrderCustomer>({
    name: "",
    phone: "",
    email: "",
    address: "",
    comment: "",
  });

  const updateField = (field: keyof OrderCustomer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on edit
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Введите имя (минимум 2 символа)";
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Введите номер в формате +7XXXXXXXXXX";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "Введите корректный email";
    }
    if (!formData.address.trim() || formData.address.trim().length < 10) {
      newErrors.address = "Введите полный адрес доставки";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setStep("payment");
    try {
      const items: OrderItem[] = lines.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        price: l.product.price,
        qty: l.qty,
      }));

      const { order, orderText: text } = await submitOrder(items, formData);
      setOrderText(text);
      // Mark user as authenticated after successful order
      try { localStorage.setItem("fontevita-authed", "1"); } catch {}
      setStep("success");
      clear();
    } catch (err) {
      console.error("Order submission failed:", err);
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (step === "payment") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center animate-rise-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sun-soft">
          <CreditCard className="h-8 w-8 text-foreground animate-pulse" />
        </div>
        <h3 className="text-xl font-bold">Обработка платежа</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Пожалуйста, подождите... Платёж обрабатывается платёжным шлюзом.
        </p>
        <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Защищено SSL-шифрованием
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center animate-rise-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-soft">
          <Check className="h-8 w-8 text-leaf" />
        </div>
        <h3 className="text-xl font-bold">Заказ оформлен!</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Мы свяжемся с вами в ближайшее время для подтверждения. Номер заказа отправлен на вашу
          почту.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="cta-lift flex items-center gap-2 rounded-full border-2 border-border px-5 py-2.5 text-sm font-bold hover:bg-secondary"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Скопировано" : "Копировать"}
          </button>
          <button
            onClick={onBack}
            className="cta-lift flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Продолжить покупки
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад к корзине"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">Оформление заказа</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Order summary */}
        <div className="rounded-2xl bg-secondary/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Ваш заказ
          </p>
          <ul className="mt-2 space-y-1">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {product.name} × {qty}
                </span>
                <span className="font-bold">{formatPrice(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm">
            <span className="font-bold">Итого</span>
            <span className="font-display text-lg font-bold">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <User className="h-4 w-4" />
            Имя и фамилия
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Иван Иванов"
            autoComplete="name"
            className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.name ? "border-destructive" : "border-border"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <Phone className="h-4 w-4" />
            Телефон
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+7 900 123-45-67"
            autoComplete="tel"
            className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.phone ? "border-destructive" : "border-border"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="ivan@example.com"
            autoComplete="email"
            className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.email ? "border-destructive" : "border-border"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="h-4 w-4" />
            Адрес доставки
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="г. Москва, ул. Пушкина, д. 10, кв. 5"
            autoComplete="street-address"
            className={`mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              errors.address ? "border-destructive" : "border-border"
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-destructive">{errors.address}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <MessageSquare className="h-4 w-4" />
            Комментарий
            <span className="text-xs font-normal text-muted-foreground">(необязательно)</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => updateField("comment", e.target.value)}
            placeholder="Пожелания к доставке, время и т.д."
            rows={3}
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <footer className="space-y-3 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Доставка</span>
          <span className="font-semibold text-leaf">
            {total >= 3000 ? "Бесплатно" : formatPrice(350)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">К оплате</span>
          <span className="font-display text-2xl font-bold">
            {formatPrice(total + (total >= 3000 ? 0 : 350))}
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting || lines.length === 0}
          className="cta-lift flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Обработка...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Оплатить {formatPrice(total + (total >= 3000 ? 0 : 350))}
            </>
          )}
        </button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Нажимая «Оплатить», вы соглашаетесь с условиями обработки персональных данных.
        </p>
      </footer>
    </form>
  );
}

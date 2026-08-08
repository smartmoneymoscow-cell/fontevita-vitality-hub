import { useState, useEffect } from "react";
import {
  User,
  Phone,
  AtSign,
  Edit3,
  Check,
  X,
  ChevronRight,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
};

type ProfileData = {
  firstName: string;
  lastName: string;
  phone: string;
  addresses: SavedAddress[];
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadProfile(tgUser?: { first_name?: string; last_name?: string }): ProfileData {
  try {
    const raw = localStorage.getItem("fv_profile");
    if (raw) {
      const data = JSON.parse(raw);
      // Migration: old single address → array
      if (typeof data.address === "string" && data.address.trim()) {
        data.addresses = [{ id: genId(), label: "Адрес 1", address: data.address }];
        delete data.address;
      }
      if (!Array.isArray(data.addresses)) data.addresses = [];
      return {
        firstName: data.firstName ?? tgUser?.first_name ?? "",
        lastName: data.lastName ?? tgUser?.last_name ?? "",
        phone: data.phone ?? "",
        addresses: data.addresses,
      };
    }
  } catch {}
  return {
    firstName: tgUser?.first_name ?? "",
    lastName: tgUser?.last_name ?? "",
    phone: "",
    addresses: [],
  };
}

function saveProfile(profile: ProfileData) {
  localStorage.setItem("fv_profile", JSON.stringify(profile));
}

// Also save addresses separately for CartPage to read
function syncAddressesToStorage(addresses: SavedAddress[]) {
  localStorage.setItem("fv_addresses", JSON.stringify(addresses));
}

export function ProfilePage() {
  const { tg, haptic, hapticSuccess } = useTelegram();

  const tgUser = tg?.initDataUnsafe?.user as
    | {
        id?: number;
        first_name?: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
        is_premium?: boolean;
      }
    | undefined;

  const [profile, setProfile] = useState<ProfileData>(() => loadProfile(tgUser));
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    setProfile(loadProfile(tgUser));
  }, []);

  const handleSave = () => {
    haptic("medium");
    saveProfile(profile);
    syncAddressesToStorage(profile.addresses);
    setEditing(false);
    hapticSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    haptic("light");
    setProfile(loadProfile(tgUser));
    setEditing(false);
    setAddingAddress(false);
    setNewAddress("");
    setNewLabel("");
  };

  const addAddress = () => {
    if (!newAddress.trim()) return;
    haptic("medium");
    const entry: SavedAddress = {
      id: genId(),
      label: newLabel.trim() || `Адрес ${(profile.addresses.length + 1)}`,
      address: newAddress.trim(),
    };
    const updated = {
      ...profile,
      addresses: [...profile.addresses, entry],
    };
    setProfile(updated);
    saveProfile(updated);
    syncAddressesToStorage(updated.addresses);
    setNewAddress("");
    setNewLabel("");
    setAddingAddress(false);
    hapticSuccess();
  };

  const removeAddress = (id: string) => {
    haptic("light");
    const updated = {
      ...profile,
      addresses: profile.addresses.filter((a) => a.id !== id),
    };
    setProfile(updated);
    saveProfile(updated);
    syncAddressesToStorage(updated.addresses);
  };

  return (
    <div className="mx-auto w-full max-w-lg pb-28">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sun-soft to-background px-4 pb-8 pt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sun/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-coral/10 blur-2xl"
        />

        <div className="relative flex flex-col items-center gap-3">
          <div className="relative">
            {tgUser?.photo_url ? (
              <img
                src={tgUser.photo_url}
                alt="Аватар"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-card shadow-soft"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card ring-4 ring-card shadow-soft">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {tgUser?.is_premium && (
              <span className="absolute -bottom-1 -right-1 rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold shadow-soft">
                ⭐ Premium
              </span>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {profile.firstName || "Гость"} {profile.lastName}
            </h2>
            {tgUser?.username && (
              <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <AtSign className="h-3.5 w-3.5" />
                {tgUser.username}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4">
        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-sky-soft px-4 py-3 text-sm animate-rise-in">
            <Check className="h-4 w-4 text-leaf" />
            Данные сохранены
          </div>
        )}



        {/* Personal data */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Личные данные</h3>
            {!editing ? (
              <button
                onClick={() => {
                  haptic("light");
                  setEditing(true);
                }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Edit3 className="h-4 w-4" />
                Изменить
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:brightness-105"
                >
                  <Check className="h-4 w-4" />
                  Сохранить
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Field
              icon={<User className="h-4 w-4" />}
              label="Имя"
              value={profile.firstName}
              editing={editing}
              onChange={(v) => setProfile((p) => ({ ...p, firstName: v }))}
              placeholder="Введите имя"
            />
            <Field
              icon={<User className="h-4 w-4" />}
              label="Фамилия"
              value={profile.lastName}
              editing={editing}
              onChange={(v) => setProfile((p) => ({ ...p, lastName: v }))}
              placeholder="Введите фамилию"
            />
            <Field
              icon={<Phone className="h-4 w-4" />}
              label="Телефон"
              value={profile.phone}
              editing={editing}
              onChange={(v) => setProfile((p) => ({ ...p, phone: v }))}
              placeholder="+7 (___) ___-__-__"
              type="tel"
            />
          </div>
        </div>

        {/* Addresses */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Адреса доставки</h3>
            <button
              onClick={() => {
                haptic("light");
                setAddingAddress(true);
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Добавить
            </button>
          </div>

          {/* Address list */}
          {profile.addresses.length === 0 && !addingAddress && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Нет сохранённых адресов
              </p>
            </div>
          )}

          {profile.addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                  {addr.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {addr.address}
                </p>
              </div>
              <button
                onClick={() => removeAddress(addr.id)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Удалить адрес"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add address form */}
          {addingAddress && (
            <div className="space-y-2 rounded-2xl border border-primary/30 bg-card p-4 animate-rise-in">
              <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <span className="shrink-0 text-muted-foreground">
                  <Edit3 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Название
                  </span>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Дом / Работа / Дача"
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <span className="shrink-0 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Адрес <span className="text-coral">*</span>
                  </span>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Москва, ул. Пушкина, д. 10, кв. 42"
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    haptic("light");
                    setAddingAddress(false);
                    setNewAddress("");
                    setNewLabel("");
                  }}
                  className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Отмена
                </button>
                <button
                  onClick={addAddress}
                  disabled={!newAddress.trim()}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  Сохранить адрес
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="mt-6 space-y-1 rounded-2xl border border-border bg-card overflow-hidden">
          {[
            { label: "О бренде FonteVita", icon: "🌿" },
            { label: "Сертификаты качества", icon: "📋" },
            { label: "Связаться с поддержкой", icon: "💬" },
            { label: "Политика конфиденциальности", icon: "🔒" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => haptic("light")}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition-colors active:bg-secondary"
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/50">
          FonteVita Mini App v1.0
        </p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  editing,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-0.5 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        ) : (
          <span className="mt-0.5 block text-sm font-semibold text-foreground">
            {value || <span className="text-muted-foreground/40">{placeholder}</span>}
          </span>
        )}
      </div>
    </label>
  );
}

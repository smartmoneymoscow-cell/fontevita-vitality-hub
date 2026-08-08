import { useState } from "react";
import {
  Activity,
  FileText,
  Calendar as CalendarIcon,
  Pill,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  FlaskConical,
  Heart,
  Droplets,
  Zap,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

// ─── Data ────────────────────────────────────────────────────────

type SupplementLog = {
  id: string;
  name: string;
  icon: typeof Pill;
  color: string;
  bgColor: string;
  schedule: string;
  taken: boolean;
};

type Analysis = {
  id: string;
  title: string;
  date: string;
  icon: typeof FlaskConical;
  color: string;
  bgColor: string;
  status: "normal" | "attention" | "pending";
  values: { label: string; value: string; range: string }[];
};

type Recommendation = {
  id: string;
  vitamin: string;
  reason: string;
  dose: string;
  icon: typeof Zap;
  color: string;
  bgColor: string;
};

const todaySupplements: SupplementLog[] = [
  { id: "1", name: "Коллаген", icon: Heart, color: "text-coral", bgColor: "bg-coral-soft", schedule: "08:00 · 2 капс.", taken: true },
  { id: "2", name: "Магний + B6", icon: Activity, color: "text-sky", bgColor: "bg-sky-soft", schedule: "13:00 · 1 капс.", taken: true },
  { id: "3", name: "Омега 3", icon: Droplets, color: "text-sky", bgColor: "bg-sky-soft", schedule: "13:00 · 1 капс.", taken: false },
  { id: "4", name: "Коллаген", icon: Heart, color: "text-coral", bgColor: "bg-coral-soft", schedule: "20:00 · 2 капс.", taken: false },
  { id: "5", name: "Магний + B6", icon: Activity, color: "text-sky", bgColor: "bg-sky-soft", schedule: "20:00 · 1 капс.", taken: false },
];

const analyses: Analysis[] = [
  {
    id: "1",
    title: "Общий анализ крови",
    date: "15.07.2026",
    icon: Droplets,
    color: "text-coral",
    bgColor: "bg-coral-soft",
    status: "normal",
    values: [
      { label: "Гемоглобин", value: "142 г/л", range: "120–160" },
      { label: "Лейкоциты", value: "5.8 × 10⁹", range: "4–9" },
      { label: "СОЭ", value: "8 мм/ч", range: "2–15" },
    ],
  },
  {
    id: "2",
    title: "Витамин D (25-OH)",
    date: "10.07.2026",
    icon: FlaskConical,
    color: "text-sun",
    bgColor: "bg-sun-soft",
    status: "attention",
    values: [
      { label: "25(OH)D", value: "18 нг/мл", range: "30–100" },
    ],
  },
  {
    id: "3",
    title: "Магний (сыворотка)",
    date: "10.07.2026",
    icon: Activity,
    color: "text-sky",
    bgColor: "bg-sky-soft",
    status: "normal",
    values: [
      { label: "Mg²⁺", value: "0.85 ммоль/л", range: "0.7–1.1" },
    ],
  },
];

const recommendations: Recommendation[] = [
  { id: "1", vitamin: "Витамин D₃", reason: "Уровень ниже нормы — 18 нг/мл при норме 30+", dose: "2000 МЕ/день", icon: Zap, color: "text-sun", bgColor: "bg-sun-soft" },
  { id: "2", vitamin: "Омега 3", reason: "Поддержка сердечно-сосудистой системы", dose: "3000 мг/день", icon: Droplets, color: "text-sky", bgColor: "bg-sky-soft" },
  { id: "3", vitamin: "Коллаген", reason: "После 30 — ежедневная поддержка суставов и кожи", dose: "2000 мг/день", icon: Heart, color: "text-coral", bgColor: "bg-coral-soft" },
];

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Sample intake data for the calendar: day → taken count
const intakeData: Record<number, number> = {
  1: 3, 2: 3, 3: 2, 4: 3, 5: 3, 6: 1, 7: 0,
  8: 3, 9: 3, 10: 3, 11: 3, 12: 2, 13: 3, 14: 3,
  15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 2, 21: 3,
  22: 3, 23: 3, 24: 3, 25: 3, 26: 3, 27: 3, 28: 3,
  29: 3, 30: 3, 31: 0,
};
const totalPerDay = 3; // total supplements per day

// ─── Intake Graph ────────────────────────────────────────────────

function IntakeGraph() {
  const last7 = [3, 3, 2, 3, 3, 1, 0]; // taken per day
  const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const max = 3;

  return (
    <div className="soft-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft">
          <TrendingUp className="h-5 w-5 text-sky" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Приём за неделю</h3>
          <p className="text-xs text-muted-foreground">3 добавки · 5 дней подряд</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
        {last7.map((v, i) => {
          const pct = (v / max) * 100;
          const isToday = i === last7.length - 1;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground">{v}/{max}</span>
              <div className="relative w-full rounded-full bg-secondary" style={{ height: 64 }}>
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700 ${
                    v === max ? "bg-leaf" : v > 0 ? "bg-sun" : "bg-border"
                  }`}
                  style={{ height: `${Math.max(pct, 6)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Приём", value: "87%", color: "text-leaf" },
          { label: "Серия", value: "5 дн.", color: "text-sun" },
          { label: "Пропуски", value: "2", color: "text-coral" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-secondary/80 px-2 py-2.5 text-center">
            <p className={`font-display text-base font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Analyses Section ────────────────────────────────────────────

function AnalysesSection() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { haptic } = useTelegram();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft">
          <FileText className="h-5 w-5 text-coral" />
        </div>
        <h3 className="text-base font-bold">Анализы</h3>
      </div>

      {analyses.map((a) => {
        const isOpen = expanded === a.id;
        const statusColors = {
          normal: { bg: "bg-leaf", text: "text-leaf", label: "В норме" },
          attention: { bg: "bg-sun", text: "text-sun", label: "Внимание" },
          pending: { bg: "bg-muted-foreground", text: "text-muted-foreground", label: "Ожидает" },
        };
        const st = statusColors[a.status];

        return (
          <div key={a.id} className="soft-card overflow-hidden p-0">
            <button
              onClick={() => {
                haptic("light");
                setExpanded(isOpen ? null : a.id);
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bgColor}`}>
                <a.icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.date}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.bg} text-card`}>
                {st.label}
              </span>
              <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            <div
              className="grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border px-4 py-3">
                  {a.values.map((v) => (
                    <div key={v.label} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-muted-foreground">{v.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{v.value}</span>
                        <span className="text-[10px] text-muted-foreground/60">норма {v.range}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recommendations ─────────────────────────────────────────────

function RecommendationsSection() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-soft">
          <Pill className="h-5 w-5 text-sun" />
        </div>
        <h3 className="text-base font-bold">Рекомендации</h3>
      </div>

      {recommendations.map((r) => (
        <div key={r.id} className="soft-card flex items-start gap-3 p-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.bgColor}`}>
            <r.icon className={`h-5 w-5 ${r.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{r.vitamin}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {r.dose}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar ────────────────────────────────────────────────────

function IntakeCalendar() {
  const { haptic } = useTelegram();
  const [month, setMonth] = useState(7); // August = 7 (0-indexed)
  const [year] = useState(2026);

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  const prev = () => {
    haptic("light");
    setMonth((m) => (m === 0 ? 11 : m - 1));
  };
  const next = () => {
    haptic("light");
    setMonth((m) => (m === 11 ? 0 : m + 1));
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getColor = (day: number) => {
    if (isCurrentMonth && day > todayDate) return "bg-transparent border-border";
    const taken = intakeData[day] ?? 0;
    if (taken === totalPerDay) return "bg-leaf/20 border-leaf/40";
    if (taken > 0) return "bg-sun/20 border-sun/40";
    return "bg-coral/10 border-coral/30";
  };

  return (
    <div className="soft-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-soft">
            <CalendarIcon className="h-5 w-5 text-sky" />
          </div>
          <h3 className="text-base font-bold">Календарь приёма</h3>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button onClick={prev} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold">{monthNames[month]} {year}</span>
        <button onClick={next} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekDays.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-bold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const isToday = isCurrentMonth && day === todayDate;
          return (
            <div
              key={day}
              className={`flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${getColor(day)} ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        {[
          { color: "bg-leaf", label: "Все принято" },
          { color: "bg-sun", label: "Частично" },
          { color: "bg-coral", label: "Пропуск" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Today's Schedule ────────────────────────────────────────────

function TodaySchedule() {
  const { haptic, hapticSuccess } = useTelegram();
  const [items, setItems] = useState(todaySupplements);

  const toggle = (id: string) => {
    haptic("medium");
    setItems((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, taken: !s.taken } : s));
      return next;
    });
    hapticSuccess();
  };

  const done = items.filter((s) => s.taken).length;

  return (
    <div className="soft-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-soft">
            <Clock className="h-5 w-5 text-sun" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Сегодня</h3>
            <p className="text-xs text-muted-foreground">{done} из {items.length} принято</p>
          </div>
        </div>
        <span className="font-display text-lg font-bold text-leaf">{Math.round((done / items.length) * 100)}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-leaf transition-all duration-500"
          style={{ width: `${(done / items.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
              s.taken ? "bg-leaf/5" : "bg-secondary/50"
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.taken ? "bg-leaf" : s.bgColor}`}>
              {s.taken ? (
                <Check className="h-4 w-4 text-card" />
              ) : (
                <s.icon className={`h-4 w-4 ${s.color}`} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${s.taken ? "text-muted-foreground line-through" : ""}`}>{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.schedule}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export function HealthPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
      <h2 className="mb-4 text-lg font-bold">Здоровье</h2>

      <div className="space-y-4">
        <TodaySchedule />
        <IntakeGraph />
        <IntakeCalendar />
        <AnalysesSection />
        <RecommendationsSection />
      </div>
    </div>
  );
}

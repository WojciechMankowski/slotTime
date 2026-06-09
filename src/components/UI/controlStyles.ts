// Jedno źródło prawdy dla stylów kontrolek (Input/Select/Button).
// Wszystkie wartości radius/spacing/motion/intencji pochodzą z tokenów w theme.css.

// Wspólna baza: radius, padding, rozmiar tekstu, motion, stan disabled.
export const CONTROL_BASE =
  "rounded-(--radius-control) text-sm px-(--control-px) py-(--control-py) " +
  "transition-[color,background-color,border-color,box-shadow,transform] " +
  "duration-(--dur-base) ease-(--ease-standard) " +
  "disabled:opacity-70 disabled:cursor-not-allowed";

// Pola formularza (Input + Select) — jeden wspólny wariant.
export const FIELD_CLASS =
  `${CONTROL_BASE} w-full border border-(--border) bg-gray-50 focus:outline-none ` +
  "focus:border-(--accent) focus:bg-white focus:ring-1 focus:ring-(--accent)/15 disabled:bg-gray-100";

// Baza przycisku — wspólna baza + cechy specyficzne dla przycisku.
export const BUTTON_BASE =
  `${CONTROL_BASE} border-none shadow-md font-medium cursor-pointer flex items-center ` +
  "justify-center gap-(--control-gap) hover:-translate-y-px active:translate-y-0 disabled:hover:translate-y-0";

// Intencje przycisku → klasy (token-driven).
export type ButtonIntent = "primary" | "outline";

export const BUTTON_INTENT: Record<ButtonIntent, string> = {
  primary:
    "bg-linear-to-r from-(--intent-primary-from) to-(--intent-primary-to) " +
    "text-(--intent-primary-fg) shadow-blue-600/30",
  outline:
    "bg-(--intent-neutral-bg) border border-(--intent-neutral-border) " +
    "text-(--intent-neutral-fg) hover:border-gray-500",
};

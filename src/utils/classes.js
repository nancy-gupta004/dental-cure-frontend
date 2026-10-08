export const inputClass =
  "w-full rounded-xl border border-ink-100 bg-brand-50/50 px-4 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-200/60";

// Colors of the success / error message boxes
export const getMessageClass = (type) =>
  type === "success"
    ? "rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
    : "rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600";
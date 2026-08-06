const styles: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold",
  danger: "bg-red-500/15 text-red-300 border border-red-500/30 font-semibold",
  info: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold",
};

export default function StatusChip({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

const styles: Record<string, string> = {
  success: "bg-status-successBg text-status-success",
  warning: "bg-status-warningBg text-status-warning",
  danger: "bg-status-dangerBg text-status-danger",
  info: "bg-status-infoBg text-status-info",
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
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

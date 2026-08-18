export function mad(n: any) {
  const val = Number(n);
  const safeVal = isNaN(val) || val === null || val === undefined ? 0 : val;
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 }).format(safeVal) + " MAD";
}

export function statusTone(statut: string): "success" | "warning" | "danger" | "info" {
  const map: Record<string, "success" | "warning" | "danger" | "info"> = {
    Payée: "success",
    Payee: "success",
    "En attente": "warning",
    Envoyée: "warning",
    Envoyee: "warning",
    "En retard": "danger",
    Annulée: "danger",
    Annulee: "danger",
    Refusé: "danger",
    Refuse: "danger",
    Expiré: "danger",
    Expire: "danger",
    Brouillon: "info",
    Vue: "info",
    Accepté: "success",
    Accepte: "success",
    Converti: "success",
  };
  return map[statut] ?? "info";
}

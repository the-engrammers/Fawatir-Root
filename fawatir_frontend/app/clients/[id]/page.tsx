"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ChevronLeft, Share2, Mail, Phone, MapPin, Building2, Hash, Loader2 } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { fetchAPI } from "@/lib/api";

export default function ClientFichePage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"factures" | "devis">("factures");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, invRes, devRes] = await Promise.all([
          fetchAPI(`api/clients/${id}/`),
          fetchAPI("api/invoices/"),
          fetchAPI("api/quotations/"),
        ]);

        if (!clientRes.ok) {
          setError("Client introuvable");
          setLoading(false);
          return;
        }

        const clientData = await clientRes.json();
        const invData = await invRes.json();
        const devData = await devRes.json();

        setClient(clientData);
        setInvoices((Array.isArray(invData) ? invData : invData.results || []).filter((f: any) => f.client === id));
        setQuotations((Array.isArray(devData) ? devData : devData.results || []).filter((d: any) => d.client === id));
      } catch (err) {
        setError("Erreur de connexion au serveur");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-ink-300" size={24} />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-5">
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-800">
          <ChevronLeft size={14} /> Clients
        </Link>
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
          {error || "Client introuvable"}
        </div>
      </div>
    );
  }

  const displayName = client.contact_name || client.company_name || "—";
  const revenuTotal = invoices
    .filter((f) => f.status === "Payée")
    .reduce((s, f) => s + parseFloat(f.total_amount || 0), 0);
  const enAttente = invoices
    .filter((f) => f.status === "Envoyée" || f.status === "En retard")
    .reduce((s, f) => s + parseFloat(f.total_amount || 0), 0);

  const fiscal: Record<string, string> = {};
  if (client.tax_identifier) fiscal["Identifiant Fiscal"] = client.tax_identifier;
  if (client.ice) fiscal["ICE"] = client.ice;
  if (client.rc) fiscal["Registre de Commerce"] = client.rc;

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-800">
        <ChevronLeft size={14} /> Clients
      </Link>

      <div className="ledger-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/15 text-[16px] font-medium text-brass">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-[16px] font-medium text-ink-900">{displayName}</p>
            <p className="text-[12.5px] text-ink-400">
              {client.company_name} · Client depuis {client.created_at ? new Date(client.created_at).toLocaleDateString("fr-FR") : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
          >
            <Share2 size={14} /> Partager le portail
          </button>
        </div>
      </div>

      <div className="ledger-card grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Coord icon={Mail} label="E-mail" value={client.email || "—"} />
        <Coord icon={Phone} label="Téléphone" value={client.phone || client.mobile || "—"} />
        <Coord icon={MapPin} label="Adresse" value={client.address || "—"} />
        <Coord icon={Building2} label="Entreprise" value={client.company_name || "—"} />
        {Object.entries(fiscal).map(([label, value]) => (
          <Coord key={label} icon={Hash} label={label} value={value} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total des factures" value={String(invoices.length)} />
        <Stat label="Revenu total" value={mad(revenuTotal)} sub="Payées" />
        <Stat label="En attente" value={mad(enAttente)} />
        <Stat label="Total des devis" value={String(quotations.length)} />
      </div>

      <div className="ledger-card">
        <div className="mb-3 flex gap-1 border-b border-ink-200/60">
          <TabButton active={tab === "factures"} onClick={() => setTab("factures")}>
            Factures {invoices.length}
          </TabButton>
          <TabButton active={tab === "devis"} onClick={() => setTab("devis")}>
            Devis & Estimations {quotations.length}
          </TabButton>
        </div>

        {tab === "factures" ? (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2 font-medium">Facture N°</th>
                <th className="pb-2 font-medium">Date d'émission</th>
                <th className="pb-2 font-medium">Date d'échéance</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {invoices.map((f) => (
                <tr key={f.id}>
                  <td className="py-2.5">
                    <Link href={`/factures/${f.id}`} className="font-medium text-brass hover:underline">
                      {f.invoice_number}
                    </Link>
                  </td>
                  <td className="py-2.5 text-ink-500">{f.issue_date}</td>
                  <td className="py-2.5 text-ink-500">{f.due_date}</td>
                  <td className="figure py-2.5 text-ink-900">{mad(f.total_amount)}</td>
                  <td className="py-2.5">
                    <StatusChip tone={statusTone(f.status)}>{f.status}</StatusChip>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-400">
                    Aucune facture pour ce client
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2 font-medium">Devis N°</th>
                <th className="pb-2 font-medium">Montant</th>
                <th className="pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {quotations.map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5">
                    <Link href={`/devis/${d.id}`} className="font-medium text-brass hover:underline">
                      {d.quotation_number}
                    </Link>
                  </td>
                  <td className="figure py-2.5 text-ink-900">{mad(d.total_amount)}</td>
                  <td className="py-2.5">
                    <StatusChip tone={statusTone(d.status)}>{d.status}</StatusChip>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-ink-400">
                    Aucun devis pour ce client
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-md rounded-card bg-paper-card p-5 shadow-panel">
            <h2 className="mb-1 text-[15px] font-semibold text-ink-900">Partager le portail</h2>
            <p className="mb-3 text-[12.5px] text-ink-400">
              Votre client peut consulter toutes ses factures sans se connecter
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`https://fatourati.app/portail/${client.id}`}
                className="flex-1 rounded-md border border-ink-200 bg-paper px-3 py-2 text-[12.5px] text-ink-600"
              />
              <button className="rounded-md bg-ink-900 px-3 py-2 text-[12.5px] font-medium text-white hover:bg-ink-800">
                Copier le lien
              </button>
            </div>
            <button
              onClick={() => setShareOpen(false)}
              className="mt-4 w-full rounded-md border border-ink-200 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Coord({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-brass" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
        <p className="text-[13px] text-ink-800">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="ledger-card">
      <p className="figure text-[18px] font-medium text-ink-900">{value}</p>
      <p className="text-[12px] text-ink-400">
        {label}
        {sub ? <span className="ml-1 text-ink-400/70">· {sub}</span> : null}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-3 py-2 text-[13px] font-medium ${
        active ? "border-brass text-ink-900" : "border-transparent text-ink-400 hover:text-ink-700"
      }`}
    >
      {children}
    </button>
  );
}

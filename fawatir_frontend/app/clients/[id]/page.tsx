"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Share2, Pencil, Mail, Phone, MapPin, Building2, Hash } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { clientsFull, facturesList, devisList } from "@/lib/mock-data";

export default function ClientFichePage({ params }: { params: { id: string } }) {
  const client = clientsFull.find((c) => c.id === params.id);
  const [tab, setTab] = useState<"factures" | "devis">("factures");
  const [shareOpen, setShareOpen] = useState(false);

  if (!client) notFound();

  const clientFactures = facturesList.filter((f) => f.clientId === client.id);
  const clientDevis = devisList.filter((d) => d.client === client.nom);
  const revenuTotal = clientFactures
    .filter((f) => f.statut === "Payée")
    .reduce((s, f) => s + f.montant, 0);
  const enAttente = clientFactures
    .filter((f) => f.statut === "Envoyée" || f.statut === "En retard")
    .reduce((s, f) => s + f.montant, 0);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-800">
        <ChevronLeft size={14} /> Clients
      </Link>

      <div className="ledger-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/15 text-[16px] font-medium text-brass">
            {client.nom.charAt(0)}
          </span>
          <div>
            <p className="text-[16px] font-medium text-ink-900">{client.nom}</p>
            <p className="text-[12.5px] text-ink-400">
              {client.entreprise} · Client depuis {client.dateClient}
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
          <button className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Pencil size={14} /> Modifier
          </button>
        </div>
      </div>

      <div className="ledger-card grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Coord icon={Mail} label="E-mail" value={client.email} />
        <Coord icon={Phone} label="Téléphone" value={client.telephone} />
        <Coord icon={MapPin} label="Adresse" value={client.adresse} />
        <Coord icon={Building2} label="Entreprise" value={client.entreprise} />
        {Object.entries(client.fiscal).map(([label, value]) => (
          <Coord key={label} icon={Hash} label={label} value={value} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total des factures" value={String(clientFactures.length)} />
        <Stat label="Revenu total" value={mad(revenuTotal)} sub="Payées" />
        <Stat label="En attente" value={mad(enAttente)} />
        <Stat label="Total des devis" value={String(clientDevis.length)} />
      </div>

      <div className="ledger-card">
        <div className="mb-3 flex gap-1 border-b border-ink-200/60">
          <TabButton active={tab === "factures"} onClick={() => setTab("factures")}>
            Factures {clientFactures.length}
          </TabButton>
          <TabButton active={tab === "devis"} onClick={() => setTab("devis")}>
            Devis & Estimations {clientDevis.length}
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
              {clientFactures.map((f) => (
                <tr key={f.id}>
                  <td className="py-2.5">
                    <Link href={`/factures/${f.id}`} className="font-medium text-brass hover:underline">
                      {f.numero}
                    </Link>
                  </td>
                  <td className="py-2.5 text-ink-500">{f.dateEmission}</td>
                  <td className="py-2.5 text-ink-500">{f.dateEcheance}</td>
                  <td className="figure py-2.5 text-ink-900">{mad(f.montant)}</td>
                  <td className="py-2.5">
                    <StatusChip tone={statusTone(f.statut)}>{f.statut}</StatusChip>
                  </td>
                </tr>
              ))}
              {clientFactures.length === 0 && (
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
                <th className="pb-2 font-medium">Valide jusqu'au</th>
                <th className="pb-2 font-medium">Montant</th>
                <th className="pb-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {clientDevis.map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5">
                    <Link href={`/devis/${d.id}`} className="font-medium text-brass hover:underline">
                      {d.numero}
                    </Link>
                  </td>
                  <td className="py-2.5 text-ink-500">{d.validiteJusquau}</td>
                  <td className="figure py-2.5 text-ink-900">{mad(d.montant)}</td>
                  <td className="py-2.5">
                    <StatusChip tone={statusTone(d.statut)}>{d.statut}</StatusChip>
                  </td>
                </tr>
              ))}
              {clientDevis.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-400">
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

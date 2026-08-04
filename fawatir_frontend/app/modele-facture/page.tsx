"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const accentColors = ["#2C4A7C", "#1F8A5F", "#B8452F", "#6B4FA0", "#B8863B", "#242835", "#B03B6A"];

const templates = [
  { id: "classique", nom: "Classique", desc: "Design épuré avec couleurs d'accent" },
  { id: "moderne", nom: "Moderne", desc: "Barre latérale avec couleurs vives" },
  { id: "minimal", nom: "Minimal", desc: "Ultra épuré avec beaucoup d'espace" },
  { id: "elegant", nom: "Élégant", desc: "Tons indigo riches avec une touche premium" },
  { id: "audacieux", nom: "Audacieux", desc: "Contraste fort avec accents sombres" },
  { id: "epure", nom: "Épuré", desc: "Fond clair avec lignes nettes" },
];

export default function ModeleFacturePage() {
  const [separateur, setSeparateur] = useState("A-B");
  const [inclureAnnee, setInclureAnnee] = useState(false);
  const [longueur, setLongueur] = useState(4);
  const [accent, setAccent] = useState(accentColors[4]);
  const [template, setTemplate] = useState("moderne");

  const prefixesEtNumeros = [
    { doc: "Factures", prefixe: "FAC", prochain: 47 },
    { doc: "Devis", prefixe: "DEV", prochain: 19 },
    { doc: "Avoirs", prefixe: "AV", prochain: 5 },
  ];

  function apercu(prefixe: string, n: number) {
    const num = String(n).padStart(longueur, "0");
    const annee = inclureAnnee ? `${new Date().getFullYear()}-` : "";
    return separateur === "A-B"
      ? `${prefixe}-${annee}${num}`
      : separateur === "A/B"
      ? `${prefixe}/${annee}${num}`
      : separateur === "A.B"
      ? `${prefixe}.${annee}${num}`
      : `${prefixe}${annee}${num}`;
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">Modèle de facture</h1>
        <p className="text-[13px] text-ink-400">Choisissez le design de vos factures PDF</p>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Numérotation des documents
        </p>

        <div>
          <p className="mb-1.5 text-[12.5px] text-ink-600">Séparateur</p>
          <div className="grid grid-cols-4 gap-2">
            {["A-B", "A/B", "A.B", "AB"].map((s) => (
              <button
                key={s}
                onClick={() => setSeparateur(s)}
                className={`rounded-md border py-2 text-[13px] font-medium ${
                  separateur === s ? "border-brass bg-brass/10 text-brass" : "border-ink-200 text-ink-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
          <span className="text-[13px] text-ink-700">
            Inclure l'année
            <span className="block text-[11.5px] text-ink-400">Insère l'année en cours dans le numéro</span>
          </span>
          <input
            type="checkbox"
            checked={inclureAnnee}
            onChange={(e) => setInclureAnnee(e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>

        <div>
          <p className="mb-1.5 text-[12.5px] text-ink-600">Longueur du numéro</p>
          <div className="grid grid-cols-4 gap-2">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setLongueur(n)}
                className={`rounded-md border py-2 text-[13px] font-medium ${
                  longueur === n ? "border-brass bg-brass/10 text-brass" : "border-ink-200 text-ink-600"
                }`}
              >
                {n} chiffres
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {prefixesEtNumeros.map((p) => (
            <div key={p.doc} className="flex items-center gap-3 rounded-md border border-ink-200 p-3">
              <span className="w-20 text-[13px] font-medium text-ink-700">{p.doc}</span>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] text-ink-400">Préfixe</label>
                <input
                  defaultValue={p.prefixe}
                  className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] text-ink-400">Prochain N°</label>
                <input
                  type="number"
                  defaultValue={p.prochain}
                  className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
              <div className="flex-1 text-right">
                <p className="mb-1 text-[11px] text-ink-400">Aperçu</p>
                <p className="figure text-[13px] font-medium text-ink-900">{apercu(p.prefixe, p.prochain)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11.5px] text-ink-400">
          Ces réglages s'appliquent à tous vos documents — ex. {apercu("FAC", 47)}
        </p>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">Couleur d'accent</p>
        <div className="flex flex-wrap gap-2">
          {accentColors.map((c) => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2"
              style={{ backgroundColor: c, borderColor: accent === c ? "#14171F" : "transparent" }}
            >
              {accent === c && <Check size={14} className="text-white" />}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] text-ink-600">Texte de pied de page</label>
          <input
            defaultValue="Merci pour votre confiance !"
            className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="ledger-card">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-ink-400">Modèles PDF</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`rounded-md border p-3 text-left ${
                template === t.id ? "border-brass ring-1 ring-brass/30" : "border-ink-200"
              }`}
            >
              <div
                className="mb-2 flex h-24 items-center justify-center rounded-md text-[11px] text-white/70"
                style={{ backgroundColor: accent }}
              >
                Aperçu
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-ink-900">{t.nom}</p>
                {template === t.id && <Check size={14} className="text-brass" />}
              </div>
              <p className="text-[11.5px] text-ink-400">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-md bg-ink-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800">
          Enregistrer
        </button>
      </div>
    </div>
  );
}

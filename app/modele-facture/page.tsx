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
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
    <div className="mx-auto max-w-[1000px] space-y-6 text-slate-100 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Modèle & Numérotation de Facture</h1>
        <p className="text-[13px] text-slate-400">Personnalisez le design PDF, les préfixes et la numérotation automatique</p>
      </div>

      <div className="bento-card space-y-5">
        <p className="text-[12px] font-bold uppercase tracking-wider text-indigo-400">
          Numérotation des documents
        </p>

        <div>
          <p className="mb-2 text-[12.5px] font-semibold text-slate-300">Format de Séparateur</p>
          <div className="grid grid-cols-4 gap-2.5">
            {["A-B", "A/B", "A.B", "AB"].map((s) => (
              <button
                key={s}
                onClick={() => setSeparateur(s)}
                className={`rounded-xl border py-2.5 text-[13px] font-mono font-bold transition-all ${
                  separateur === s ? "border-indigo-500 bg-indigo-600/20 text-indigo-300" : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 cursor-pointer">
          <span className="text-[13px] font-semibold text-slate-200">
            Inclure l'année en cours
            <span className="block text-[11.5px] text-slate-400 font-normal">Insère {new Date().getFullYear()} dans le numéro (ex: FAC-{new Date().getFullYear()}-0001)</span>
          </span>
          <input
            type="checkbox"
            checked={inclureAnnee}
            onChange={(e) => setInclureAnnee(e.target.checked)}
            className="h-4 w-4 accent-indigo-500 rounded"
          />
        </label>

        <div>
          <p className="mb-2 text-[12.5px] font-semibold text-slate-300">Longueur du séquençage</p>
          <div className="grid grid-cols-4 gap-2.5">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setLongueur(n)}
                className={`rounded-xl border py-2.5 text-[13px] font-medium transition-all ${
                  longueur === n ? "border-indigo-500 bg-indigo-600/20 text-indigo-300" : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {n} chiffres
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {prefixesEtNumeros.map((p) => (
            <div key={p.doc} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="w-24 text-[13px] font-bold text-white">{p.doc}</span>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Préfixe</label>
                <input
                  defaultValue={p.prefixe}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Prochain N°</label>
                <input
                  type="number"
                  defaultValue={p.prochain}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
              <div className="flex-1 sm:text-right">
                <p className="mb-1 text-[11px] font-semibold text-slate-400">Aperçu direct</p>
                <p className="figure text-[13.5px] font-mono font-bold text-indigo-400">{apercu(p.prefixe, p.prochain)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bento-card space-y-5">
        <p className="text-[12px] font-bold uppercase tracking-wider text-indigo-400">Couleur d'accent & Pied de page</p>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((c) => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform active:scale-95 shadow-md"
              style={{ backgroundColor: c, borderColor: accent === c ? "#FFFFFF" : "transparent" }}
            >
              {accent === c && <Check size={16} className="text-white" />}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Texte de pied de page sur le PDF</label>
          <input
            defaultValue="Merci pour votre confiance ! ICE N° 00294829100032 · Capital Social: 100 000 MAD"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bento-card space-y-4">
        <p className="text-[12px] font-bold uppercase tracking-wider text-indigo-400">Modèles PDF & Templates</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                template === t.id ? "border-indigo-500 bg-indigo-600/10 ring-1 ring-indigo-500/30" : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              }`}
            >
              <div
                className="mb-3 flex h-24 items-center justify-center rounded-xl text-[12px] font-bold text-white/90 shadow-inner"
                style={{ backgroundColor: accent }}
              >
                Aperçu PDF ({t.nom})
              </div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13.5px] font-bold text-white">{t.nom}</p>
                {template === t.id && <Check size={16} className="text-indigo-400" />}
              </div>
              <p className="text-[12px] text-slate-400 leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-2">
        {saved && (
          <span className="text-[13px] text-emerald-400 font-bold animate-in fade-in">
            ✓ Modèle de facture enregistré avec succès !
          </span>
        )}
        <button
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { saveAIDocument } from "@/lib/ai-document-store";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const docType = (formData.get("doc_type") as string) || "devis";

    if (!file && !text) {
      return NextResponse.json({ status: "failed", error_message: "Aucun document ou texte fourni" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        status: "failed", 
        error_message: "ERREUR CRITIQUE: Clé API Gemini manquante dans le fichier .env." 
      }, { status: 500 });
    }

    let response: any = null;
    let lastError: any = null;

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptText = `Tu es un assistant comptable IA ultra-intelligent spécialisé dans l'analyse OCR et l'extraction de documents d'entreprise (Devis, Estimations, Factures).
Ton objectif est de lire ce document (${file ? file.name : "texte"}) et d'extraire TOUTES les informations financières et lignes d'articles avec UNE PRÉCISION DE 100%. AUCUNE HALLUCINATION.

Consignes d'extraction :
1. "type": Doit être "devis" si c'est une estimation/devis/proposition commercial, ou "facture" si c'est une facture.
2. "fournisseur": Nom exact de l'entreprise émettrice / fournisseur.
3. "client": Nom exact du destinataire / client.
4. "numero_facture": Numéro du devis ou de la facture (ex: DEV-2026-001, N° 45892, BC-99).
5. "date": Date d'émission au format YYYY-MM-DD.
6. "montant_ht": Total Hors Taxe numérique (ex: 1500.00).
7. "montant_ttc": Total Toutes Taxes Comprises numérique (ex: 1800.00).
8. "taux_tva": Taux de TVA principal (ex: 20, 14, 10, 7 ou 0).
9. "lignes": Tableau de toutes les lignes d'articles ou prestations. Chaque élément doit comporter :
   - "description": Nom / Désignation exacte de l'article ou de la prestation.
   - "quantite": Nombre d'unités (nombre entier ou décimal).
   - "prix_unitaire": Prix unitaire HT.
   - "montant": Montant total HT de la ligne.

Renvoie STRICTEMENT un objet JSON valide au format suivant sans aucun texte autour :
{
  "type": "${docType === "devis" ? "devis" : "facture"}",
  "fournisseur": "Nom Fournisseur",
  "client": "Nom Client",
  "numero_facture": "DEV-001",
  "date": "YYYY-MM-DD",
  "montant_ht": 1000.00,
  "montant_ttc": 1200.00,
  "taux_tva": 20,
  "lignes": [
    {
      "description": "Désignation article",
      "quantite": 1,
      "prix_unitaire": 1000.00,
      "montant": 1000.00
    }
  ]
}`;

      let contentsParts: any[] = [];

      if (text) {
        contentsParts.push({ text: `Document à analyser :\n"${text}"\n\n${promptText}` });
      } else {
        contentsParts.push({ text: promptText });
      }

      if (file) {
        const fileName = file.name || "document.pdf";
        const mimeType = file.type || "image/png";
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        let effectiveMimeType = mimeType;
        if (!effectiveMimeType || effectiveMimeType === "application/octet-stream") {
          if (fileName.endsWith(".pdf")) effectiveMimeType = "application/pdf";
          else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) effectiveMimeType = "image/jpeg";
          else effectiveMimeType = "image/png";
        }

        contentsParts.unshift({
          inlineData: {
            mimeType: effectiveMimeType,
            data: base64Data
          }
        });
      }

      // Valid Gemini Vision Model Suite - gemini-3.6-flash is primary
      const candidateModels = ["gemini-3.6-flash", "gemini-3.1-pro-preview"];

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: contentsParts }
          });
          if (response && response.text) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Gemini model ${modelName} attempt failed:`, err?.message || err);
        }
      }
    } catch (geminiInitErr: any) {
      lastError = geminiInitErr;
    }

    if (response && response.text) {
      const cleanText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        const extracted = JSON.parse(cleanText);
        const docResult = {
          id: `doc-${Date.now()}`,
          status: "completed",
          extracted_data: {
            fournisseur: extracted.fournisseur || "Fournisseur Non Spécifié",
            client: extracted.client || "Client Comptoir",
            type: (extracted.type === "devis" || docType === "devis" ? "devis" : "facture") as "devis" | "facture",
            numero_facture: extracted.numero_facture || (docType === "devis" ? `DEV-${Math.floor(1000 + Math.random() * 9000)}` : `FAC-${Math.floor(1000 + Math.random() * 9000)}`),
            date: extracted.date || new Date().toISOString().split("T")[0],
            montant_ht: Number(extracted.montant_ht) || 0,
            montant_ttc: Number(extracted.montant_ttc) || Number(extracted.montant_ht || 0) * 1.2,
            taux_tva: Number(extracted.taux_tva) || 20,
            lignes: Array.isArray(extracted.lignes) && extracted.lignes.length > 0 
              ? extracted.lignes.map((l: any) => ({
                  description: l.description || l.nom || "Article extrait",
                  quantite: Number(l.quantite || l.qte || 1),
                  prix_unitaire: Number(l.prix_unitaire || l.prix || 0),
                  montant: Number(l.montant || (Number(l.quantite || 1) * Number(l.prix_unitaire || 0)))
                }))
              : []
          }
        };
        saveAIDocument(docResult);
        return NextResponse.json(docResult);
      } catch (e) {
        return NextResponse.json({ status: "failed", error_message: "L'IA a généré un format d'analyse invalide." }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      status: "failed", 
      error_message: `Erreur d'extraction IA: ${lastError?.message || "Impossible d'analyser le document. Assurez-vous d'envoyer un fichier PDF ou une image lisible."}` 
    }, { status: 500 });

  } catch (error: any) {
    console.error("Error processing document AI:", error);
    return NextResponse.json({ status: "failed", error_message: "Erreur lors du traitement du document avec l'IA" }, { status: 500 });
  }
}

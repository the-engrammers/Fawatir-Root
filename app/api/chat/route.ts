import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { 
  getClients, 
  getSuppliers, 
  getProducts, 
  getQuotations, 
  getInvoices, 
  addClient, 
  addProduct, 
  addQuotation, 
  addInvoice 
} from "@/lib/mock-data-store";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.message;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Le message est vide." }, { status: 400 });
    }

    // 1. Gather Live Database Context
    const storeClients = getClients();
    const storeSuppliers = getSuppliers();
    const storeProducts = getProducts();
    const storeQuotations = getQuotations();
    const storeInvoices = getInvoices();

    // Consolidated Clients
    const allClients = storeClients.map((c) => ({
      id: c.id,
      nom: c.company_name || c.contact_name || "Client",
      entreprise: c.company_name,
      contact: c.contact_name || "Inconnu",
      tel: c.phone || "Non renseigné",
      ville: c.city || "Maroc",
    }));

    // Consolidated Suppliers
    const allSuppliers = storeSuppliers.map((s) => ({
      id: s.id,
      nom: s.company_name || s.contact_name || "Fournisseur",
      entreprise: s.company_name,
      contact: s.contact_name || "Inconnu",
      tel: s.phone || "Non renseigné",
      ville: s.city || "Maroc",
    }));

    // Consolidated Products
    const allProducts = storeProducts.map((p) => ({
      id: p.id,
      nom: p.name,
      sku: p.sku,
      prix: p.selling_price,
      stock: p.quantity !== undefined ? p.quantity : "Non suivi",
      categorie: p.category_name,
    }));

    // Consolidated Invoices
    const allInvoices = storeInvoices.map((i) => ({
      numero: i.invoice_number,
      client: i.client_name,
      montant: i.total_amount,
      statut: i.status,
      date: i.date,
    }));

    // Consolidated Quotations
    const allQuotations = storeQuotations.map((q) => ({
      numero: q.quotation_number,
      client: q.client_name,
      montant: q.total_amount,
      statut: q.status,
      date: q.date,
    }));

    // Dynamic KPIs
    const totalRevenue = allInvoices.filter(i => i.statut === "Payée").reduce((sum, i) => sum + i.montant, 0);
    const paidInvoicesCount = allInvoices.filter(i => i.statut === "Payée").length;
    const allInvoicesCount = allInvoices.length;
    const dynamicKpis = {
      revenuTotal: totalRevenue,
      facturesPayeesCount: paidInvoicesCount,
      facturesTotalCount: allInvoicesCount,
      tauxRecouvrement: allInvoicesCount > 0 ? Math.round((paidInvoicesCount / allInvoicesCount) * 100) : 0,
      factureMoyenne: paidInvoicesCount > 0 ? Math.round(totalRevenue / paidInvoicesCount) : 0,
    };

    const dbContext = {
      kpis: dynamicKpis,
      clientsCount: allClients.length,
      clients: allClients,
      fournisseursCount: allSuppliers.length,
      fournisseurs: allSuppliers,
      produitsCount: allProducts.length,
      produits_et_stocks: allProducts,
      facturesCount: allInvoices.length,
      factures: allInvoices,
      devisCount: allQuotations.length,
      devis: allQuotations,
      depensesCount: 0,
      depenses: [],
      employesCount: 0,
      employes: []
    };

    // Check for AI Intent to Create Data dynamically
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("crée un client") || lowerPrompt.includes("ajouter client") || lowerPrompt.includes("nouveau client")) {
      const matchName = prompt.match(/(?:client|nommé|appelé)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
      const clientName = matchName ? matchName[1] : "Nouveau Client IA";
      const newCli = addClient({
        company_name: clientName,
        contact_name: clientName,
        city: "Casablanca",
        phone: "+212 660 000000",
      });
      return NextResponse.json({
        reply: `✅ **Client créé avec succès dans la base de données Fatourati !**\n\n- **Nom / Entreprise :** ${newCli.company_name}\n- **Code Client :** ${newCli.customer_code}\n- **Ville :** Casablanca\n\nVous pouvez retrouver ce client dans le module [Clients](/clients).`
      });
    }

    if (lowerPrompt.includes("crée un produit") || lowerPrompt.includes("ajouter produit") || lowerPrompt.includes("nouveau produit")) {
      const newProd = addProduct({
        name: "Produit Ajouté via Assistant IA",
        selling_price: 500,
        quantity: 10,
        category_name: "Général"
      });
      return NextResponse.json({
        reply: `✅ **Produit ajouté avec succès dans vos stocks !**\n\n- **Désignation :** ${newProd.name}\n- **Référence SKU :** ${newProd.sku}\n- **Prix Vente :** ${newProd.selling_price} MAD\n- **Quantité initiale :** ${newProd.quantity} unités\n\nRetrouvez cet article dans [Gestion des stocks](/stocks).`
      });
    }

    // Call Gemini API if Key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemInstruction = `Tu es Fatourati AI, l'assistant virtuel intelligent directement connecté à la base de données live du système ERP marocain Fatourati.

VOICI LES DONNÉES EN TEMPS RÉEL EXTRAITES DE LA BASE DE DONNÉES DU CLIENT :
${JSON.stringify(dbContext, null, 2)}

INSTRUCTIONS :
1. Réponds aux questions de l'utilisateur en exploitant TOUJOURS les données ci-dessus (noms de clients, numéros de factures, montants exacts en MAD, stocks disponibles, dépenses, devis, employés).
2. Si l'utilisateur demande des chiffres (ex: chiffre d'affaires, total des dépenses, nombre de clients, statut d'un devis), cite les vrais chiffres extraits des données.
3. Sois très précis, chaleureux et professionnel. Utilise une mise en page Markdown soignée (listes à puces, tableaux si approprié, texte en gras).
4. Lorsque l'utilisateur demande un modèle ou un envoi WhatsApp, propose un lien cliquable au format : [Envoyer par WhatsApp](https://wa.me/212661123456?text=Bonjour...) avec le texte pré-rempli.
5. Si la question porte sur un élément introuvable dans la base, indique clairement ce qui est présent et propose de l'ajouter.`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
          }
        });

        if (response.text) {
          return NextResponse.json({ reply: response.text });
        }
      } catch (err: any) {
        console.warn("Gemini Chat API call warning, falling back to smart DB parser:", err?.message);
      }
    }

    // ======================================================
    // SMART FALLBACK — Natural Language DB Parser
    // Runs when Gemini API is unavailable (quota/no key)
    // ======================================================
    let reply = "";

    // --- Extract all meaningful words from the question ---
    const words = lowerPrompt.replace(/[?.,!]/g, "").split(/\s+/).filter(w => w.length > 2);

    // --- Helper: check if question asks "is X in stock / do you have X?" ---
    const isStockQuery = lowerPrompt.includes("stock") || lowerPrompt.includes("disponible") || lowerPrompt.includes("avez-vous") || lowerPrompt.includes("avons") || lowerPrompt.includes("reste") || lowerPrompt.includes("quantité");
    const isProductMention = lowerPrompt.includes("produit") || lowerPrompt.includes("article") || lowerPrompt.includes("inventaire");
    const isClientQuery = lowerPrompt.includes("client") || lowerPrompt.includes("acheteur") || lowerPrompt.includes("contact");
    const isInvoiceQuery = lowerPrompt.includes("facture") || lowerPrompt.includes("chiffre") || lowerPrompt.includes("vente") || lowerPrompt.includes("impayé") || lowerPrompt.includes("retard");
    const isQuotationQuery = lowerPrompt.includes("devis") || lowerPrompt.includes("proposition") || lowerPrompt.includes("offre");
    const isExpenseQuery = lowerPrompt.includes("dépense") || lowerPrompt.includes("charge") || lowerPrompt.includes("fournisseur") || lowerPrompt.includes("achat");
    const isStaffQuery = lowerPrompt.includes("employé") || lowerPrompt.includes("employe") || lowerPrompt.includes("salarié") || lowerPrompt.includes("équipe") || lowerPrompt.includes("paie");
    const isWhatsAppQuery = lowerPrompt.includes("whatsapp") || lowerPrompt.includes("message") || lowerPrompt.includes("sms");

    // --- STOCK / PRODUCT QUERY ---
    if (isStockQuery || isProductMention) {
      // Find keywords that might be a product name (exclude common words)
      const stopWords = ["est", "ce", "que", "les", "des", "une", "pour", "dans", "avec", "est", "sont", "vous", "avez", "stock", "produit", "article", "clavier", "bien", "quel", "combien", "votre", "notre", "mon", "plus", "très"];
      const productKeywords = words.filter(w => !stopWords.includes(w) && w.length > 2);

      // Try to find matching products
      let matches = dbContext.produits_et_stocks.filter(p =>
        productKeywords.some(k => p.nom.toLowerCase().includes(k))
      );

      if (matches.length > 0) {
        // Specific product found
        const p = matches[0];
        const stockQty = typeof p.stock === "number" ? p.stock : "Non suivi";
        const stockStatus = typeof p.stock === "number" ? (p.stock > 0 ? `✅ **Oui, il en reste ${p.stock} unité(s) en stock.**` : "❌ **Rupture de stock — aucune unité disponible.**") : "ℹ️ Stock non suivi.";
        reply = `### 📦 ${p.nom}\n\n${stockStatus}\n\n- **SKU :** \`${p.sku}\`\n- **Prix unitaire :** ${p.prix} MAD\n- **Stock actuel :** ${stockQty}\n\n` +
          (matches.length > 1 ? `**Autres articles similaires :** ${matches.slice(1, 3).map(m => m.nom).join(", ")}\n\n` : "") +
          `👉 Voir tous les articles dans [Gestion des stocks](/stocks).`;
      } else {
        // No specific match — show all products
        const all = dbContext.produits_et_stocks.slice(0, 8);
        if (all.length === 0) {
          reply = `### 📦 Aucun article en stock\n\nVotre base de données produits est vide pour le moment.\n\n👉 [Ajouter un produit](/stocks)`;
        } else {
          reply = `### 📦 Résultats Stock (${dbContext.produitsCount} articles)\n\n` +
            `| Article | SKU | Prix | Stock |\n| :--- | :--- | :--- | :--- |\n` +
            all.map(p => `| ${p.nom} | \`${p.sku}\` | ${p.prix} MAD | ${p.stock} |`).join("\n") +
            `\n\n👉 [Gérer les stocks](/stocks)`;
        }
      }

    // --- CLIENT QUERY ---
    } else if (isClientQuery) {
      const clientKeywords = words.filter(w => w.length > 3 && !["client", "liste", "tous", "voir", "mes", "les"].includes(w));
      const matches = clientKeywords.length > 0
        ? dbContext.clients.filter(c => clientKeywords.some(k => (c.entreprise || c.nom || "").toLowerCase().includes(k) || (c.contact || "").toLowerCase().includes(k)))
        : [];

      if (matches.length > 0) {
        reply = `### 👤 Client trouvé : ${matches[0].entreprise || matches[0].nom}\n\n` +
          `- **Contact :** ${matches[0].contact}\n- **Tél :** ${matches[0].tel}\n- **Ville :** ${matches[0].ville}` +
          (matches.length > 1 ? `\n\n**Autres correspondances :** ${matches.slice(1, 3).map(c => c.entreprise || c.nom).join(", ")}` : "") +
          `\n\n👉 Voir tous les [Clients](/clients).`;
      } else if (dbContext.clientsCount === 0) {
        reply = `### 👥 Aucun client enregistré\n\nVotre liste de clients est vide. Commencez par [ajouter un client](/clients).`;
      } else {
        const top5 = dbContext.clients.slice(0, 5);
        reply = `### 👥 Vos Clients (${dbContext.clientsCount} enregistrés)\n\n` +
          top5.map(c => `- **${c.entreprise || c.nom}** (${c.contact}) — 📞 ${c.tel} — 📍 ${c.ville}`).join("\n") +
          `\n\n👉 Liste complète : [Clients](/clients).`;
      }

    // --- INVOICE QUERY ---
    } else if (isInvoiceQuery) {
      const unpaid = dbContext.factures.filter(f => f.statut !== "Payée");
      const paid = dbContext.factures.filter(f => f.statut === "Payée");
      if (dbContext.facturesCount === 0) {
        reply = `### 📊 Aucune facture\n\nIl n'y a aucune facture dans votre base. Créez votre première [Facture](/factures).`;
      } else {
        reply = `### 📊 Synthèse Factures\n\n` +
          `- **Total émises :** ${dbContext.facturesCount} factures\n` +
          `- **Payées :** ${paid.length}\n` +
          `- **En attente / impayées :** ${unpaid.length}\n` +
          `- **CA encaissé :** ${dbContext.kpis.revenuTotal.toLocaleString("fr-FR")} MAD\n` +
          (unpaid.length > 0 ? `\n**Factures non réglées :**\n` + unpaid.slice(0, 5).map(f => `- **${f.numero}** — ${f.client} : **${f.montant} MAD** (${f.statut})`).join("\n") : "\n✅ Toutes vos factures sont payées.") +
          `\n\n👉 [Gérer les Factures](/factures)`;
      }

    // --- QUOTATION QUERY ---
    } else if (isQuotationQuery) {
      reply = `### 📑 Devis (${dbContext.devisCount})\n\n` +
        (dbContext.devisCount === 0 ? "Aucun devis trouvé. 👉 [Créer un devis](/devis)" :
          dbContext.devis.slice(0, 5).map(d => `- **${d.numero}** — ${d.client} : **${d.montant} MAD** — *${d.statut}*`).join("\n") +
          `\n\n👉 [Gérer les Devis](/devis)`);

    // --- EXPENSE QUERY ---
    } else if (isExpenseQuery) {
      const totalDep = dbContext.depenses.reduce((s, d) => s + ((d as any).montant || 0), 0);
      reply = `### 💸 Dépenses & Fournisseurs\n\n` +
        `- **Fournisseurs :** ${dbContext.fournisseursCount}\n` +
        `- **Total dépenses :** ${totalDep.toLocaleString("fr-FR")} MAD\n` +
        (dbContext.depenses.length > 0 ?
          "\n**Dernières dépenses :**\n" + dbContext.depenses.slice(0, 4).map(d => `- **(${(d as any).id})** ${(d as any).fournisseur} — ${(d as any).categorie} : **${(d as any).montant} MAD**`).join("\n") : "\nAucune dépense enregistrée.") +
        `\n\n👉 [Dépenses](/depenses) | [Fournisseurs](/fournisseurs)`;

    // --- STAFF QUERY ---
    } else if (isStaffQuery) {
      reply = `### 👥 Équipe & Paie (${dbContext.employes.length} employés)\n\n` +
        (dbContext.employes.length === 0 ? "Aucun employé enregistré. 👉 [Ajouter un employé](/employes)" :
          dbContext.employes.slice(0, 5).map(e => `- **${(e as any).nom}** — ${(e as any).poste} : ${(e as any).salaireBase} MAD`).join("\n") +
          `\n\n👉 [Bulletins de paie](/bulletins-de-paie)`);

    // --- WHATSAPP QUERY ---
    } else if (isWhatsAppQuery) {
      const unpaid = dbContext.factures.filter(f => f.statut !== "Payée");
      if (unpaid.length > 0 && unpaid[0].client) {
        const f = unpaid[0];
        const cleanPhone = "212600000000";
        const msg = encodeURIComponent(`Bonjour ${f.client}, rappel concernant la facture ${f.numero} de ${f.montant} MAD. Merci de régulariser. Fatourati`);
        reply = `### 💬 Message WhatsApp — Relance Facture\n\n**Pour :** ${f.client} — Facture **${f.numero}** (${f.montant} MAD)\n\n> Bonjour ${f.client}, rappel concernant la facture ${f.numero} de ${f.montant} MAD. Merci de régulariser. Fatourati\n\n[📱 Envoyer via WhatsApp](whatsapp://send?phone=${cleanPhone}&text=${msg})`;
      } else {
        reply = `### 💬 WhatsApp\n\nAucune facture impayée trouvée. Toutes vos relances sont à jour ! ✅\n\n👉 [Voir les factures](/factures)`;
      }

    // --- DEFAULT / GENERAL ---
    } else {
      reply = `### 🤖 Assistant Fatourati\n\nJe suis connecté à votre base de données en temps réel. Voici votre tableau de bord :\n\n` +
        `| Module | Données |\n| :--- | :--- |\n` +
        `| 👥 Clients | ${dbContext.clientsCount} enregistrés |\n` +
        `| 📦 Produits / Stocks | ${dbContext.produitsCount} références |\n` +
        `| 📊 Factures | ${dbContext.facturesCount} (${dbContext.kpis.facturesPayeesCount} payées) |\n` +
        `| 📑 Devis | ${dbContext.devisCount} |\n` +
        `| 👥 Employés | ${dbContext.employes.length} |\n\n` +
        `**Posez-moi une question** du type :\n- *"Le clavier est-il en stock ?"*\n- *"Montre mes clients"*\n- *"Combien de factures impayées ?"*`;
    }

    return NextResponse.json({ reply });


  } catch (error: any) {
    console.error("Fatal error in Chat API Route:", error);
    return NextResponse.json(
      { reply: "Je suis connecté à votre système Fatourati. Comment puis-je vous assister ?" },
      { status: 200 }
    );
  }
}

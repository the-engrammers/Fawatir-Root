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
import { 
  kpis, 
  indicateurs, 
  clientsList, 
  clientsFull, 
  fournisseursList, 
  produitsList, 
  facturesList, 
  devisList, 
  depensesList, 
  bonsCommandeList, 
  avoirsList, 
  employesList 
} from "@/lib/mock-data";

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
          model: "gemini-2.5-flash",
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

    // Smart Fallback using Live Database Search
    let reply = "";

    if (lowerPrompt.includes("client") || lowerPrompt.includes("acheteurs")) {
      const top3Clients = dbContext.clients.slice(0, 5);
      reply = `### 📋 Données Clients (${dbContext.clientsCount} clients enregistrés)\n\nVoici quelques clients dans votre base de données Fatourati :\n\n` +
        top3Clients.map(c => `- **${c.entreprise || c.nom}** (${c.contact}) - 📞 ${c.tel} - 📍 ${c.ville}`).join("\n") +
        `\n\n👉 Vous pouvez voir la liste complète dans le module [Clients](/clients).`;

    } else if (lowerPrompt.includes("facture") || lowerPrompt.includes("chiffre") || lowerPrompt.includes("vente")) {
      const unpaid = dbContext.factures.filter(f => f.statut !== "Payée");
      reply = `### 📊 Synthèse des Factures\n\n- **Total des factures :** ${dbContext.facturesCount}\n- **Chiffre d'affaires total :** ${dbContext.kpis.revenuTotal.toLocaleString("fr-FR")} MAD\n- **Factures payées :** ${dbContext.kpis.facturesPayeesCount} / ${dbContext.kpis.facturesTotalCount}\n\n**Dernières factures non réglées :**\n` +
        unpaid.slice(0, 3).map(f => `- **${f.numero}** - ${f.client} : **${f.montant} MAD** (${f.statut})`).join("\n") +
        `\n\n👉 Consulter toutes les [Factures](/factures).`;

    } else if (lowerPrompt.includes("stock") || lowerPrompt.includes("produit") || lowerPrompt.includes("article") || lowerPrompt.includes("inventaire")) {
      const lowStock = dbContext.produits_et_stocks.slice(0, 5);
      reply = `### 📦 Base Produits & Stocks (${dbContext.produitsCount} articles)\n\n` +
        `| Article | SKU | Prix (MAD) | Stock |\n| :--- | :--- | :--- | :--- |\n` +
        lowStock.map(p => `| ${p.nom} | \`${p.sku}\` | ${p.prix} MAD | **${p.stock}** |`).join("\n") +
        `\n\nAccédez à la [Gestion des stocks](/stocks) pour ajouter ou modifier un produit.`;

    } else if (lowerPrompt.includes("devis")) {
      reply = `### 📑 Devis & Propositions Commerciales (${dbContext.devisCount} devis)\n\n` +
        dbContext.devis.slice(0, 4).map(d => `- **${d.numero}** (${d.client}) : **${d.montant} MAD** - Statut : *${d.statut}*`).join("\n") +
        `\n\n👉 Gérez ou créez un nouveau [Devis](/devis).`;

    } else if (lowerPrompt.includes("dépense") || lowerPrompt.includes("charge") || lowerPrompt.includes("fournisseur")) {
      const totalDep = dbContext.depenses.reduce((s, d) => s + (d as any).montant, 0);
      reply = `### 💸 Suivi des Dépenses & Fournisseurs\n\n- **Nombre de fournisseurs :** ${dbContext.fournisseursCount}\n- **Total des dépenses enregistrées :** ${totalDep.toLocaleString("fr-FR")} MAD\n\n**Dernières dépenses :**\n` +
        dbContext.depenses.slice(0, 3).map(d => `- **${(d as any).id}** (${(d as any).fournisseur}) - ${(d as any).categorie} : **${(d as any).montant} MAD** [${(d as any).statut}]`).join("\n") +
        `\n\n👉 Voir les [Dépenses](/depenses) ou [Fournisseurs](/fournisseurs).`;

    } else if (lowerPrompt.includes("employé") || lowerPrompt.includes("paie") || lowerPrompt.includes("équipe")) {
      reply = `### 👥 Gestion de l'Équipe & Paie (${dbContext.employes.length} employés actifs)\n\n` +
        dbContext.employes.map(e => `- **${(e as any).nom}** (${(e as any).poste} - ${(e as any).departement}) : Salaire brut **${(e as any).salaireBase} MAD**`).join("\n") +
        `\n\nConsulter le module [Bulletins de paie](/bulletins-de-paie).`;

    } else if (lowerPrompt.includes("whatsapp")) {
      reply = `Voici un modèle de message professionnel prêt pour WhatsApp :\n\n> *Bonjour, nous vous informons que votre document Fatourati est disponible. N'hésitez pas à nous contacter pour toute question.*\n\n👉 [Cliquer pour envoyer via WhatsApp](https://wa.me/212661123456?text=Bonjour,%20votre%20document%20Fatourati%20est%20disponible.)`;

    } else {
      reply = `Bonjour ! Je suis l'**Assistant IA Fatourati**, connecté en temps réel à votre base de données ERP.\n\n` +
        `Voici un aperçu de vos données actuelles :\n` +
        `- 👥 **Clients :** ${dbContext.clientsCount} enregistrés\n` +
        `- 📦 **Articles / Stocks :** ${dbContext.produitsCount} références\n` +
        `- 📊 **Factures :** ${dbContext.facturesCount} émises (${dbContext.kpis.facturesPayeesCount} payées)\n` +
        `- 💸 **Dépenses :** ${dbContext.depensesCount} charges suivies\n\n` +
        `Comment puis-je vous aider ? Vous pouvez me demander de rechercher un client, vérifier un stock, ou calculer votre chiffre d'affaires !`;
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

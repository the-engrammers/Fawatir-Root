export const kpis = {
  revenuTotal: 824848.8,
  revenuVariation: 20.3,
  tauxRecouvrement: 57,
  facturesPayeesCount: 26,
  facturesTotalCount: 46,
  factureMoyenne: 31700,
  clientsCount: 12,
};

export const tuiles = [
  { label: "Total des factures", value: 46, tone: "info" as const },
  { label: "Payées", value: 26, tone: "success" as const },
  { label: "En attente", value: 14, tone: "warning" as const },
  { label: "En retard", value: 17, tone: "danger" as const },
];

export const indicateurs = [
  { label: "Total des dépenses", value: "462,0K MAD" },
  { label: "Bénéfice net", value: "+362 892,80 MAD" },
  { label: "Marge bénéficiaire", value: "44%" },
  { label: "Devis (conversion)", value: "18 · 11,1%" },
  { label: "Récurrences actives", value: "4" },
  { label: "En gestion des stocks", value: "20" },
];

export const revenuMensuel = [
  { mois: "Nov", revenu: 55000 },
  { mois: "Dec", revenu: 168000 },
  { mois: "Jan", revenu: 118000 },
  { mois: "Fev", revenu: 96000 },
  { mois: "Mar", revenu: 132000 },
  { mois: "Avr", revenu: 206400 },
];

export const repartitionStatuts = [
  { label: "Payée", value: 26, pct: 57, color: "#1F8A5F" },
  { label: "Brouillon", value: 5, pct: 11, color: "#3E5C82" },
  { label: "Envoyée", value: 5, pct: 11, color: "#B8863B" },
  { label: "Vue", value: 4, pct: 9, color: "#6B7280" },
  { label: "En retard", value: 4, pct: 9, color: "#C1443A" },
  { label: "Annulée", value: 2, pct: 4, color: "#C77C22" },
];

export const facturesRecentes = [
  { numero: "FAC-0045", client: "Mouad El Khatib", montant: 102000, statut: "Payée", date: "12 Avr 2026" },
  { numero: "FAC-0046", client: "Fatima Zahra Moussaoui", montant: 41400, statut: "Payée", date: "12 Avr 2026" },
  { numero: "FAC-0044", client: "Nadia Squalli", montant: 78000, statut: "Payée", date: "12 Avr 2026" },
  { numero: "FAC-0043", client: "Rachid Chraibi", montant: 25084.8, statut: "Payée", date: "12 Avr 2026" },
  { numero: "FAC-0041", client: "Hassan Alami", montant: 26400, statut: "Payée", date: "12 Avr 2026" },
];

export const meilleurClient = { nom: "Sara El Fassi", montant: 181200 };
export const activiteRecente = { count: 115, periode: "7 derniers jours" };

// --- Factures module ---

export type Facture = {
  id: string;
  numero: string;
  clientId: string;
  client: string;
  montant: number;
  statut: "Brouillon" | "Envoyée" | "Vue" | "Payée" | "En retard" | "Annulée";
  dateEmission: string;
  dateEcheance: string;
  lignes: { article: string; qte: number; prix: number }[];
  remise: number;
  taxePct: number;
  notes?: string;
};

export const clientsRecents = [
  { id: "cl-1", nom: "Mouad El Khatib" },
  { id: "cl-2", nom: "Fatima Zahra Moussaoui" },
  { id: "cl-3", nom: "Nadia Squalli" },
  { id: "cl-4", nom: "Rachid Chraibi" },
  { id: "cl-5", nom: "Hassan Alami" },
];

export const clientsList = [
  { id: "cl-6", nom: "Karim Idrissi", entreprise: "TechnoDev Solutions", email: "karim@technodev.ma", telephone: "+212 661 111 222" },
  { id: "cl-7", nom: "Sara El Fassi", entreprise: "Design Studio Maroc", email: "sara@designstudio.ma", telephone: "+212 662 333 444" },
  { id: "cl-8", nom: "Omar Bennani", entreprise: "Logistics Pro Maroc", email: "omar@logisticspro.ma", telephone: "+212 663 555 666" },
  { id: "cl-9", nom: "Amina Tazi", entreprise: "Green Energy Solutions", email: "amina@greenenergy.ma", telephone: "+212 664 777 888" },
  { id: "cl-5", nom: "Hassan Alami", entreprise: "BuildCorp Construction", email: "hassan@buildcorp.ma", telephone: "+212 665 999 000" },
  { id: "cl-10", nom: "Leila Berrada", entreprise: "MediaShop Agency", email: "leila@mediashop.ma", telephone: "+212 666 112 233" },
  { id: "cl-4", nom: "Rachid Chraibi", entreprise: "FoodChain Distribution", email: "rachid@foodchain.ma", telephone: "+212 667 445 566" },
  { id: "cl-3", nom: "Nadia Squalli", entreprise: "EduTech Academy", email: "nadia@edutech.ma", telephone: "+212 668 778 899" },
  { id: "cl-1", nom: "Mouad El Khatib", entreprise: "AutoParts Maroc", email: "mouad@autoparts.ma", telephone: "+212 669 901 234" },
  { id: "cl-2", nom: "Fatima Zahra Moussaoui", entreprise: "PharmaLab Industries", email: "fatima@pharmalab.ma", telephone: "+212 670 567 890" },
];

export const facturesList: Facture[] = [
  {
    id: "FAC-0046",
    numero: "FAC-0046",
    clientId: "cl-2",
    client: "Fatima Zahra Moussaoui",
    montant: 41400,
    statut: "Payée",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [{ article: "Consultation IT", qte: 1, prix: 41400 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0045",
    numero: "FAC-0045",
    clientId: "cl-1",
    client: "Mouad El Khatib",
    montant: 102000,
    statut: "Payée",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [{ article: "Application Mobile", qte: 1, prix: 102000 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0044",
    numero: "FAC-0044",
    clientId: "cl-3",
    client: "Nadia Squalli",
    montant: 78000,
    statut: "Payée",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [{ article: "Audit Sécurité", qte: 1, prix: 78000 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0043",
    numero: "FAC-0043",
    clientId: "cl-4",
    client: "Rachid Chraibi",
    montant: 25084.8,
    statut: "Payée",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [{ article: "Développement Web", qte: 1, prix: 25084.8 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0042",
    numero: "FAC-0042",
    clientId: "cl-10",
    client: "Leila Berrada",
    montant: 12600,
    statut: "En retard",
    dateEmission: "12 Mar 2026",
    dateEcheance: "12 Avr 2026",
    lignes: [{ article: "Hébergement Cloud", qte: 1, prix: 12600 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0041",
    numero: "FAC-0041",
    clientId: "cl-5",
    client: "Hassan Alami",
    montant: 26400,
    statut: "Payée",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [{ article: "Formation Technique", qte: 1, prix: 26400 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0040",
    numero: "FAC-0040",
    clientId: "cl-9",
    client: "Amina Tazi",
    montant: 10800,
    statut: "Payée",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [{ article: "Logo & Brand Identity", qte: 1, prix: 10800 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0039",
    numero: "FAC-0039",
    clientId: "cl-8",
    client: "Omar Bennani",
    montant: 18400,
    statut: "Envoyée",
    dateEmission: "02 Avr 2026",
    dateEcheance: "02 Mai 2026",
    lignes: [{ article: "Conseil IT", qte: 1, prix: 18400 }],
    remise: 0,
    taxePct: 20,
  },
  {
    id: "FAC-0038",
    numero: "FAC-0038",
    clientId: "cl-6",
    client: "Karim Idrissi",
    montant: 6590,
    statut: "Brouillon",
    dateEmission: "12 Avr 2026",
    dateEcheance: "12 Mai 2026",
    lignes: [
      { article: "Audit SEO complet", qte: 1, prix: 3500 },
      { article: "Rédaction 5 articles", qte: 1, prix: 2000 },
    ],
    remise: 10,
    taxePct: 20,
    notes: "Paiement par virement bancaire",
  },
  {
    id: "FAC-0037",
    numero: "FAC-0037",
    clientId: "cl-7",
    client: "Sara El Fassi",
    montant: 7243.2,
    statut: "Annulée",
    dateEmission: "17 Déc 2025",
    dateEcheance: "16 Jan 2026",
    lignes: [{ article: "Design UI/UX", qte: 1, prix: 5500 }],
    remise: 0,
    taxePct: 20,
  },
];

// --- Devis module ---

export type Devis = {
  id: string;
  numero: string;
  client: string;
  montant: number;
  statut: "Brouillon" | "Envoyée" | "Accepté" | "Refusé" | "Expiré" | "Converti";
  validiteJusquau: string;
  lignes: { article: string; qte: number; prix: number }[];
};

export const devisList: Devis[] = [
  { id: "DEV-0018", numero: "DEV-0018", client: "Leila Berrada", montant: 71040, statut: "Envoyée", validiteJusquau: "23 Fev 2026", lignes: [{ article: "Design UI/UX", qte: 1, prix: 71040 }] },
  { id: "DEV-0017", numero: "DEV-0017", client: "Hassan Alami", montant: 135600, statut: "Envoyée", validiteJusquau: "04 Mai 2026", lignes: [{ article: "Application Mobile", qte: 1, prix: 135600 }] },
  { id: "DEV-0016", numero: "DEV-0016", client: "Amina Tazi", montant: 47464.8, statut: "Accepté", validiteJusquau: "13 Mar 2026", lignes: [{ article: "Audit Sécurité", qte: 1, prix: 47464.8 }] },
  { id: "DEV-0014", numero: "DEV-0014", client: "Sara El Fassi", montant: 91200, statut: "Accepté", validiteJusquau: "08 Mai 2026", lignes: [{ article: "Développement Web", qte: 1, prix: 91200 }] },
  { id: "DEV-0015", numero: "DEV-0015", client: "Omar Bennani", montant: 26400, statut: "Accepté", validiteJusquau: "17 Mar 2026", lignes: [{ article: "Consultation IT", qte: 1, prix: 26400 }] },
  { id: "DEV-0013", numero: "DEV-0013", client: "Karim Idrissi", montant: 267600, statut: "Converti", validiteJusquau: "16 Mar 2026", lignes: [{ article: "Intégration API", qte: 1, prix: 267600 }] },
  { id: "DEV-0012", numero: "DEV-0012", client: "Imane Benkirane", montant: 28800, statut: "Converti", validiteJusquau: "31 Jan 2026", lignes: [{ article: "Formation Technique", qte: 1, prix: 28800 }] },
  { id: "DEV-0010", numero: "DEV-0010", client: "Fatima Zahra Moussaoui", montant: 71040, statut: "Refusé", validiteJusquau: "20 Avr 2026", lignes: [{ article: "Hébergement Cloud", qte: 1, prix: 71040 }] },
  { id: "DEV-0011", numero: "DEV-0011", client: "Yassine Hajji", montant: 16078.8, statut: "Expiré", validiteJusquau: "02 Mai 2026", lignes: [{ article: "Rédaction 5 articles", qte: 1, prix: 16078.8 }] },
  { id: "DEV-0009", numero: "DEV-0009", client: "Mouad El Khatib", montant: 135600, statut: "Refusé", validiteJusquau: "29 Jan 2026", lignes: [{ article: "Logo & Brand Identity", qte: 1, prix: 135600 }] },
];

// --- Clients module (fiche complète) ---

export type Client = {
  id: string;
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  adresse: string;
  pays: "Maroc" | "France" | "Autre";
  dateClient: string;
  fiscal: Record<string, string>;
};

export const clientsFull: Client[] = [
  { id: "cl-6", nom: "Karim Idrissi", entreprise: "TechnoDev Solutions", email: "karim@technodev.ma", telephone: "+212 661 111 222", adresse: "12 Rue Ibn Sina, Rabat 10000", pays: "Maroc", dateClient: "12 Avr 2026", fiscal: { "Identifiant Fiscal (IF)": "IF30012345", ICE: "0001XXXXXXXXXXX", "Registre de Commerce (RC)": "RC XXXXX" } },
  { id: "cl-7", nom: "Sara El Fassi", entreprise: "Design Studio Maroc", email: "sara@designstudio.ma", telephone: "+212 662 333 444", adresse: "45 Bd Zerktouni, Casablanca", pays: "Maroc", dateClient: "02 Fev 2026", fiscal: { "Identifiant Fiscal (IF)": "IF41029384", ICE: "0002XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 88213" } },
  { id: "cl-8", nom: "Omar Bennani", entreprise: "Logistics Pro Maroc", email: "omar@logisticspro.ma", telephone: "+212 663 555 666", adresse: "8 Zone Industrielle, Tanger", pays: "Maroc", dateClient: "18 Déc 2025", fiscal: { "Identifiant Fiscal (IF)": "IF52847362", ICE: "0003XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 44120" } },
  { id: "cl-9", nom: "Amina Tazi", entreprise: "Green Energy Solutions", email: "amina@greenenergy.ma", telephone: "+212 664 777 888", adresse: "3 Avenue Mohammed VI, Marrakech", pays: "Maroc", dateClient: "05 Jan 2026", fiscal: { "Identifiant Fiscal (IF)": "IF63928475", ICE: "0004XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 30981" } },
  { id: "cl-5", nom: "Hassan Alami", entreprise: "BuildCorp Construction", email: "hassan@buildcorp.ma", telephone: "+212 665 999 000", adresse: "21 Rue des Fleurs, Fès", pays: "Maroc", dateClient: "14 Nov 2025", fiscal: { "Identifiant Fiscal (IF)": "IF74839201", ICE: "0005XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 55234" } },
  { id: "cl-10", nom: "Leila Berrada", entreprise: "MediaShop Agency", email: "leila@mediashop.ma", telephone: "+212 666 112 233", adresse: "9 Rue Allal Ben Abdellah, Rabat", pays: "Maroc", dateClient: "22 Oct 2025", fiscal: { "Identifiant Fiscal (IF)": "IF85920174", ICE: "0006XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 61928" } },
  { id: "cl-4", nom: "Rachid Chraibi", entreprise: "FoodChain Distribution", email: "rachid@foodchain.ma", telephone: "+212 667 445 566", adresse: "17 Route de Casablanca, El Jadida", pays: "Maroc", dateClient: "30 Sep 2025", fiscal: { "Identifiant Fiscal (IF)": "IF96183726", ICE: "0007XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 72841" } },
  { id: "cl-3", nom: "Nadia Squalli", entreprise: "EduTech Academy", email: "nadia@edutech.ma", telephone: "+212 668 778 899", adresse: "5 Bd Hassan II, Kénitra", pays: "Maroc", dateClient: "18 Aug 2025", fiscal: { "Identifiant Fiscal (IF)": "IF17293845", ICE: "0008XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 83192" } },
  { id: "cl-1", nom: "Mouad El Khatib", entreprise: "AutoParts Maroc", email: "mouad@autoparts.ma", telephone: "+212 669 901 234", adresse: "2 Zone Industrielle Ain Sebaa, Casablanca", pays: "Maroc", dateClient: "10 Jul 2025", fiscal: { "Identifiant Fiscal (IF)": "IF28374619", ICE: "0009XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 94720" } },
  { id: "cl-2", nom: "Fatima Zahra Moussaoui", entreprise: "PharmaLab Industries", email: "fatima@pharmalab.ma", telephone: "+212 670 567 890", adresse: "30 Avenue des FAR, Casablanca", pays: "Maroc", dateClient: "01 Jun 2025", fiscal: { "Identifiant Fiscal (IF)": "IF39482716", ICE: "0010XXXXXXXXXXX", "Registre de Commerce (RC)": "RC 10583" } },
];

// --- Fournisseurs module ---

export const fournisseursList = [
  { id: "fr-1", nom: "Ali Tahir", entreprise: "Amazon Web Services MENA", email: "billing@aws.amazon.com", telephone: "+1 206 266 1000" },
  { id: "fr-2", nom: "Jean-Michel Dupont", entreprise: "OVHcloud Maroc", email: "support@ovhcloud.com", telephone: "+33 9 72 10 10 07" },
  { id: "fr-3", nom: "Mohamed Nasser", entreprise: "Microchoix Informatique", email: "ventes@microchoix.ma", telephone: "+212 522 201 500" },
  { id: "fr-4", nom: "Sarah Benali", entreprise: "Atlassian Morocco", email: "sales@atlassian.com", telephone: "+61 2 9262 1443" },
  { id: "fr-5", nom: "Carlos Mendez", entreprise: "Adobe Systems EMEA", email: "enterprise@adobe.com", telephone: "+353 1 242 3000" },
  { id: "fr-6", nom: "Rachida Alami", entreprise: "Datacom Solutions MA", email: "contact@datacom.ma", telephone: "+212 537 706 800" },
];

// --- Bons de commande module ---

export type BonCommande = {
  id: string;
  fournisseur: string;
  statut: "Brouillon" | "Envoyé" | "Partiel" | "Reçu";
  dateEmission: string;
  livraisonPrevue: string;
  montant: number;
  articles: { nom: string; qte: number; recu: number; prixUnitaire: number }[];
};

export const bonsCommandeList: BonCommande[] = [
  { id: "PO-0005", fournisseur: "Datacom Solutions MA", statut: "Brouillon", dateEmission: "10 Avr 2026", livraisonPrevue: "24 Avr 2026", montant: 20400, articles: [{ nom: "Switch Cisco 48 ports", qte: 2, recu: 0, prixUnitaire: 6500 }, { nom: "Câblage réseau Cat6 (lot)", qte: 5, recu: 0, prixUnitaire: 800 }] },
  { id: "PO-0004", fournisseur: "OVHcloud Maroc", statut: "Envoyé", dateEmission: "07 Avr 2026", livraisonPrevue: "14 Avr 2026", montant: 5760, articles: [{ nom: "Hébergement dédié 1 an", qte: 1, recu: 0, prixUnitaire: 4800 }] },
  { id: "PO-0003", fournisseur: "Microchoix Informatique", statut: "Partiel", dateEmission: "23 Mar 2026", livraisonPrevue: "30 Mar 2026", montant: 35400, articles: [{ nom: "Ordinateurs portables", qte: 3, recu: 1, prixUnitaire: 9000 }, { nom: "Souris sans fil", qte: 3, recu: 3, prixUnitaire: 200 }] },
  { id: "PO-0002", fournisseur: "Microchoix Informatique", statut: "Reçu", dateEmission: "26 Fev 2026", livraisonPrevue: "05 Mar 2026", montant: 134400, articles: [{ nom: "Serveur Dell PowerEdge", qte: 2, recu: 2, prixUnitaire: 56000 }, { nom: "Onduleur APC", qte: 2, recu: 2, prixUnitaire: 11200 }] },
  { id: "PO-0001", fournisseur: "Amazon Web Services MENA", statut: "Reçu", dateEmission: "11 Fev 2026", livraisonPrevue: "11 Fev 2026", montant: 26400, articles: [{ nom: "Crédits cloud annuels", qte: 1, recu: 1, prixUnitaire: 26400 }] },
];

// --- Avoirs module ---

export const avoirsList = [
  { id: "AV-0005", client: "Sara El Fassi", facture: "FAC-0021", montant: 4800, date: "18 Avr 2026", motif: "Remise commerciale" },
  { id: "AV-0004", client: "Karim Idrissi", facture: "FAC-0033", montant: 12600, date: "02 Avr 2026", motif: "Article retourné" },
  { id: "AV-0003", client: "Amina Tazi", facture: "FAC-0018", montant: 2400, date: "22 Mar 2026", motif: "Erreur de facturation" },
  { id: "AV-0002", client: "Hassan Alami", facture: "FAC-0012", montant: 15900, date: "08 Mar 2026", motif: "Annulation partielle" },
  { id: "AV-0001", client: "Rachid Chraibi", facture: "FAC-0006", montant: 12600, date: "14 Fev 2026", motif: "Article retourné" },
];

// --- Dépenses module ---

export const depensesList = [
  { id: "DEP-0032", categorie: "Logiciels & Abonnements", fournisseur: "Adobe Systems EMEA", montant: 2400, date: "18 Avr 2026", statut: "Payée" as const },
  { id: "DEP-0031", categorie: "Hébergement", fournisseur: "OVHcloud Maroc", montant: 4800, date: "14 Avr 2026", statut: "Payée" as const },
  { id: "DEP-0030", categorie: "Matériel informatique", fournisseur: "Microchoix Informatique", montant: 56000, date: "05 Mar 2026", statut: "Payée" as const },
  { id: "DEP-0029", categorie: "Marketing", fournisseur: "Meta Ads", montant: 8200, date: "01 Mar 2026", statut: "En attente" as const },
  { id: "DEP-0028", categorie: "Fournitures de bureau", fournisseur: "Bureau Plus Maroc", montant: 1350, date: "22 Fev 2026", statut: "Payée" as const },
];

// --- Employés module ---

export type Employe = {
  id: string;
  prenom: string;
  nom: string;
  cin: string;
  poste: string;
  departement: string;
  dateEmbauche: string;
  statut: "Actif" | "Inactif";
  salaireBase: number;
  personnesACharge: number;
};

export const employesList: Employe[] = [
  { id: "emp-1", prenom: "Mohammed", nom: "Benali", cin: "AB123456", poste: "Développeur Full-Stack", departement: "Ingénierie", dateEmbauche: "12 Avr 2026", statut: "Actif", salaireBase: 12000, personnesACharge: 3 },
  { id: "emp-2", prenom: "Yasmine", nom: "Ouazzani", cin: "BE457821", poste: "Cheffe de projet", departement: "Ingénierie", dateEmbauche: "03 Jan 2026", statut: "Actif", salaireBase: 15500, personnesACharge: 1 },
  { id: "emp-3", prenom: "Anas", nom: "Fassi", cin: "CD918273", poste: "Comptable", departement: "Finance", dateEmbauche: "20 Sep 2025", statut: "Actif", salaireBase: 9800, personnesACharge: 0 },
];

// --- Bulletins de paie module ---

export type Bulletin = {
  id: string;
  employeId: string;
  periode: string;
  salaireBrut: number;
  cnssPct: number;
  amoPct: number;
  fraisProSalaire: number;
  personnesACharge: number;
  statut: "Brouillon" | "Validé";
};

export const bulletinsList: Bulletin[] = [
  { id: "BUL-2026-04-emp1", employeId: "emp-1", periode: "Avril 2026", salaireBrut: 12000, cnssPct: 4.48, amoPct: 2.26, fraisProSalaire: 2292, personnesACharge: 3, statut: "Brouillon" },
];

// --- Gestion des stocks module ---

export type Variante = { nom: string; sku: string; prix: number; stock: number };
export type Produit = {
  id: string;
  nom: string;
  description: string;
  prix: number;
  sku: string;
  unite: "Unité" | "Heure" | "Projet";
  categorie: string;
  suivreStock: boolean;
  stock?: number;
  fournisseur?: string;
  statut: "Actif" | "Inactif";
  variantes: Variante[];
};

export const produitsList: Produit[] = [
  { id: "pr-1", nom: "API Integration", description: "Intégration APIs REST / GraphQL et systèmes tiers (ERP, CRM)", prix: 4500, sku: "DEV-API", unite: "Projet", categorie: "Développement", suivreStock: false, statut: "Actif", variantes: [] },
  { id: "pr-2", nom: "Application Mobile", description: "Application iOS / Android native ou cross-platform", prix: 22000, sku: "DEV-M0B", unite: "Projet", categorie: "Développement", suivreStock: false, statut: "Actif", variantes: [] },
  { id: "pr-3", nom: "Audit Sécurité", description: "Pentest, analyse de vulnérabilités et rapport détaillé", prix: 12000, sku: "SEC-AUDIT", unite: "Projet", categorie: "Sécurité", suivreStock: false, statut: "Actif", variantes: [] },
  { id: "pr-4", nom: "Clavier Mécanique Logitech", description: "Logitech MX Mechanical, switches tactiles", prix: 1350, sku: "K80-MX", unite: "Unité", categorie: "Matériel", suivreStock: true, stock: 22, fournisseur: "Mohamed Nasser", statut: "Actif", variantes: [] },
  { id: "pr-5", nom: "Consultation IT", description: "Audit, conseil et accompagnement technique", prix: 950, sku: "CONS-IT", unite: "Heure", categorie: "Conseil", suivreStock: false, statut: "Actif", variantes: [] },
  { id: "pr-6", nom: "Design UI/UX", description: "Maquettes Figma, prototypage et design system", prix: 5500, sku: "DES-UX", unite: "Projet", categorie: "Design", suivreStock: false, fournisseur: "Carlos Mendez", statut: "Actif", variantes: [] },
  { id: "pr-7", nom: "Disque SSD Samsung 2TB", description: "Samsung 870 EVO, 2 To, SATA III", prix: 1200, sku: "SSD-2TB", unite: "Unité", categorie: "Matériel", suivreStock: true, stock: 38, fournisseur: "Mohamed Nasser", statut: "Actif", variantes: [
    { nom: "500 Go", sku: "SSD-500", prix: 450, stock: 15 },
    { nom: "1 To", sku: "SSD-1TB", prix: 750, stock: 20 },
  ] },
  { id: "pr-8", nom: "Développement Web", description: "Site vitrine ou application web sur-mesure", prix: 8500, sku: "DEV-WEB", unite: "Projet", categorie: "Développement", suivreStock: false, statut: "Actif", variantes: [] },
  { id: "pr-9", nom: "Formation Technique", description: "Session de formation en présentiel ou distanciel", prix: 1400, sku: "FORM-TECH", unite: "Heure", categorie: "Formation", suivreStock: false, statut: "Actif", variantes: [] },
  { id: "pr-10", nom: "Hébergement Cloud", description: "Hébergement mensuel, sauvegardes incluses", prix: 800, sku: "INF-CLOUD", unite: "Unité", categorie: "Infrastructure", suivreStock: false, statut: "Actif", variantes: [] },
];

// --- Point de vente module ---

export const posCategories = ["Tous", "Conseil", "Design", "Développement", "Formation", "Infrastructure", "Logiciels", "Matériel", "Support", "Sécurité"];

// --- Rapports module ---

export const topClients = [
  { nom: "Sara El Fassi", revenu: 181200 },
  { nom: "Karim Idrissi", revenu: 267600 },
  { nom: "Mouad El Khatib", revenu: 102000 },
  { nom: "Nadia Squalli", revenu: 78000 },
  { nom: "Hassan Alami", revenu: 26400 },
];

export const revenuParCategorie = [
  { categorie: "Développement", montant: 315600 },
  { categorie: "Design", montant: 89200 },
  { categorie: "Conseil", montant: 62400 },
  { categorie: "Sécurité", montant: 90000 },
  { categorie: "Formation", montant: 41800 },
];

// --- Équipe module ---

export const equipeList = [
  { id: "eq-1", nom: "Fawatir Demo", email: "demo@fatourati.app", role: "Propriétaire", statut: "Actif" as const },
  { id: "eq-2", nom: "Yasmine Ouazzani", email: "yasmine@fatourati.app", role: "Comptable", statut: "Actif" as const },
  { id: "eq-3", nom: "Anas Fassi", email: "anas@fatourati.app", role: "Membre", statut: "Invité" as const },
];

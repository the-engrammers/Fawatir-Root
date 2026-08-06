// In-memory data store for Fatourati API routes

export interface Company {
  id: string;
  name: string;
  email: string;
}

export interface Client {
  id: string;
  company?: string;
  customer_code: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, any>;
}

export interface Supplier {
  id: string;
  company?: string;
  supplier_code: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, any>;
}

export interface Product {
  id: string;
  company?: string;
  sku: string;
  name: string;
  description?: string;
  selling_price: number;
  quantity: number;
  unit?: string;
  category_name?: string;
  track_inventory?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface Quotation {
  id: string;
  company?: string;
  client?: string;
  quotation_number: string;
  client_name?: string;
  status: string;
  total_amount: number;
  date?: string;
}

export interface Invoice {
  id: string;
  company?: string;
  client?: string;
  invoice_number: string;
  client_name?: string;
  status: string;
  total_amount: number;
  date?: string;
}

const companiesStore: Company[] = [
  { id: "comp-1", name: "Fawatir Demo", email: "demo@fawatir.ma" }
];

let clientsStore: Client[] = [
  {
    id: "cli-1",
    customer_code: "CL-1001",
    company_name: "Atlas Tech SARL",
    contact_name: "Youssef Bennani",
    email: "youssef@atlastra.ma",
    phone: "+212 661 123456",
    city: "Casablanca",
    country: "Maroc"
  },
  {
    id: "cli-2",
    customer_code: "CL-1002",
    company_name: "Maroc Import Expo",
    contact_name: "Sara Alami",
    email: "sara@marocimport.ma",
    phone: "+212 662 987654",
    city: "Rabat",
    country: "Maroc"
  }
];

let suppliersStore: Supplier[] = [
  {
    id: "sup-1",
    supplier_code: "FR-2001",
    company_name: "Papeterie du Sud",
    contact_name: "Karim Tazi",
    email: "contact@papeteriedusud.ma",
    phone: "+212 522 334455",
    city: "Casablanca",
    country: "Maroc"
  }
];

let productsStore: Product[] = [
  {
    id: "prod-1",
    sku: "PRD-001",
    name: "Licence Logiciel ERP Pro",
    description: "Abonnement annuel ERP Fatourati",
    selling_price: 4500,
    quantity: 25,
    unit: "unité",
    category_name: "Services",
    track_inventory: true,
    is_active: true
  },
  {
    id: "prod-2",
    sku: "PRD-002",
    name: "Imprimante Thermique Ticket POS",
    description: "Imprimante POS USB/Ethernet 80mm",
    selling_price: 1200,
    quantity: 10,
    unit: "unité",
    category_name: "Matériel",
    track_inventory: true,
    is_active: true
  }
];

let quotationsStore: Quotation[] = [
  {
    id: "dev-1",
    quotation_number: "DEV-2024-001",
    client_name: "Atlas Tech SARL",
    status: "Envoyé",
    total_amount: 15700,
    date: "2024-08-01"
  },
  {
    id: "dev-2",
    quotation_number: "DEV-2024-002",
    client_name: "Maroc Import Expo",
    status: "Brouillon",
    total_amount: 4500,
    date: "2024-08-03"
  }
];

let invoicesStore: Invoice[] = [
  {
    id: "fac-1",
    invoice_number: "FAC-2024-001",
    client_name: "Atlas Tech SARL",
    status: "Payée",
    total_amount: 15700,
    date: "2024-07-28"
  }
];

let idCounter = 1;
const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}-${Math.random().toString(36).substring(2, 6)}`;

export const getCompanies = () => companiesStore;
export const addCompany = (c: Partial<Company>): Company => {
  const newComp: Company = {
    id: generateUniqueId("comp"),
    name: c.name || "Fawatir Enterprise",
    email: c.email || "contact@fawatir.ma"
  };
  companiesStore.push(newComp);
  return newComp;
};

export const getClients = () => clientsStore;
export const getClientById = (id: string) => clientsStore.find(c => c.id === id);
export const addClient = (cli: Partial<Client>): Client => {
  const newCli: Client = {
    id: generateUniqueId("cli"),
    customer_code: cli.customer_code || `CL-${Math.floor(1000 + Math.random() * 9000)}`,
    company_name: cli.company_name || "Client Sans Nom",
    contact_name: cli.contact_name || "",
    email: cli.email || "",
    phone: cli.phone || "",
    city: cli.city || "",
    country: cli.country || "Maroc",
    metadata: cli.metadata || {}
  };
  clientsStore.push(newCli);
  return newCli;
};
export const deleteClient = (id: string) => {
  clientsStore = clientsStore.filter(c => c.id !== id);
};
export const clearClients = () => { clientsStore = []; };

export const getSuppliers = () => suppliersStore;
export const getSupplierById = (id: string) => suppliersStore.find(s => s.id === id);
export const addSupplier = (sup: Partial<Supplier>): Supplier => {
  const newSup: Supplier = {
    id: generateUniqueId("sup"),
    supplier_code: sup.supplier_code || `FR-${Math.floor(1000 + Math.random() * 9000)}`,
    company_name: sup.company_name || "Fournisseur Sans Nom",
    contact_name: sup.contact_name || "",
    email: sup.email || "",
    phone: sup.phone || "",
    city: sup.city || "",
    country: sup.country || "Maroc",
    metadata: sup.metadata || {}
  };
  suppliersStore.push(newSup);
  return newSup;
};
export const deleteSupplier = (id: string) => {
  suppliersStore = suppliersStore.filter(s => s.id !== id);
};
export const clearSuppliers = () => { suppliersStore = []; };

export const getProducts = () => productsStore;
export const getProductById = (id: string) => productsStore.find(p => p.id === id);
export const addProduct = (p: Partial<Product>): Product => {
  const newProd: Product = {
    id: generateUniqueId("prod"),
    sku: p.sku || `PRD-${Math.floor(100 + Math.random() * 900)}`,
    name: p.name || "Nouveau Produit",
    description: p.description || "",
    selling_price: Number(p.selling_price) || 0,
    quantity: p.quantity !== undefined ? Number(p.quantity) : 10,
    unit: p.unit || "unité",
    category_name: p.category_name || "Général",
    track_inventory: p.track_inventory !== undefined ? p.track_inventory : true,
    is_active: p.is_active !== undefined ? p.is_active : true,
    metadata: p.metadata || {}
  };
  productsStore.push(newProd);
  return newProd;
};
export const deleteProduct = (id: string) => {
  productsStore = productsStore.filter(p => p.id !== id);
};
export const clearProducts = () => { productsStore = []; };

export const getQuotations = () => quotationsStore;
export const getQuotationById = (id: string) => quotationsStore.find(q => q.id === id);
export const addQuotation = (q: Partial<Quotation>): Quotation => {
  const newQ: Quotation = {
    id: generateUniqueId("dev"),
    quotation_number: q.quotation_number || `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
    client_name: q.client_name || "Client",
    status: q.status || "Brouillon",
    total_amount: Number(q.total_amount) || 0,
    date: new Date().toISOString().split("T")[0]
  };
  quotationsStore.push(newQ);
  return newQ;
};
export const deleteQuotation = (id: string) => {
  quotationsStore = quotationsStore.filter(q => q.id !== id);
};
export const clearQuotations = () => { quotationsStore = []; };

export const getInvoices = () => invoicesStore;
export const getInvoiceById = (id: string) => invoicesStore.find(i => i.id === id);
export const addInvoice = (inv: Partial<Invoice>): Invoice => {
  const newInv: Invoice = {
    id: generateUniqueId("fac"),
    invoice_number: inv.invoice_number || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
    client_name: inv.client_name || "Client",
    status: inv.status || "Brouillon",
    total_amount: Number(inv.total_amount) || 0,
    date: new Date().toISOString().split("T")[0]
  };
  invoicesStore.push(newInv);
  return newInv;
};
export const deleteInvoice = (id: string) => {
  invoicesStore = invoicesStore.filter(i => i.id !== id);
};
export const clearInvoices = () => { invoicesStore = []; };

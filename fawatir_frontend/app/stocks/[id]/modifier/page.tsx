import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { produitsList } from "@/lib/mock-data";

export default function ModifierProduitPage({ params }: { params: { id: string } }) {
  const produit = produitsList.find((p) => p.id === params.id);
  if (!produit) notFound();

  return <ProductForm mode="edit" produit={produit} />;
}

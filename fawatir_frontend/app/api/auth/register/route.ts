import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, nom, company } = body;

    if (email && password) {
      return NextResponse.json({
        user: {
          id: 2,
          email: email,
          nom: nom || "Nouvel Utilisateur",
          role: "admin",
          company: company || "Ma Super Entreprise",
        },
        access: "mock_access_token_signup",
        refresh: "mock_refresh_token_signup",
      });
    }

    return NextResponse.json(
      { error: "Veuillez remplir tous les champs" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}

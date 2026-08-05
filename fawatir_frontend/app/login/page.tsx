"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchAPI("api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      const data = await res.json();
      login(data.user, data.access, data.refresh);
      router.push("/");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6">Connexion</h1>

        <label className="block mb-2 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          required
        />

        <label className="block mb-2 text-sm">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          required
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg p-2"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-sm text-center mt-4 text-gray-500">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-black font-medium underline">
            Créer un compte
          </a>
        </p>
      </form>
    </div>
  );
}
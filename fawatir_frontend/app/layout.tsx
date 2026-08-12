// Inside layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-white text-black min-h-screen">
        {/* Temporarily commented everything else out */}
        {children}
      </body>
    </html>
  );
}

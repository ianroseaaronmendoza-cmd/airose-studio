// src/components/RootLayout.tsx
import React from "react";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <Header />
      <main className="min-h-screen p-6">{children}</main>
    </div>
  );
}

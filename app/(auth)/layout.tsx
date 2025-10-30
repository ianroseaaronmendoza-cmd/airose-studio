// app/(auth)/layout.tsx
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A minimal layout used only by pages inside (auth)
  return (
    <html lang="en">
      <body className="bg-black text-white flex items-center justify-center min-h-screen">
        {children}
      </body>
    </html>
  );
}


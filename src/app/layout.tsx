import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skillvee - Practice Real Developer Scenarios",
  description: "Assess and improve your developer skills through realistic work simulations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

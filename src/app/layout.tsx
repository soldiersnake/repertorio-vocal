import type { Metadata, Viewport } from "next";
import "@fontsource/gloock/400.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repertorio Vocal",
  description:
    "Repertorio para cantantes líricos: piezas, estado de estudio, tesitura y ensayos.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-bg text-fg font-sans">{children}</body>
    </html>
  );
}

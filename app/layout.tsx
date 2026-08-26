import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teel Mountain HOA | North Georgia Living",
  description: "A welcoming mountain community in Blue Ridge, Georgia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

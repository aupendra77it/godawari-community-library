import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Godawari Community Library | Resource Center",
  description: "Godawari Community Library Resource Center, Badikhel, Lalitpur",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ne"><body>{children}</body></html>;
}

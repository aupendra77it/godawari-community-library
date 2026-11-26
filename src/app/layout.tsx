import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "गोदावरी सामुदायिक पुस्तकालय स्रोत केन्द्र | Godawari Community Library Resource Center",
  description: "गोदावरी नगरपालिका–४, बडिखेल, ललितपुर | स्थापना: २०७४",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ne"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import "./additions.css";
import ThemeInitializer from "@/components/ThemeInitializer";

export const metadata: Metadata = {
  title: "SafeRoute Sri Lanka | Disaster-Aware Route Intelligence",
  description: "Explore route alternatives, verified-source weather advisories, and transparent disaster-risk demos for Sri Lanka.",
  applicationName: "SafeRoute Sri Lanka",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeInitializer/>{children}</body></html>;
}

import type { Metadata } from "next";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insighta Labs+ Portal",
  description: "Secure profile intelligence web portal for analysts and admins."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

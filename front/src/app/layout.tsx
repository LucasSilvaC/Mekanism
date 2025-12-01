import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../styles/globals.css";

const poppinsSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], 
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mekanism",
  icons: {
    icon: "/mekanism.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppinsSans.variable}>
      <body className={poppinsSans.variable}>
        {children}
      </body>
    </html>
  );
}

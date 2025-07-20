import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; 
import { BottomNav } from "@/components/navbar/Navbar"; // Assuming this is your BottomNav
import Providers from "@/components/Providers"; // Keep your existing Providers
import "./globals.css";
import { Toaster, toast } from 'sonner'; // Import Toaster AND toast for toast messages
import  CreateEntryDialogWrapper from "@/components/AddEntry/AddEntryWarpper"
import NavbarWrapper from "@/components/navbar/NavbarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wellbeing Tracker", // Updated title for clarity
  description: "Track your sleep and daily wellbeing.", // Updated description
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mb-20`}
      >
        <Providers> {/* Keep your existing Providers */}
          <main className="mx-0 my-0 md:mt-[3%] md:mr-[25%] md:mb-[5%] md:ml-[25%]">
            {children}
          </main>
          {/* Render the global dialog here */}
          <CreateEntryDialogWrapper />
          <NavbarWrapper />
          <Toaster /> 
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { fontManrope, fontMontserrat } from "@/themes/font";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "GPR Prediction",
  description: "GPR Prediction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          fontManrope.className,
          "bg-background antialiased relative w-screen h-screen"
        )}
      >
        <div className="absolute z-10">{children}</div>
        <img
          alt="Abstract background"
          className="absolute inset-0 h-full w-full object-cover z-0"
          height="768"
          src="/images/background/wave.png"
          style={{
            aspectRatio: "691/768",
            objectFit: "cover",
          }}
          width="691"
        />
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Load Inter font with all necessary weights and styles
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "First Choice Banking",
  description: "Your trusted online banking solution",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f0f5' },
    { media: '(prefers-color-scheme: dark)', color: '#031d44' },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full bg-gradient-to-br from-[#031d44] to-[#04395e]`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans antialiased text-[#031d44] dark:text-[#f7f0f5] bg-[#f7f0f5] dark:bg-gradient-to-br dark:from-[#031d44] dark:to-[#04395e] min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

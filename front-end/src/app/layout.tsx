import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from './components/Header';
import Footer from './components/Footer';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Wahana Ritelindo Ciputat",
  description: "Wahana Ritelindo employee attendance system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Wahana Ritelindo Ciputat</title>
        <meta name="description" content="Wahana Ritelindo employee attendance system" />
        <link rel="icon" href="/icon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: '#d6d6d6',
        }}
      >
        <Header />
        <div
           style={{
            transform: 'scale(0.80)',          
            margin: '0 auto',
            padding: '20px',
          }}
        >
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

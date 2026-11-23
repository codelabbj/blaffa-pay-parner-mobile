import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider, LanguageProvider, AuthProvider } from "@/lib/contexts"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Blaffa Pay · Partners",
  description: "Espace partenaire Blaffa Pay — dépôts, retraits, transferts et MobCash",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${plusJakarta.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Mobile back button handler
              (function() {
                let isHandlingBackButton = false;
                
                function handleBackButton() {
                  if (isHandlingBackButton) return;
                  isHandlingBackButton = true;
                  
                  console.log('Hardware back button pressed');
                  
                  // Dispatch custom event for React to handle
                  window.dispatchEvent(new CustomEvent('mobileBackButton'));
                  
                  setTimeout(() => {
                    isHandlingBackButton = false;
                  }, 300);
                }
                
                // Listen for various back button events
                document.addEventListener('backbutton', function(e) {
                  console.log('Document backbutton event');
                  e.preventDefault();
                  handleBackButton();
                }, false);
                
                window.addEventListener('backbutton', function(e) {
                  console.log('Window backbutton event');
                  e.preventDefault();
                  handleBackButton();
                }, false);
                
                // Listen for browser back button
                window.addEventListener('popstate', function(e) {
                  console.log('Popstate event');
                  e.preventDefault();
                  handleBackButton();
                });
                
                // Initialize history state
                if (window.history.state === null) {
                  window.history.replaceState({screen: 'app'}, '', window.location.href);
                }
                
                console.log('Mobile back button script loaded');
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientOnly from "@/components/ClientOnly";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "SentiCare Monitoring System",
  description: "Advanced Hospital Patient Monitoring and Alert Management System",
  keywords: "hospital, monitoring, patient, alerts, healthcare, medical",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50">
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
            <ClientOnly>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </ClientOnly>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

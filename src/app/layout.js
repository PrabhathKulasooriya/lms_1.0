import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/Navbar";
import { AuthProvider } from "./Provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LMS",
  description: "LMS for O/L's",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen min-w-screen flex flex-col bg-background justify-center items-center ">
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

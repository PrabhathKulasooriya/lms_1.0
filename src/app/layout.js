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
  title: "NexLearn",
  description:
    "Boost your O/L exam results with NexLearn. Access past papers, interactive lessons, and expert guidance for Sri Lankan Ordinary Level students.",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: [
    "O/L LMS",
    "Sri Lanka O/L exams",
    "O/L past papers",
    "online learning O/L",
    "Ordinary Level study materials",
    "O/L commerce",
    
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen min-w-screen flex flex-col bg-white justify-center items-center ">
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />
          <main id="main-scroll" className="flex-1 w-full overflow-y-auto">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

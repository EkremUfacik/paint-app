import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sayıya Göre Boyama Uygulaması",
  description: "Çocuklar için eğlenceli boyama aktivitesi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen bg-gray-100`}>
        <header className="bg-red-500 text-white shadow-md">
          <div className="container mx-auto py-4 px-4">
            <nav className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold">
                Boyama
              </a>
              <div className="space-x-4">
                <a href="/" className="hover:underline">
                  Ana Sayfa
                </a>
                <a href="/svg-boyama" className="hover:underline">
                  SVG Boyama
                </a>
              </div>
            </nav>
          </div>
        </header>

        {children}

        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>
              &copy; {new Date().getFullYear()} Sayıya Göre Boyama Uygulaması
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

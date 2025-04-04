import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Çocuklar İçin Sayıya Göre Boyama
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link
          href="/svg-boyama"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-3 text-red-500">SVG Boyama</h2>
          <p className="text-gray-700 mb-4">
            SVG formatındaki resimlerle sayıya göre boyama yapmak için tıklayın.
          </p>
          <div className="bg-red-100 p-4 rounded-lg text-center">
            <span className="font-medium text-red-500">Zürafa</span>
          </div>
        </Link>

        {/* Buraya daha fazla boyama seçeneği eklenebilir */}
      </div>

      <div className="mt-12 max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Sayıya Göre Boyama Nedir?
        </h2>
        <p className="text-gray-700 mb-4">
          Sayıya göre boyama, her bir alanın belirli bir renkle boyanması
          gereken eğlenceli bir aktivitedir. Her alana atanmış bir numara vardır
          ve her numara belirli bir rengi temsil eder. Doğru renkleri kullanarak
          resmi tamamlayabilirsiniz!
        </p>
        <p className="text-gray-700">
          Bu uygulama çocukların hem eğlenmesine hem de renk-sayı ilişkisini
          öğrenmesine yardımcı olur. İster bilgisayarda ister mobil cihazda
          çalışır ve tamamlanan resimleri indirip paylaşabilirsiniz!
        </p>
      </div>
    </main>
  );
}

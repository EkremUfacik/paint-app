import { useState } from "react";
import SVGColoringCanvas from "./components/SVGColoringCanvas";
import PageSelector from "./components/PageSelector";
import SVGPreparation from "./utils/SVGPreparation";

type Page = {
  id: string;
  title: string;
  src: string;
};

const COLORING_PAGES: Page[] = [
  {
    id: "giraffe",
    title: "Zürafa",
    src: "/images/giraffe.svg",
  },
  {
    id: "bird2",
    title: "Kuş 2",
    src: "/images/bird2-processed.svg",
  },
  // More pages can be added here as they become available
];

const App = () => {
  const [currentPageId, setCurrentPageId] = useState(COLORING_PAGES[0].id);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSVGPreparation, setShowSVGPreparation] = useState(false);

  // Yüklenen SVG'yi doğrudan kullanmak için yeni state'ler
  const [uploadedSVG, setUploadedSVG] = useState<string | null>(null);
  const [uploadedSVGTitle, setUploadedSVGTitle] =
    useState<string>("Yüklenen Resim");
  const [isCustomSVG, setIsCustomSVG] = useState<boolean>(false);
  const [customPalette, setCustomPalette] = useState<string[] | undefined>(
    undefined
  );

  // SVG Hazırlama aracından işlenmiş SVG'yi almak için handler
  const handleProcessedSVG = (
    svgContent: string,
    fileName: string,
    extractedColors: string[]
  ) => {
    console.log("İşlenmiş SVG alındı, çıkarılan renkler:", extractedColors);
    setUploadedSVG(svgContent);
    setUploadedSVGTitle(
      fileName.replace(/\.[^/.]+$/, "").replace(/-processed$/, "") ||
        "Yüklenen Resim"
    );
    setIsCustomSVG(true);
    setShowSVGPreparation(false); // Hazırlama aracını kapat

    // Çıkarılan renkleri palette olarak ayarla
    if (extractedColors && extractedColors.length > 0) {
      setCustomPalette(extractedColors);
    } else {
      setCustomPalette(undefined); // Varsayılan palette kullanılacak
    }
  };

  const currentPage =
    COLORING_PAGES.find((page) => page.id === currentPageId) ||
    COLORING_PAGES[0];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            Sayıya Göre Boyama
          </h1>
          <p className="text-gray-600">
            Renkli düğmelere tıklayarak ve ardından resmin üzerindeki bölgelere
            tıklayarak boyanabilir.
          </p>
          <div className="mt-4">
            <button
              onClick={() => setShowSVGPreparation(!showSVGPreparation)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showSVGPreparation
                ? "Boyama Sayfasına Dön"
                : "SVG Hazırlama Aracı"}
            </button>

            {isCustomSVG && (
              <button
                onClick={() => {
                  setIsCustomSVG(false); // Özel SVG modunu kapat
                  setUploadedSVG(null); // Yüklenen SVG'yi temizle
                  setCustomPalette(undefined); // Palette'i sıfırla
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ml-2"
              >
                Hazır Resimlere Dön
              </button>
            )}
          </div>
        </header>

        {showSVGPreparation ? (
          <SVGPreparation onSVGProcessed={handleProcessedSVG} />
        ) : (
          <>
            {showInstructions && (
              <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
                  <h2 className="text-xl font-bold">Nasıl Kullanılır?</h2>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="text-white hover:text-blue-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <span className="text-blue-500 text-2xl font-bold">
                          1
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">Renk Seç</h3>
                      <p className="text-gray-600 text-center">
                        Aşağıdaki renkli düğmelerden birini seçin.
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <span className="text-blue-500 text-2xl font-bold">
                          2
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        Alanı Tıkla
                      </h3>
                      <p className="text-gray-600 text-center">
                        Seçtiğiniz rengin numarasına karşılık gelen alanı
                        tıklayın.
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <span className="text-blue-500 text-2xl font-bold">
                          3
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2">
                        Kaydet & Paylaş
                      </h3>
                      <p className="text-gray-600 text-center">
                        Bittiğinde resmi indirebilir veya sosyal medyada
                        paylaşabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isCustomSVG && COLORING_PAGES.length > 1 && (
              <div className="max-w-md mx-auto mb-6">
                <PageSelector
                  pages={COLORING_PAGES}
                  currentPageId={currentPageId}
                  onPageChange={setCurrentPageId}
                />
              </div>
            )}

            {isCustomSVG && uploadedSVG ? (
              <SVGColoringCanvas
                svgContent={uploadedSVG}
                title={uploadedSVGTitle}
                palette={customPalette}
              />
            ) : (
              <SVGColoringCanvas
                svgSrc={currentPage.src}
                title={currentPage.title}
              />
            )}
          </>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2023 Sayıya Göre Boyama Uygulaması</p>
        </footer>
      </div>
    </div>
  );
};

export default App;

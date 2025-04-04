import { useState, useRef, useEffect } from "react";
import ShareButtons from "./ShareButtons";

interface SVGColoringCanvasProps {
  svgSrc?: string;
  svgContent?: string;
  title?: string;
  palette?: string[];
}

const DEFAULT_PALETTE = [
  "#196F3D", // Green
  "#7FBA00", // Light Green
  "#3498DB", // Blue
  "#C0392B", // Red
  "#FF5733", // Orange
  "#F1C40F", // Yellow
  "#1F3A93", // Dark Blue
  "#9B59B6", // Purple
  "#5D6D7E", // Gray
  "#935116", // Brown
];

const SVGColoringCanvas = ({
  svgSrc,
  svgContent: initialSvgContent,
  title = "Sayıya Göre Boya",
  palette = DEFAULT_PALETTE,
}: SVGColoringCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(
    initialSvgContent || null
  );
  const [pathNumbers, setPathNumbers] = useState<Record<string, number>>({});
  const [customPalette, setCustomPalette] = useState<string[]>(palette);
  const [coloredPaths, setColoredPaths] = useState<Record<string, string>>({});

  // Palette değiştiğinde, customPalette'i güncelle
  useEffect(() => {
    console.log("Palette değişti:", palette);
    setCustomPalette(palette);
  }, [palette]);

  // Load the SVG content
  useEffect(() => {
    if (initialSvgContent) {
      // Doğrudan içerik sağlandıysa, hemen kullan
      setSvgContent(initialSvgContent);
      setIsLoading(false);
      return;
    }

    if (!svgSrc) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    fetch(svgSrc)
      .then((response) => response.text())
      .then((text) => {
        setSvgContent(text);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading SVG:", error);
        setIsLoading(false);
      });
  }, [svgSrc, initialSvgContent]);

  // Process SVG to assign numbers to paths - SVG yapısını dolgu için düzenleyelim
  useEffect(() => {
    if (!svgContent || !svgRef.current) return;

    console.log("SVG İşleniyor - Referans:", svgRef.current);

    const paths = svgRef.current.querySelectorAll("path");
    console.log(`Bulunan toplam path sayısı: ${paths.length}`);

    // SVG'nin kendisine pointer-events özelliği ekle
    svgRef.current.style.pointerEvents = "auto";

    const newPathNumbers: Record<string, number> = {};
    const uniqueColors: string[] = [];

    paths.forEach((path, index) => {
      // ID ataması
      const origId = path.getAttribute("id");
      const id = origId || `path-${index}`;

      if (!origId) {
        console.log(`Path #${index} için ID yok, atanıyor: ${id}`);
        path.setAttribute("id", id);
      }

      // Path bilgilerini logla
      console.log(
        `Path #${index}: ID=${id}, d=${path
          .getAttribute("d")
          ?.substring(0, 20)}...`
      );

      // Orijinal rengi al
      const dataColor = path.getAttribute("data-color");

      // Orijinal class bilgisini logla
      const originalClass = path.getAttribute("data-original-class");
      if (originalClass) {
        console.log(`Path #${index}: Orijinal Class=${originalClass}`);
      }

      if (dataColor && !uniqueColors.includes(dataColor)) {
        uniqueColors.push(dataColor);
      }

      // ÖNEMLİ: İç dolgu için ayarlar
      path.setAttribute("fill", "none"); // Başlangıçta dolgu yok
      path.setAttribute("fill-rule", "evenodd"); // Dolgu kuralı
      path.setAttribute("stroke", "#000"); // Siyah kenarlık
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-linejoin", "round"); // Köşeleri yuvarla
      path.style.cursor = "pointer";

      // ÖNEMLİ: Tıklanabilir olması için pointer-events özelliğini ayarla
      path.style.pointerEvents = "auto";
    });

    // Benzersiz renklerden oluşan paletimizi oluştur
    if (uniqueColors.length > 0) {
      console.log("Özgün renkler bulundu:", uniqueColors);

      // SVG'den çıkarılan renklerle custom palette oluştur
      // Eğer dışarıdan bir palette sağlanmadıysa
      if (palette === DEFAULT_PALETTE) {
        console.log(
          "Varsayılan palette kullanılıyor, SVG'den renkleri alıyoruz"
        );
        setCustomPalette(uniqueColors);
      } else {
        console.log("Dışarıdan sağlanan palette kullanılıyor:", palette);
      }
    }

    setPathNumbers(newPathNumbers);
    console.log("Path renk numaraları:", newPathNumbers);
  }, [svgContent, palette]);

  // SVG container ve wrapper için stil değişikliği
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.position = "relative";
      containerRef.current.style.zIndex = "10";
    }
  }, []);

  // Yeni tek useEffect - hem vurgulama hem koruma yapıyor
  useEffect(() => {
    if (!svgRef.current) return;

    const paths = svgRef.current.querySelectorAll("path");
    const svgContainer = svgRef.current;

    // Her durumda tüm path'leri uygun stile getir
    paths.forEach((path) => {
      const pathId = path.id || "";
      const dataColorValue = path.getAttribute("data-color");
      const isColored = coloredPaths[pathId] !== undefined;

      // Eğer bir renk seçiliyse ve path'in orijinal rengi o renk ise, vurgula
      if (
        selectedColorIndex !== null &&
        dataColorValue === customPalette[selectedColorIndex]
      ) {
        if (isColored) {
          // Boyalı alan - vurgula ama rengini koru
          path.setAttribute("fill", coloredPaths[pathId]);
          path.setAttribute("fill-opacity", "1");
        } else {
          // Boyanmamış alan - sarı dolgu ile vurgula
          path.setAttribute("fill", "rgba(255, 255, 0, 0.3)");
        }

        // Her iki durumda da turuncu kenarlık
        path.setAttribute("stroke", "#FF9500");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-dasharray", "3,3");

        // Etiket ekle
        if (svgContainer) {
          // Renk numarasını path üzerine göster
          const bbox = path.getBBox();

          // Mevcut numara etiketlerini temizle
          const existingLabel = svgContainer.querySelector(`#label-${pathId}`);
          if (existingLabel) {
            existingLabel.remove();
          }

          // Yeni etiket oluştur
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("id", `label-${pathId}`);
          text.setAttribute("x", String(bbox.x + bbox.width / 2));
          text.setAttribute("y", String(bbox.y + bbox.height / 2));
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "middle");
          text.setAttribute("font-size", "14");
          text.setAttribute("font-weight", "bold");
          text.setAttribute("fill", "black");
          text.setAttribute("stroke", "white");
          text.setAttribute("stroke-width", "0.5");
          text.setAttribute("pointer-events", "none");
          text.setAttribute("class", "color-label");
          text.textContent = isColored ? "✓" : String(selectedColorIndex + 1);

          svgContainer.appendChild(text);
        }
      } else {
        // İlgili renk için değil veya hiç renk seçili değil

        if (isColored) {
          // Daha önce boyanmışsa, boyalı durumunu koru
          path.setAttribute("fill", coloredPaths[pathId]);
          path.setAttribute("fill-opacity", "1");
          path.setAttribute("stroke", "#333");
        } else {
          // Boyanmamışsa varsayılan stile getir
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", "#000");
        }

        // Her iki durumda da standart kenarlık stili
        path.setAttribute("stroke-width", "1");
        path.setAttribute("stroke-dasharray", "none");

        // Etiketleri temizle
        if (svgContainer && pathId) {
          const label = svgContainer.querySelector(`#label-${pathId}`);
          if (label) {
            label.remove();
          }
        }
      }
    });
  }, [selectedColorIndex, customPalette, coloredPaths]);

  const handleColorSelect = (color: string, index: number) => {
    if (selectedColor === color) {
      // Aynı rengi tekrar tıkladığında, seçimi kaldırıyoruz
      setSelectedColor(null);
      setSelectedColorIndex(null);

      // Seçim kaldırıldığında tüm boyalı alanları koruma
      if (svgRef.current) {
        const paths = svgRef.current.querySelectorAll("path");
        paths.forEach((path) => {
          const pathId = path.id || "";

          // Eğer path daha önce boyanmışsa, boyasını koru
          if (coloredPaths[pathId]) {
            path.setAttribute("fill", coloredPaths[pathId]);
            path.setAttribute("fill-opacity", "1");
            path.setAttribute("stroke", "#333");
            path.setAttribute("stroke-width", "1");
            path.setAttribute("stroke-dasharray", "none");
          } else {
            // Boyanmamış olanları varsayılana döndür
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "#000");
            path.setAttribute("stroke-width", "1");
            path.setAttribute("stroke-dasharray", "none");
          }

          // Etiketleri kaldır
          const svgContainer = svgRef.current;
          if (svgContainer && pathId) {
            const label = svgContainer.querySelector(`#label-${pathId}`);
            if (label) {
              label.remove();
            }
          }
        });
      }
    } else {
      // Yeni bir renk seçtiğinde
      setSelectedColor(color);
      setSelectedColorIndex(index);
    }
  };

  // Tamamen yeni handlePathClick fonksiyonu
  const handlePathClick = (pathId: string) => {
    console.log(`handlePathClick çağrıldı: pathId=${pathId}`);

    if (!selectedColor) {
      console.log("Renk seçilmedi, işlem iptal");
      return;
    }

    if (!svgRef.current) {
      console.log("SVG referansı yok, işlem iptal");
      return;
    }

    // Path'i bul
    const path = svgRef.current.querySelector(`#${pathId}`) as SVGPathElement;
    if (!path) {
      console.error(`ID=${pathId} olan path bulunamadı!`);
      return;
    }

    // Path'in data-color değerini oku
    const pathOriginalColor = path.getAttribute("data-color");

    // Orijinal class bilgisini al (SVG Hazırlama Aracından gelecek)
    const originalClass = path.getAttribute("data-original-class");

    console.log(
      `Path bilgileri: ID=${pathId}, data-color=${pathOriginalColor}, data-original-class=${originalClass}, selectedColorIndex=${selectedColorIndex}, customPalette=`,
      customPalette
    );

    // Seçilen rengin paletteki renk ile eşleşip eşleşmediğini kontrol et
    if (
      selectedColorIndex !== null &&
      pathOriginalColor === customPalette[selectedColorIndex]
    ) {
      console.log(
        `Renk eşleşmesi bulundu! Orijinal renk: ${pathOriginalColor}, Seçilen: ${selectedColor}, Palette: ${customPalette[selectedColorIndex]}`
      );

      // Path'i boya
      path.setAttribute("fill", pathOriginalColor);
      path.setAttribute("fill-opacity", "1");
      path.setAttribute("stroke", "#333");
      path.setAttribute("stroke-width", "1");

      // Boyanan alanın durumunu state'e kaydet - ÖNEMLİ
      setColoredPaths((prev) => ({
        ...prev,
        [pathId]: pathOriginalColor,
      }));

      setHasChanges(true);
    } else {
      console.log(
        `Renk eşleşmesi bulunamadı: path=${pathOriginalColor}, seçilen indeks=${selectedColorIndex}, seçilen renk=${selectedColor}, customPalette=`,
        customPalette
      );
    }
  };

  const handleReset = () => {
    setHasChanges(false);
    setShareImageUrl(null);
    // Boyanmış alanların durumunu sıfırla
    setColoredPaths({});

    // Reset all path fills
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("fill", "none");
        path.setAttribute("fill-opacity", "1");
      });
    }
  };

  const handleDownload = () => {
    if (!svgRef.current || !containerRef.current) return;

    try {
      // Create a copy of the SVG element
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;

      // Convert SVG to a data URL
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions
      const svgSize = svgRef.current.getBoundingClientRect();
      canvas.width = svgSize.width;
      canvas.height = svgSize.height;

      // Create an image from the SVG
      const img = new Image();
      img.src = svgUrl;

      img.onload = () => {
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to PNG
        const pngUrl = canvas.toDataURL("image/png");

        // Set for sharing
        setShareImageUrl(pngUrl);

        // Create download link
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${title
          .toLowerCase()
          .replace(/\s+/g, "-")}-boyama.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(svgUrl);
      };
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handlePrepareShare = () => {
    if (!svgRef.current) return;

    try {
      // Create a data URL from the SVG
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      setShareImageUrl(url);
    } catch (error) {
      console.error("Error preparing share:", error);
    }
  };

  // Renk numaralarını ve önerilen kalıcı olarak göstermek için eklenen fonksiyon
  const renderColorGuide = () => {
    // SVG içindeki orijinal renklerden kılavuz oluştur
    return (
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Boyama Kılavuzu
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {customPalette.map((color, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm font-medium">Renk {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="p-4 bg-red-500 text-white">
          <h2 className="text-2xl font-bold text-center">{title}</h2>
        </div>

        <div className="relative border-t border-gray-200">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700">Yükleniyor...</p>
            </div>
          )}

          <div
            className="w-full"
            style={{ maxHeight: "600px", overflow: "auto" }}
          >
            <div className="svg-wrapper relative">
              <div
                ref={containerRef}
                style={{ width: "100%", height: "auto", position: "relative" }}
              >
                {/* Gerçek SVG kodu (dangerouslySetInnerHTML yerine doğrudan JSX olarak) */}
                {!isLoading && svgContent && (
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1024 1536"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-auto"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      // SVG içindeki tıklamalarda event target'ı doğrudan al
                      const target = e.target as SVGElement;
                      console.log("Tıklanan element:", target.tagName);

                      // Eğer path ise, ID'sini al ve handlePathClick'i çağır
                      if (target.tagName.toLowerCase() === "path") {
                        const pathId = target.getAttribute("id");
                        if (pathId) {
                          console.log("Path tıklandı, ID:", pathId);
                          handlePathClick(pathId);
                        }
                      }
                    }}
                  >
                    {/* SVG içeriğini innerHTML yerine dangerouslySetInnerHTML ile ekle */}
                    <g dangerouslySetInnerHTML={{ __html: svgContent }} />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Renk Kılavuzu - SVG yüklendiğinde göster */}
          {!isLoading &&
            Object.keys(pathNumbers).length > 0 &&
            renderColorGuide()}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-center text-gray-700 mb-4">
            {selectedColorIndex !== null
              ? `Şimdi ${
                  selectedColorIndex + 1
                } numaralı alanları boyayabilirsiniz`
              : "Lütfen aşağıdan bir renk seçin"}
          </p>

          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {customPalette.map((color, index) => (
              <button
                key={index}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                  selectedColor === color
                    ? "ring-4 ring-blue-500 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color, index)}
                aria-label={`Renk ${index + 1}`}
              >
                <span className="text-white text-xl font-bold drop-shadow-md">
                  {index + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md"
              onClick={handleReset}
              disabled={isLoading}
            >
              Sıfırla
            </button>

            <button
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-md"
              onClick={handleDownload}
              disabled={isLoading || !hasChanges}
            >
              İndir
            </button>

            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
              onClick={handlePrepareShare}
              disabled={isLoading || !hasChanges}
            >
              Paylaş
            </button>
          </div>

          {shareImageUrl && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-center text-gray-700 font-medium mb-2">
                Resmi Paylaş
              </h3>
              <ShareButtons imageUrl={shareImageUrl} title={title} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SVGColoringCanvas;

import React, { useState, useRef } from "react";

interface SVGPreparationProps {
  onSVGProcessed?: (
    svgContent: string,
    fileName: string,
    extractedColors: string[]
  ) => void;
}

/**
 * SVG Hazırlama Aracı
 * Bu bileşen, geliştirme sırasında SVG dosyalarını hazırlamak için kullanılabilir.
 * SVG'deki her path'e id ve data-color ekler.
 * Ayrıca renkli SVG'yi boyama uygulaması için uygun olan siyah-beyaz formata dönüştürür.
 */
const SVGPreparation: React.FC<SVGPreparationProps> = ({ onSVGProcessed }) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [processedSvg, setProcessedSvg] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Orijinal dosya adını kaydet
    setOriginalFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSvgContent(content);
      setStatus("SVG yüklendi. İşlemek için Hazırla butonuna tıklayın.");
    };
    reader.readAsText(file);
  };

  // Hex, rgb veya sınıf adından rengi çıkarmaya çalış
  const extractColorFromElement = (element: Element): string | null => {
    // Doğrudan fill özniteliğini kontrol et
    let fill = element.getAttribute("fill");
    // Orjinal sınıf adını sakla
    const className = element.getAttribute("class");

    // Fill özniteliği yoksa, style içinde fill kontrolü yap
    if (!fill || fill === "none") {
      const style = element.getAttribute("style");
      if (style) {
        const fillMatch = style.match(/fill:\s*([^;]+)/);
        if (fillMatch && fillMatch[1]) {
          fill = fillMatch[1].trim();
        }
      }
    }

    // SVG'deki class/style içindeki renkleri almak için daha gelişmiş kontroller
    // Sınıf adından rengi çıkarmaya çalış (SVG'nin defs içinde tanımlanmış olan stil dosyalarından)
    if ((!fill || fill === "none") && className) {
      // bird2.svg ve benzer formatlı dosyalar için özelleştirilmiş kod
      // CSS sınıf adlarını algıla (cls-1, cls-2, vb.)
      const svgElement = element.ownerDocument.documentElement;
      const styles = svgElement.getElementsByTagName("style");

      if (styles.length > 0) {
        const styleContent = styles[0].textContent || "";

        // Sınıf tam adı yerine, cls- ile başlayan ve bir sayı ile devam eden formatı algıla
        const classMatch = className.match(/cls-(\d+)/);
        if (classMatch) {
          const classNumber = classMatch[0]; // cls-14 gibi
          const classRegex = new RegExp(
            `\\.${classNumber}\\s*{[^}]*fill:\\s*([^;\\s]+)`,
            "i"
          );
          const match = styleContent.match(classRegex);

          if (match && match[1]) {
            fill = match[1];
            // Renk değerini saklayalım, orijinal sınıf adını da koruyalım
            element.setAttribute("data-original-class", className);
          }
        }
      }
    }

    // Eğer hala renk bulunamadıysa, parent elementleri kontrol et
    if (!fill || fill === "none") {
      let parent = element.parentElement;
      while (parent && parent.tagName !== "svg") {
        const parentFill = parent.getAttribute("fill");
        if (parentFill && parentFill !== "none") {
          fill = parentFill;
          break;
        }
        parent = parent.parentElement;
      }
    }

    // Renk değerini normalize et (hex değerine dönüştür)
    if (fill) {
      // # ile başlayan hex kodlarını olduğu gibi bırak
      if (fill.startsWith("#")) {
        return fill;
      }

      // İsimlendirilen renkleri hex değerine çevir (örn: red, blue, vb.)
      try {
        const tempElement = document.createElement("div");
        tempElement.style.color = fill;
        document.body.appendChild(tempElement);
        const computedColor = getComputedStyle(tempElement).color;
        document.body.removeChild(tempElement);

        if (computedColor) {
          // rgb(r, g, b) formatını #rrggbb formatına dönüştür
          const rgbMatch = computedColor.match(
            /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/
          );
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
            const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
            const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
            return `#${r}${g}${b}`;
          }
          return computedColor;
        }
        return fill;
      } catch (e) {
        console.error("Renk dönüştürme hatası:", e);
        return fill;
      }
    }

    // DEBUG: Renk çıkarma işlemini konsola logla
    console.log(`Path class: ${className}, extracted color: ${fill}`);

    return fill;
  };

  const processSvg = () => {
    if (!svgContent) {
      setStatus("Lütfen önce bir SVG dosyası yükleyin.");
      return;
    }

    try {
      // SVG string'ini DOM'a çevir
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");

      // ÖNEMLİ: SVG'nin defs ve style etiketlerini koru
      // CSS sınıflarında tanımlanan renkler bu stil içinde bulunur
      // SVG'yi boyama uygulamasında kullanırken bu stil bilgisi sağlanmalı

      // Tüm path elementlerini bul
      const paths = svgDoc.querySelectorAll("path");

      if (paths.length === 0) {
        setStatus("SVG içinde path elementi bulunamadı.");
        return;
      }

      // Çıkarılan benzersiz renkleri sakla
      const uniqueColors: string[] = [];

      // Her path için benzersiz id ve renk bilgisi ata
      paths.forEach((path, index) => {
        const existingId = path.getAttribute("id");
        // Id yoksa ekle
        if (!existingId) {
          path.setAttribute("id", `area${index + 1}`);
        }

        // Orijinal rengi çıkar
        const originalColor = extractColorFromElement(path);
        if (originalColor && originalColor !== "none") {
          // Rengi data-color olarak sakla
          path.setAttribute("data-color", originalColor);

          // Benzersiz renkleri topla
          if (!uniqueColors.includes(originalColor)) {
            uniqueColors.push(originalColor);
          }
        } else {
          console.log(`Uyarı: Path #${index} için renk bulunamadı.`);
        }

        // Path'i boyama için hazırla - dolguyu kaldır, kenarlık ekle
        path.setAttribute("fill", "none");
        path.setAttribute("fill-rule", "evenodd");
        path.setAttribute("stroke", "#000");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("stroke-linejoin", "round");

        // Style özniteliğini temizle (stil çakışmalarını önlemek için)
        path.removeAttribute("style");

        // Class'ı koruyoruz ama data-original-class olarak saklıyoruz
        // ana class özniteliğini kaldırıyoruz çünkü boyama sırasında gerekmiyor
        if (path.hasAttribute("class")) {
          // data-original-class zaten extract fonksiyonunda eklendiyse tekrar eklemeyelim
          if (!path.hasAttribute("data-original-class")) {
            path.setAttribute(
              "data-original-class",
              path.getAttribute("class") || ""
            );
          }
          path.removeAttribute("class");
        }
      });

      // Çıkarılan renkleri state'e kaydet
      setExtractedColors(uniqueColors);

      // DOM'u string'e çevir
      const serializer = new XMLSerializer();
      const resultSvg = serializer.serializeToString(svgDoc);

      // SVG'nin stili kaldırılmadığını doğrula
      console.log(
        "Stil düğümleri sayısı:",
        svgDoc.querySelectorAll("style").length
      );

      setProcessedSvg(resultSvg);
      setStatus(
        `İşlem tamamlandı! ${paths.length} path işlendi ve ${uniqueColors.length} benzersiz renk bulundu. Sonucu indirebilirsiniz.`
      );

      // İşlenmiş SVG'yi ve çıkarılan renkleri App bileşenine aktar
      if (onSVGProcessed) {
        onSVGProcessed(resultSvg, originalFileName, uniqueColors);
      }
    } catch (error) {
      setStatus(
        `Hata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const downloadProcessedSvg = () => {
    if (!processedSvg) {
      setStatus(
        "İndirilecek işlenmiş SVG yok. Önce Hazırla butonuna tıklayın."
      );
      return;
    }

    const blob = new Blob([processedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Orijinal dosya adını kullan veya varsayılan ad ata
    let fileName = "processed-svg.svg";
    if (originalFileName) {
      const nameParts = originalFileName.split(".");
      // Dosya adının sonuna "-processed" ekle, uzantısını koru
      if (nameParts.length > 1) {
        nameParts[nameParts.length - 2] += "-processed";
        fileName = nameParts.join(".");
      } else {
        fileName = originalFileName + "-processed.svg";
      }
    }

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderPreview = () => {
    if (!processedSvg) return null;

    return (
      <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
        <div
          className="w-full bg-white shadow-inner border border-gray-300 rounded flex items-center justify-center p-4"
          style={{ minHeight: "300px" }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: processedSvg }}
            style={{
              maxWidth: "100%",
              maxHeight: "500px",
              overflow: "hidden",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">SVG Hazırlama Aracı</h1>
      <p className="mb-4 text-gray-700">
        Bu araç, renkli SVG dosyalarını boyama uygulaması için uygun hale
        getirir:
        <ul className="list-disc ml-6 mt-2">
          <li>Her path elementine benzersiz id ekler</li>
          <li>Orijinal renkleri data-color özniteliğinde saklar</li>
          <li>Tüm path'leri dolgu olmayan, siyah kenarlıklı hale getirir</li>
        </ul>
      </p>

      <div className="mb-6">
        <label className="block mb-2 font-medium">SVG Dosyası Seçin:</label>
        <input
          type="file"
          accept=".svg"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3 mb-2"
        />
        <button
          onClick={processSvg}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          disabled={!svgContent}
        >
          Hazırla
        </button>
        <button
          onClick={downloadProcessedSvg}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={!processedSvg}
        >
          İndir
        </button>

        {processedSvg && onSVGProcessed && (
          <button
            onClick={() =>
              onSVGProcessed(processedSvg, originalFileName, extractedColors)
            }
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Boyama Sayfasına Git
          </button>
        )}
      </div>

      {status && (
        <div className="p-3 mb-4 bg-gray-100 border rounded">
          <p className="font-medium">Durum:</p>
          <p>{status}</p>
        </div>
      )}

      {extractedColors.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Bulunan Renkler:</h2>
          <div className="flex flex-wrap gap-2">
            {extractedColors.map((color, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-6 h-6 mr-2 border border-gray-300"
                  style={{ backgroundColor: color }}
                ></div>
                <span>{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {processedSvg && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">İşlenmiş SVG Önizleme:</h2>
          {renderPreview()}
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">İşlenmiş SVG Kodu:</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs">{processedSvg}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SVGPreparation;

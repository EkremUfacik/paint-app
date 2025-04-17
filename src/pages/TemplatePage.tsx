import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SVGColoringCanvas from "@/components/SVGColoringCanvas";
import { SVG_TEMPLATES } from "@/data/svgTemplates";

const TemplatePage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [processedSvg, setProcessedSvg] = useState<string>("");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");

  // Seçilen şablonu bul ve SVG içeriğini yükle
  useEffect(() => {
    if (!templateId) return;

    // Şablon başlığını bul
    const template = SVG_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setTemplateTitle(template.title);
    }

    // SVG içeriğini yükle
    setIsLoading(true);
    fetch(`/images/${templateId}.svg`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("SVG yüklenemedi");
        }
        return response.text();
      })
      .then((data) => {
        setIsLoading(false);
        // SVG içeriği yüklendikten sonra otomatik olarak işle
        processSvg(data);
      })
      .catch((err) => {
        setError(`Hata: ${err.message}`);
        setIsLoading(false);
      });
  }, [templateId]);

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

    return fill;
  };

  // SVG'yi işleme fonksiyonu - SVGPreparation'dan tamamen uyarlanmıştır
  const processSvg = (svgString: string) => {
    try {
      // SVG'yi DOM olarak parse et
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");

      console.log("SVG işleniyor...");

      // SVG'nin defs ve style etiketlerini sayısını kontrol et - bu bilgi önemli
      const styleElements = svgDoc.querySelectorAll("style");
      console.log(`SVG'de ${styleElements.length} style etiketi bulundu.`);

      if (styleElements.length > 0) {
        console.log("Style içeriği:", styleElements[0].textContent);
      }

      // Tüm path elementlerini bul
      const paths = svgDoc.querySelectorAll("path");
      console.log(`SVG'de ${paths.length} path elementi bulundu.`);

      if (paths.length === 0) {
        setError("SVG içinde path elementi bulunamadı");
        return;
      }

      // Çıkarılan benzersiz renkleri sakla
      const uniqueColors: string[] = [];

      // Her path için işlem yap
      paths.forEach((path, index) => {
        // ID kontrolü
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

          // Debug için log
          console.log(`Path #${index} (${path.id}): Renk = ${originalColor}`);
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

      // SVG'nin stili kaldırılmadığını doğrula
      console.log(
        "İşlem sonrası style düğümleri sayısı:",
        svgDoc.querySelectorAll("style").length
      );

      // İşlenmiş SVG'yi string'e çevir
      const serializer = new XMLSerializer();
      const result = serializer.serializeToString(svgDoc);

      console.log(
        `İşlenmiş SVG için çıkarılan benzersiz ${uniqueColors.length} renk:`,
        uniqueColors
      );

      // State'i güncelle
      setProcessedSvg(result);
      setExtractedColors(uniqueColors);
      setIsProcessed(true);
    } catch (error) {
      setError(`SVG işlenirken hata oluştu: ${error}`);
      console.error("SVG işleme hatası:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-md text-gray-600">
        Şablon yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-md text-primary">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-light min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-8">
        {templateTitle} Boyama
      </h1>

      {isProcessed ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <SVGColoringCanvas
            svgContent={processedSvg}
            title={templateTitle}
            palette={extractedColors.length > 0 ? extractedColors : undefined}
          />
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-lg shadow-md">
          <p className="text-secondary text-lg">Şablon hazırlanıyor...</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-block bg-secondary text-white py-3 px-6 rounded font-medium hover:bg-accent2 transition-colors duration-200"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default TemplatePage;

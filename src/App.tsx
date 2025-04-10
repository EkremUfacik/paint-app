import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import SVGPreparation from "./utils/SVGPreparation";
import SVGColoringCanvas from "./components/SVGColoringCanvas";
import "./App.css";

// SVG şablonlarının listesi
const SVG_TEMPLATES = [
  { id: "giraffe", title: "Zürafa", src: "/images/giraffe.svg" },
  { id: "bird2", title: "Kuş", src: "/images/bird2.svg" },
  { id: "bird3", title: "Kuş (Detaylı)", src: "/images/bird3.svg" },
  { id: "butterfly", title: "Kelebek", src: "/images/butterfly.svg" },
  { id: "cat", title: "Kedi", src: "/images/cat.svg" },
  { id: "cat2", title: "Kedi 2", src: "/images/cat2.svg" },
  { id: "dog", title: "Köpek", src: "/images/dog.svg" },
  { id: "dolphin", title: "Yunus", src: "/images/dolphin.svg" },
  { id: "dragon", title: "Ejderha", src: "/images/dragon.svg" },
  { id: "elephant", title: "Fil", src: "/images/elephant.svg" },
  { id: "fruits", title: "Meyveler", src: "/images/fruits.svg" },
  { id: "giraffe2", title: "Zürafa 2", src: "/images/giraffe2.svg" },
  { id: "horse", title: "At", src: "/images/horse.svg" },
  { id: "lion", title: "Aslan", src: "/images/lion.svg" },
  { id: "owl", title: "Baykuş", src: "/images/owl.svg" },
  { id: "rabbit", title: "Tavşan", src: "/images/rabbit.svg" },
  { id: "sheep", title: "Koyun", src: "/images/sheep.svg" },
  { id: "tiger", title: "Kaplan", src: "/images/tiger.svg" },
  { id: "turtle", title: "Kaplumbağa", src: "/images/turtle.svg" },
  { id: "car", title: "Araba", src: "/images/car.svg" },
  { id: "aquarium", title: "Akvaryum", src: "/images/aquarium.svg" },
  { id: "aquarium2", title: "Akvaryum 2", src: "/images/aquarium2.svg" },
  { id: "children", title: "Çocuklar", src: "/images/children.svg" },
  { id: "chicken", title: "Tavuk", src: "/images/chicken.svg" },
  { id: "peng", title: "Penguen", src: "/images/peng.svg" },
  { id: "peng2", title: "Penguen 2", src: "/images/peng2.svg" },
];

// Ana Sayfa Bileşeni
const HomePage = () => {
  return (
    <div className="home-page">
      <h1>SVG Boyama Uygulaması</h1>
      <p>Boyamak istediğiniz şablonu seçin:</p>

      <div className="template-grid">
        {SVG_TEMPLATES.map((template) => (
          <div key={template.id} className="template-card">
            <h3>{template.title}</h3>
            <div className="template-preview">
              <img src={template.src} alt={template.title} />
            </div>
            <Link to={`/template/${template.id}`}>Bu Şablonu Seç</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// SVG Şablon Sayfası - Hazırlama ve Boyama işlemleri burada
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
    return <div className="loading">Şablon yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="template-page">
      <h1>{templateTitle} Boyama</h1>

      {isProcessed ? (
        <div className="coloring-container">
          <SVGColoringCanvas
            svgContent={processedSvg}
            title={templateTitle}
            palette={extractedColors.length > 0 ? extractedColors : undefined}
          />
        </div>
      ) : (
        <div className="processing">
          <p>Şablon hazırlanıyor...</p>
        </div>
      )}

      <div className="navigation">
        <Link to="/">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
};

// SVG Hazırlama Sayfası - Manuel SVG yükleme ve işleme
const PrepareCustomSVG = () => {
  const navigate = useNavigate();

  const handleSvgProcessed = (
    processedSvg: string,
    fileName: string,
    colors: string[]
  ) => {
    // İşlenmiş SVG'yi localStorage'a kaydet
    localStorage.setItem("customSvgContent", processedSvg);
    localStorage.setItem("customSvgColors", JSON.stringify(colors));
    localStorage.setItem("customSvgTitle", fileName.replace(/\.[^/.]+$/, ""));

    // Özel SVG boyama sayfasına yönlendir
    navigate("/custom-template");
  };

  return (
    <div className="prepare-page">
      <h1>Özel SVG Hazırlama</h1>
      <SVGPreparation onSVGProcessed={handleSvgProcessed} />

      <div className="navigation">
        <Link to="/">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
};

// Özel SVG Boyama Sayfası
const CustomTemplatePage = () => {
  const navigate = useNavigate();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("Özel Şablon");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage'dan verileri al
    const customSvgContent = localStorage.getItem("customSvgContent");
    const customSvgColors = localStorage.getItem("customSvgColors");
    const customSvgTitle = localStorage.getItem("customSvgTitle");

    if (!customSvgContent || !customSvgColors) {
      // Veri yoksa ana sayfaya yönlendir
      navigate("/");
      return;
    }

    setSvgContent(customSvgContent);

    try {
      const parsedColors = JSON.parse(customSvgColors);
      setColors(parsedColors);
      console.log("Özel SVG için renkler:", parsedColors);
    } catch (e) {
      console.error("Renkleri ayrıştırma hatası:", e);
    }

    if (customSvgTitle) {
      setTitle(customSvgTitle);
    }

    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!svgContent) {
    return <div className="error">SVG bulunamadı</div>;
  }

  return (
    <div className="custom-template-page">
      <h1>{title} Boyama</h1>

      <div className="coloring-container">
        <SVGColoringCanvas
          svgContent={svgContent}
          title={title}
          palette={colors.length > 0 ? colors : undefined}
        />
      </div>

      <div className="navigation">
        <Link to="/">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
};

// Ana Uygulama
function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Sayıya Göre Boyama</h1>
          <nav>
            <Link to="/">Ana Sayfa</Link>
            <Link to="/prepare">Özel SVG Yükle</Link>
          </nav>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/template/:templateId" element={<TemplatePage />} />
            <Route path="/prepare" element={<PrepareCustomSVG />} />
            <Route path="/custom-template" element={<CustomTemplatePage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} SVG Boyama Uygulaması</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

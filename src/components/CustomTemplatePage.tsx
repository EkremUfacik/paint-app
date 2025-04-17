import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SVGColoringCanvas from "./SVGColoringCanvas";

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
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-md text-gray-600">
        Yükleniyor...
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-md text-primary">
        SVG bulunamadı
      </div>
    );
  }

  return (
    <div className="bg-light min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-8">{title} Boyama</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <SVGColoringCanvas
          svgContent={svgContent}
          title={title}
          palette={colors.length > 0 ? colors : undefined}
        />
      </div>

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

export default CustomTemplatePage;

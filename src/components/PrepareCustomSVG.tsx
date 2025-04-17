import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SVGPreparation from "../utils/SVGPreparation";

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
    <div className="bg-light min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-8">
        Özel SVG Hazırlama
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <SVGPreparation onSVGProcessed={handleSvgProcessed} />
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

export default PrepareCustomSVG;

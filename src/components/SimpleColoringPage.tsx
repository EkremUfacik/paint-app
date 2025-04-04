import { useState } from "react";

interface ColorRegion {
  id: number;
  colorNumber: number;
}

interface SimpleColoringPageProps {
  imageSrc: string;
  title?: string;
  // Define the color palette - default colors if not provided
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

const SimpleColoringPage = ({
  imageSrc,
  title = "Sayıya Göre Boya",
  palette = DEFAULT_PALETTE,
}: SimpleColoringPageProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorNumber, setSelectedColorNumber] = useState<number | null>(
    null
  );
  const [coloredRegions, setColoredRegions] = useState<Record<number, string>>(
    {}
  );

  const handleColorSelect = (color: string, index: number) => {
    if (selectedColor === color) {
      setSelectedColor(null);
      setSelectedColorNumber(null);
    } else {
      setSelectedColor(color);
      setSelectedColorNumber(index + 1);
    }
  };

  const handleColorApply = (regionId: number) => {
    if (selectedColor) {
      setColoredRegions((prev) => ({
        ...prev,
        [regionId]: selectedColor,
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-red-500 text-center mb-6">
        {title}
      </h1>

      <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <img src={imageSrc} alt="Coloring page" className="w-full" />
        <p className="p-4 text-center text-gray-600">
          {selectedColorNumber
            ? `Şimdi ${selectedColorNumber} numaralı alanları boyayabilirsiniz`
            : "Lütfen bir renk seçin"}
        </p>
      </div>

      <div className="flex justify-center gap-4 flex-wrap mb-6">
        {palette.map((color, index) => (
          <button
            key={index}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              selectedColor === color ? "ring-4 ring-blue-500" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color, index)}
            aria-label={`Color ${index + 1}`}
          >
            <span className="text-white text-xl font-bold drop-shadow-md">
              {index + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => setColoredRegions({})}
        >
          Sıfırla
        </button>
      </div>
    </div>
  );
};

export default SimpleColoringPage;

import { useState, useRef, useEffect } from "react";

interface ColorArea {
  id: string;
  color: string | null;
  number: number;
  path: string;
}

interface ColoringPageProps {
  imageSrc: string;
  colorAreas: ColorArea[];
  palette: string[];
}

const ColoringPage = ({ imageSrc, colorAreas, palette }: ColoringPageProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [highlightedAreas, setHighlightedAreas] = useState<string[]>([]);
  const [coloredAreas, setColoredAreas] = useState<Record<string, string>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  // Highlight areas that should be colored with the selected color
  useEffect(() => {
    if (selectedColor) {
      const colorIndex = palette.indexOf(selectedColor);
      const areas = colorAreas
        .filter((area) => area.number === colorIndex + 1)
        .map((area) => area.id);

      setHighlightedAreas(areas);
    } else {
      setHighlightedAreas([]);
    }
  }, [selectedColor, colorAreas, palette]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color === selectedColor ? null : color);
  };

  const handleAreaClick = (areaId: string) => {
    if (selectedColor && highlightedAreas.includes(areaId)) {
      setColoredAreas((prev) => ({
        ...prev,
        [areaId]: selectedColor,
      }));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white mb-4">
        {imageSrc.endsWith(".png") || imageSrc.endsWith(".jpg") ? (
          <div className="relative">
            <img src={imageSrc} alt="Coloring page" className="w-full" />
            <svg
              ref={svgRef}
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              {colorAreas.map((area) => (
                <path
                  key={area.id}
                  id={area.id}
                  d={area.path}
                  fill={coloredAreas[area.id] || "transparent"}
                  stroke={
                    highlightedAreas.includes(area.id)
                      ? "yellow"
                      : "transparent"
                  }
                  strokeWidth={highlightedAreas.includes(area.id) ? 3 : 0}
                  strokeDasharray={
                    highlightedAreas.includes(area.id) ? "5,5" : "none"
                  }
                  onClick={() => handleAreaClick(area.id)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    fillOpacity: coloredAreas[area.id] ? 0.8 : 0,
                  }}
                />
              ))}
              {colorAreas.map((area) => (
                <text
                  key={`text-${area.id}`}
                  x={area.path.split(" ")[1]} // Approximate x position from path
                  y={area.path.split(" ")[2]} // Approximate y position from path
                  fontSize="20"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="black"
                  pointerEvents="none"
                >
                  {area.number}
                </text>
              ))}
            </svg>
          </div>
        ) : (
          <p>Unsupported image format</p>
        )}
      </div>

      <div className="flex justify-center gap-4 flex-wrap mb-6">
        {palette.map((color, index) => (
          <button
            key={color}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selectedColor === color ? "ring-4 ring-blue-500" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
          >
            <span className="text-white font-bold drop-shadow-md">
              {index + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => setColoredAreas({})}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ColoringPage;

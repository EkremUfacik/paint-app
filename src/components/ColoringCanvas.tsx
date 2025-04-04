import { useState, useRef, useEffect } from "react";
import ShareButtons from "./ShareButtons";
import CompletionConfetti from "./CompletionConfetti";

interface ColoringCanvasProps {
  imageSrc: string;
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

const ColoringCanvas = ({
  imageSrc,
  title = "Sayıya Göre Boya",
  palette = DEFAULT_PALETTE,
}: ColoringCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [coloredPixels, setColoredPixels] = useState(0);
  const [totalColorablePixels, setTotalColorablePixels] = useState(0);

  // Scale factor for better viewing on high DPI displays
  const scaleFactor = 1;

  // Load the image and set up the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsLoading(true);
    setProgress(10);
    setHasChanges(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      setProgress(50);
      // Resize canvas to match image dimensions with appropriate scaling
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      // Clear and prepare canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the original image with scaling
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      setIsLoading(false);
      setProgress(100);
    };

    img.onerror = () => {
      console.error("Error loading image");
      setIsLoading(false);
    };
  }, [imageSrc, scaleFactor]);

  // Add a new useEffect to calculate total colorable pixels
  useEffect(() => {
    if (isLoading || !canvasRef.current) return;

    const calculateColorablePixels = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let colorable = 0;

      // Count pixels that are black/dark (colorable)
      for (let i = 0; i < data.length; i += 4) {
        if (
          data[i] < 50 &&
          data[i + 1] < 50 &&
          data[i + 2] < 50 &&
          data[i + 3] > 0
        ) {
          colorable++;
        }
      }

      setTotalColorablePixels(colorable);
      setColoredPixels(0);
    };

    calculateColorablePixels();
  }, [isLoading]);

  // Add effect to check completion
  useEffect(() => {
    if (totalColorablePixels > 0 && coloredPixels > 0) {
      const percentColored = (coloredPixels / totalColorablePixels) * 100;

      // If more than 80% colored, show confetti!
      if (percentColored > 80 && !showConfetti) {
        setShowConfetti(true);
      }
    }
  }, [coloredPixels, totalColorablePixels, showConfetti]);

  const handleColorSelect = (color: string, index: number) => {
    if (selectedColor === color) {
      setSelectedColor(null);
      setSelectedColorIndex(null);
    } else {
      setSelectedColor(color);
      setSelectedColorIndex(index);
    }
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Get the pixel data for the entire canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Get the index of the clicked pixel in the data array
    const startPos = (startY * width + startX) * 4;

    // Get the color of the clicked pixel
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    // If the pixel is already colored (not dark), return
    if (!(startR < 50 && startG < 50 && startB < 50)) {
      return;
    }

    // Convert the fill color from hex to RGB
    const colorRGB = hexToRgb(fillColor);
    if (!colorRGB) return;

    const { r, g, b } = colorRGB;

    // Stack for the flood fill algorithm
    const pixelStack = [[startX, startY]];

    // Function to check if a pixel is within tolerance
    const matchStartColor = (pos: number) => {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];

      return (
        r < 50 &&
        g < 50 &&
        b < 50 && // Is dark (outline color)
        data[pos + 3] > 0 // Is not transparent
      );
    };

    // Initialize a counter for newly colored pixels
    let newlyColoredPixels = 0;

    // Function to color a pixel
    const colorPixel = (pos: number) => {
      data[pos] = r;
      data[pos + 1] = g;
      data[pos + 2] = b;
      data[pos + 3] = 200; // Semi-transparent for better look
      newlyColoredPixels++;
    };

    // Process the stack until it's empty
    while (pixelStack.length > 0) {
      const [x, y] = pixelStack.pop()!;

      // Move up until we find a boundary
      let currentY = y;
      while (currentY >= 0 && matchStartColor((currentY * width + x) * 4)) {
        currentY--;
      }
      currentY++;

      let reachLeft = false;
      let reachRight = false;

      // Scan down from the top boundary
      while (currentY < height && matchStartColor((currentY * width + x) * 4)) {
        const currentPos = (currentY * width + x) * 4;

        // Color the current pixel
        colorPixel(currentPos);

        // Check left
        if (x > 0) {
          const leftPos = currentPos - 4;
          if (matchStartColor(leftPos)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, currentY]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        // Check right
        if (x < width - 1) {
          const rightPos = currentPos + 4;
          if (matchStartColor(rightPos)) {
            if (!reachRight) {
              pixelStack.push([x + 1, currentY]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        currentY++;
      }
    }

    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
    setHasChanges(true);

    // Update the total colored pixels
    setColoredPixels((prev) => prev + newlyColoredPixels);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedColor || isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate click position relative to canvas and apply scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    // Apply the selected color
    floodFill(x, y, selectedColor);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsLoading(true);
    setProgress(20);

    // Clear canvas and redraw original image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      setProgress(70);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setIsLoading(false);
      setProgress(100);
      setHasChanges(false);
    };

    setColoredPixels(0);
    setShowConfetti(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to a data URL
    const dataUrl = canvas.toDataURL("image/png");

    // Set share image URL
    setShareImageUrl(dataUrl);

    // Create a temporary link element
    const link = document.createElement("a");

    // Set link properties
    link.href = dataUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-boyama.png`;

    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrepareShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to a data URL
    const dataUrl = canvas.toDataURL("image/png");

    // Set share image URL
    setShareImageUrl(dataUrl);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 rounded-lg overflow-hidden bg-white shadow-lg">
        <div className="p-4 bg-red-500 text-white">
          <h2 className="text-2xl font-bold text-center">{title}</h2>
        </div>

        <div className="relative border-t border-gray-200">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700">Yükleniyor... {progress}%</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full object-contain cursor-pointer"
            style={{ maxHeight: "600px", display: "block" }}
          />
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
            {palette.map((color, index) => (
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

      <CompletionConfetti
        show={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
};

export default ColoringCanvas;

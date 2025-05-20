import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Upload, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import tShirt from "../assets/inka-template-2.jpg";
import polo from "../assets/inka-template-3.jpg";
import longSleeve from "../assets/inka-template-7.jpg";
import threeFourthSleeve from "../assets/inka-template-6.jpg";
import tankTop from "../assets/inka-template-5.jpg";
import vNeck from "../assets/inka-template-8.jpg";
import pocketTshirt from "../assets/inka-template-1.jpg";
import hoodie from "../assets/inka-template-4.jpg";

type ShirtType =
  | "tshirt"
  | "long-sleeve"
  | "3/4-sleeve"
  | "sleeveless"
  | "v-neck"
  | "pocket-tshirt";

export function ShirtMockupGenerator() {
  const [shirtColor, setShirtColor] = useState("#ffffff");
  const [shirtType, setShirtType] = useState<ShirtType>("tshirt");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [designSize, setDesignSize] = useState({ width: 200, height: 200 });
  const [isDownloading, setIsDownloading] = useState(false);

  const mockupRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);

  // Shirt types with labels
  const shirtTypes = [
    { value: "tshirt", label: "T-Shirt", url: tShirt },
    { value: "polo", label: "Polo", url: polo },
    {
      value: "long-sleeve",
      label: "Long Sleeve",
      url: longSleeve,
    },
    { value: "3/4-sleeve", label: "3/4 Sleeve", url: threeFourthSleeve },
    { value: "tankTop", label: "Tank top", url: tankTop },
    { value: "v-neck", label: "V-Neck", url: vNeck },
    {
      value: "pocket-tshirt",
      label: "Pocket T-Shirt",
      url: pocketTshirt,
    },
    {
      value: "hoodie",
      label: "Hoodie",
      url: hoodie,
    },
  ];

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        // Reset position and scale when new image is uploaded
        setPosition({ x: 0, y: 0 });
        setDesignSize({ width: 200, height: 200 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShirtColor(e.target.value);
  };

  // Handle download of the mockup
  const handleDownload = useCallback(() => {
    if (mockupRef.current === null) return;

    // Set loading state to true
    setIsDownloading(true);

    // Hide selection box before taking screenshot
    setIsSelected(false);

    // Small delay to ensure UI updates before screenshot
    setTimeout(() => {
      toPng(mockupRef.current!, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${shirtType}-mockup.png`;
          link.href = dataUrl;
          link.click();
          // Reset loading state
          setIsDownloading(false);
        })
        .catch((err) => {
          console.error("Error generating image:", err);
          // Reset loading state on error
          setIsDownloading(false);
        });
    }, 100);
  }, [mockupRef, shirtType]);

  // Handle dragging for image positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsSelected(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      handleResize(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeCorner(null);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsSelected(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && !isResizing) {
      const deltaX = e.touches[0].clientX - dragStart.x;
      const deltaY = e.touches[0].clientY - dragStart.y;
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Reset the design position
  const resetDesign = () => {
    setPosition({ x: 0, y: 0 });
    setDesignSize({ width: 200, height: 200 });
  };

  // Handle clicking outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (designRef.current && !designRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [designRef]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle resize
  const handleResize = (e: React.MouseEvent) => {
    if (!isResizing || !resizeCorner) return;

    const deltaX = e.clientX - dragStart.x;

    // Calculate aspect ratio
    const aspectRatio = designSize.width / designSize.height;

    let newWidth = designSize.width;
    let newHeight = designSize.height;

    // Adjust size based on which corner is being dragged
    switch (resizeCorner) {
      case "topLeft":
        newWidth = designSize.width - deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case "topRight":
        newWidth = designSize.width + deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case "bottomLeft":
        newWidth = designSize.width - deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case "bottomRight":
        newWidth = designSize.width + deltaX;
        newHeight = newWidth / aspectRatio;
        break;
    }

    // Ensure minimum size
    if (newWidth >= 50 && newHeight >= 50) {
      setDesignSize({ width: newWidth, height: newHeight });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-4 md:mb-0 order-0 md:order-0">
        Generate your Shirt Mockup
      </h2>
      <div className="w-full flex flex-col md:flex-row gap-8 ">
        <div
          className="relative bg-gray-100 rounded-lg p-0 pb-12 flex items-center justify-center order-1 md:order-1 h-[80vh] flex-[1 0 80vh] md:flex-1"
          ref={mockupRef}
        >
          <div className="relative w-full h-full mx-auto flex items-center justify-center">
            {/* Shirt template */}
            <img
              src={shirtTypes.find((type) => type.value === shirtType)!.url}
              alt={`${shirtType} template`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Uploaded design */}
            {uploadedImage && (
              <div
                ref={designRef}
                className={`absolute top-1/4 left-1/2 cursor-move ${
                  isSelected ? "z-10" : ""
                }`}
                style={{
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  width: `${designSize.width}px`,
                  height: `${designSize.height}px`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded design"
                  width={designSize.width}
                  height={designSize.height}
                  className="w-full h-full object-contain"
                />

                {/* Resizable bounding box */}
                {isSelected && (
                  <>
                    <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none"></div>

                    {/* Resize handles */}
                    <div
                      className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeStart(e, "topLeft")}
                    ></div>
                    <div
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize"
                      onMouseDown={(e) => handleResizeStart(e, "topRight")}
                    ></div>
                    <div
                      className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize"
                      onMouseDown={(e) => handleResizeStart(e, "bottomLeft")}
                    ></div>
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeStart(e, "bottomRight")}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Color indicator */}
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 px-2 py-1 rounded-md shadow-sm">
              <div
                className="w-5 h-5 rounded-md border border-gray-300"
                style={{ backgroundColor: shirtColor }}
              />
              <span className="text-xs font-mono font-bold">
                Shirt Color: {shirtColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6 w-full md:max-w-[408px] order-2 md:order-2">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Your Design</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Shirt Type */}
          <div className="space-y-2">
            <Label htmlFor="shirt-type">Shirt Type</Label>
            <Select
              value={shirtType}
              onValueChange={(value) => setShirtType(value as ShirtType)}
            >
              <SelectTrigger id="shirt-type">
                <SelectValue placeholder="Select shirt type" />
              </SelectTrigger>
              <SelectContent>
                {shirtTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shirt Color */}
          <div className="space-y-2">
            <Label htmlFor="shirt-color">Shirt Color</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md border border-gray-300 overflow-hidden"
                style={{ backgroundColor: shirtColor }}
              >
                <input
                  type="color"
                  id="shirt-color"
                  value={shirtColor}
                  onChange={handleColorChange}
                  className="w-[200%] h-[200%] transform -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
                />
              </div>
              <div className="flex-1 h-10 bg-gray-100 rounded-md px-3 flex items-center">
                <span className="font-mono">{shirtColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {uploadedImage && (
            <>
              {/* Instructions */}
              <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-md">
                <p>Click on the design to select it. Drag to reposition.</p>
                <p>Use the corner handles to resize the design.</p>
                <p>Click outside to deselect.</p>
                <p>
                  Note: resizing the window will change the relative location
                  and size of graphic
                </p>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={resetDesign}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Design
              </Button>
            </>
          )}

          {/* Download Button */}
          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={!uploadedImage || isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Mock-up
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import {
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  MoveVertical,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ShirtMockupGenerator() {
  const [shirtColor, setShirtColor] = useState("#ffffff");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mockupRef = useRef<HTMLDivElement>(null);

  // Available shirt colors
  const shirtColors = [
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#000000" },
    { name: "Navy", value: "#0a192f" },
    { name: "Red", value: "#e11d48" },
    { name: "Green", value: "#16a34a" },
    { name: "Gray", value: "#6b7280" },
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
        setScale(1);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle download of the mockup
  const handleDownload = useCallback(() => {
    if (mockupRef.current === null) return;

    toPng(mockupRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "shirt-mockup.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Error generating image:", err);
      });
  }, [mockupRef]);

  // Handle dragging for image positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
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
  };

  // Reset the design position
  const resetDesign = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Shirt Mock-up Generator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Shirt Preview */}
          <div
            className="relative bg-gray-100 rounded-lg p-4 flex items-center justify-center"
            ref={mockupRef}
          >
            <div
              className="relative w-full aspect-[3/4] max-w-xs mx-auto"
              style={{ backgroundColor: shirtColor }}
            >
              {/* Shirt template */}
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src="https://unblast.com/wp-content/uploads/2023/10/Blank-T-shirt-Mockup-PSD.jpg"
                  alt="T-shirt template"
                  width={450}
                  height={600}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Uploaded design */}
              {uploadedImage && (
                <div
                  className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 cursor-move"
                  style={{
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
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
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded design"
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Your Design</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
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

            {/* Shirt Color */}
            <div className="space-y-2">
              <Label htmlFor="shirt-color">Shirt Color</Label>
              <Select value={shirtColor} onValueChange={setShirtColor}>
                <SelectTrigger id="shirt-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {shirtColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {uploadedImage && (
              <>
                {/* Scale Control */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="scale">Design Size</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setScale(Math.min(2, scale + 0.1))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    id="scale"
                    min={0.5}
                    max={2}
                    step={0.01}
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                  />
                </div>

                {/* Position Controls */}
                <div className="space-y-2">
                  <Label>Design Position</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Horizontal</span>
                        <MoveHorizontal className="h-4 w-4 text-gray-500" />
                      </div>
                      <Slider
                        min={-100}
                        max={100}
                        step={1}
                        value={[position.x]}
                        onValueChange={(value) =>
                          setPosition({ ...position, x: value[0] })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vertical</span>
                        <MoveVertical className="h-4 w-4 text-gray-500" />
                      </div>
                      <Slider
                        min={-100}
                        max={100}
                        step={1}
                        value={[position.y]}
                        onValueChange={(value) =>
                          setPosition({ ...position, y: value[0] })
                        }
                      />
                    </div>
                  </div>
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
              disabled={!uploadedImage}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Mock-up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

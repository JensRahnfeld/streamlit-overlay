import { Streamlit, withStreamlitConnection, ComponentProps } from "streamlit-component-lib"
import React, { useState, useEffect, useRef } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { Button } from "./components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";


const App: React.FC<ComponentProps> = (props: any) => {
  const { image, heatmap, alpha: alphaInit } = props.args;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayHeatmap, setDisplayHeatmap] = useState<boolean>(false);
  const [alpha, setAlpha] = useState<number>(alphaInit);

  useEffect(() => {
    Streamlit.setFrameHeight();
  })

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Deserializing the 3xHxW data array
    const [height, width] = [image[0].length, image[0][0].length];
    ctx.canvas.width  = width;
    ctx.canvas.height = height;

    // Create a new Uint8ClampedArray to hold the image data
    const canvasDataArray = new Uint8ClampedArray(height * width * 4);

    // Fill the Uint8ClampedArray with pixel data
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        if (displayHeatmap) {
          canvasDataArray[index] = (1 - alpha) * image[0][y][x] + alpha * heatmap[0][y][x];       // R
          canvasDataArray[index + 1] = (1 - alpha) * image[1][y][x] + alpha * heatmap[1][y][x];   // G
          canvasDataArray[index + 2] = (1 - alpha) * image[2][y][x] + alpha * heatmap[2][y][x];   // B
        }
        else {
          canvasDataArray[index] = image[0][y][x];       // R
          canvasDataArray[index + 1] = image[1][y][x];   // G
          canvasDataArray[index + 2] = image[2][y][x];   // B
        }
        canvasDataArray[index + 3] = 255;
      }
    }

    // Draw the image data on the canvas
    const canvasData = new ImageData(canvasDataArray, width, height);
    ctx.putImageData(canvasData, 0, 0);
  }, [image, heatmap, displayHeatmap, alpha])

  // return the mouse pointer click coordinates in the image coordinate system
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const xRescaled = x * canvasRef.current.width / canvasRef.current.clientWidth;
    const yRescaled = y * canvasRef.current.height / canvasRef.current.clientHeight;

    Streamlit.setComponentValue({MouseClick: [xRescaled, yRescaled]});
  }

  return (
        <div className="w-full">
          <div className="flex py-1">
            <div className="flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="px-2 py-0.5">
                    <SettingsIcon />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="h-full min-w-40 w-1/3">
                  <SheetHeader>
                    <SheetTitle className="text-center">Settings</SheetTitle>
                    <SheetClose />
                  </SheetHeader>
                  <Label className="px-2">Alpha</Label>
                  <div className="rounded-md border-2 px-2 py-4 bg-secondary-background">
                    <Slider value={[alpha]} min={0.0} max={1.0} step={0.01} onValueChange={newAlpha => setAlpha(newAlpha[0])} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex w-full justify-end items-center space-x-2">
              <Label>Display Heatmap</Label>
              <Switch checked={displayHeatmap} onCheckedChange={setDisplayHeatmap}/>
            </div>
          </div>
          <canvas className="w-full h-full object-contain" ref={canvasRef} onClick={handleCanvasClick}>
          </canvas>
        </div>
    )
  }

export default withStreamlitConnection(App);

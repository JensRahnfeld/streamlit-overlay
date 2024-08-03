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


interface AppProps {
  image: Uint8Array;
  heatmap: Uint8Array;
  width: number;
  height: number;
  alpha: number;
};

const App: React.FC<ComponentProps> = (props: any) => {
  debugger;
  const { image, heatmap, width, height, alpha: alphaInit }: AppProps = props.args;
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

    // Draw the image data on the canvas
    let canvasData = new ImageData(Uint8ClampedArray.from(image), width, height);
    if (displayHeatmap) {
      for (let index = 0; index < width * height; index++) {
        canvasData.data[index * 4] = (1 - alpha) * image[index * 4] + alpha * heatmap[index * 4];
        canvasData.data[index * 4 + 1] = (1 - alpha) * image[index * 4 + 1] + alpha * heatmap[index * 4 + 1];
        canvasData.data[index * 4 + 2] = (1 - alpha) * image[index * 4 + 2] + alpha * heatmap[index * 4 + 2];
      }
    }
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
          <canvas className="w-full h-full object-contain" width={width} height={height} ref={canvasRef} onClick={handleCanvasClick}>
          </canvas>
        </div>
    )
  }

export default withStreamlitConnection(App);

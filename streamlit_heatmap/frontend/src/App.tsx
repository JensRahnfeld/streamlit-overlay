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
  images: Uint8Array;
  heatmaps: Uint8Array;
  width: number;
  height: number;
  numFrames: number;
  alpha: number;
};

const App: React.FC<ComponentProps> = (props: any) => {
  const { images, heatmaps, width, height, numFrames, alpha: alphaInit }: AppProps = props.args;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayheatmap, setDisplayheatmap] = useState<boolean>(false);
  const [alpha, setAlpha] = useState<number>(alphaInit);
  const [frameIdx, setFrameIdx] = useState<number>(0);

  useEffect(() => {
    Streamlit.setFrameHeight();
  })

  useEffect(() => {
    if (!images || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Draw the images data on the canvas
    let canvasData = new Uint8ClampedArray(width * height * 4);
    for (let index = 0; index < width * height; index++) {
      const offset = (frameIdx * width * height + index) * 4;

      if (displayheatmap) {
          canvasData[index * 4] = (1 - alpha) * images[offset] + alpha * heatmaps[offset];
          canvasData[index * 4 + 1] = (1 - alpha) * images[offset + 1] + alpha * heatmaps[offset + 1];
          canvasData[index * 4 + 2] = (1 - alpha) * images[offset + 2] + alpha * heatmaps[offset + 2];
      }
      else {
          canvasData[index * 4] = images[offset];
          canvasData[index * 4 + 1] = images[offset + 1];
          canvasData[index * 4 + 2] = images[offset + 2];
      }
      canvasData[index * 4 + 3] = 255;
    }
    ctx.putImageData(new ImageData(canvasData, width, height), 0, 0);
  }, [images, heatmaps, displayheatmap, alpha, frameIdx]);

  // return the mouse pointer click coordinates in the images coordinate system
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
              <Label>Display heatmaps</Label>
              <Switch checked={displayheatmap} onCheckedChange={setDisplayheatmap}/>
            </div>
          </div>
          <canvas className="w-full h-full object-contain" width={width} height={height} ref={canvasRef} onClick={handleCanvasClick}>
          </canvas>
          {numFrames > 1 && <Slider 
            value={[frameIdx]}
            min={0} max={numFrames - 1} 
            step={1}
            onValueChange={newFrameIdx => setFrameIdx(newFrameIdx[0])}
            />}
        </div>
    )
  }

export default withStreamlitConnection(App);

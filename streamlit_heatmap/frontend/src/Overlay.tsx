import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib";
import React, { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

import { decompressImages } from "./utils";
import VideoPlayerControls from "@/components/VideoControls";

interface OverlayProps {
  images: Uint8Array;
  masks: Uint8Array;
  width: number;
  height: number;
  numFrames: number;
  alpha?: number;
  toggleLabel?: string;
  autoplay?: boolean;
}

const Overlay: React.FC<ComponentProps> = (props: any) => {
  const {
    images: imagesCompressed,
    masks: masksCompressed,
    width,
    height,
    numFrames,
    alpha: alphaInit = 0.5,
    toggleLabel = "Display Overlay",
    autoplay = false,
  }: OverlayProps = props.args;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [masks, setMasks] = useState<HTMLImageElement[]>([]);
  const [displaymask, setDisplayMask] = useState<boolean>(false);
  const [alpha, setAlpha] = useState<number>(alphaInit);
  const [frameIdx, setFrameIdx] = useState<number>(0);

  // options
  const [displayControls, setDisplayControls] = useState<boolean>(true);
  const [loop, setLoop] = useState<boolean>(false);

  useEffect(() => {
    Streamlit.setFrameHeight();
  });

  useEffect(() => {
    if (!imagesCompressed) return;
    setImages(decompressImages(imagesCompressed));
  }, [imagesCompressed]);

  useEffect(() => {
    if (!masksCompressed) return;
    setMasks(decompressImages(masksCompressed));
  }, [masksCompressed]);

  useEffect(() => {
    if (images.length == 0 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (displaymask && masks.length > 0) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1 - alpha;
      ctx.drawImage(images[frameIdx], 0, 0, width, height);
      ctx.globalAlpha = alpha;
      ctx.drawImage(masks[frameIdx], 0, 0, width, height);
    } else {
      ctx.globalAlpha = 1.0;
      ctx.drawImage(images[frameIdx], 0, 0, width, height);
    }
  }, [images, masks, displaymask, alpha, frameIdx]);

  // return the mouse pointer click coordinates in the images coordinate system
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xRescaled =
      (x * canvasRef.current.width) / canvasRef.current.clientWidth;
    const yRescaled =
      (y * canvasRef.current.height) / canvasRef.current.clientHeight;

    Streamlit.setComponentValue({ MouseClick: [xRescaled, yRescaled] });
  };

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
                <Slider
                  value={[alpha]}
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  onValueChange={(newAlpha) => setAlpha(newAlpha[0])}
                />
              </div>
              <div className="py-2">
                <div className="flex items-center px-2 py-1">
                  <Label>Controls</Label>
                  <div className="flex w-full justify-end">
                    <Switch
                      checked={displayControls}
                      onCheckedChange={setDisplayControls}
                    />
                  </div>
                </div>
                <div className="flex items-center px-2 py-1">
                  <Label>Loop</Label>
                  <div className="flex w-full justify-end">
                    <Switch checked={loop} onCheckedChange={setLoop} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex w-full justify-end items-center space-x-2">
          <Label>{toggleLabel}</Label>
          <Switch checked={displaymask} onCheckedChange={setDisplayMask} />
        </div>
      </div>
      <canvas
        className="w-full h-full object-contain"
        width={width}
        height={height}
        ref={canvasRef}
        onClick={handleCanvasClick}
      ></canvas>
      {numFrames > 1 && (
        <VideoPlayerControls
          frameIdx={frameIdx}
          setFrameIdx={setFrameIdx}
          numFrames={numFrames}
          loop={loop}
          autoplay={autoplay}
          className={displayControls ? "" : "hidden"}
        />
      )}
    </div>
  );
};

export default withStreamlitConnection(Overlay);

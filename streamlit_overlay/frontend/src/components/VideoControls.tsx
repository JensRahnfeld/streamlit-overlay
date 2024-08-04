import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTime = (frameIdx: number, fps: number) => {
  const totalSeconds = Math.floor(frameIdx / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frames = frameIdx % fps;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}:${String(frames).padStart(2, "0")}`;
};

interface VideoPlayerControlsProps {
  frameIdx: number;
  setFrameIdx: (frameIdx: number | ((prevFrameIdx: number) => number)) => void;
  numFrames: number;
  fps?: number;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  frameIdx,
  setFrameIdx,
  numFrames,
  fps = 30,
  autoplay = false,
  loop = false,
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Store interval ID

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setFrameIdx((prevFrameIdx) => {
          if (prevFrameIdx < numFrames - 1) {
            return prevFrameIdx + 1;
          } else {
            if (loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return prevFrameIdx;
            }
          }
        });
      }, 1000 / fps);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup function to clear interval on component unmount or if isPlaying changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, numFrames, setFrameIdx, loop]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("flex py-1", className)}>
      <Button
        onClick={togglePlayPause}
        variant="outline"
        className="px-2 py-0.5 mr-2"
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Slider
        min={0}
        max={numFrames - 1}
        step={1}
        value={[frameIdx]}
        onValueChange={(newFrameIdx) => setFrameIdx(newFrameIdx[0])}
      />
      <div className="flex items-center px-2">{formatTime(frameIdx, fps)}</div>
    </div>
  );
};

export default VideoPlayerControls;

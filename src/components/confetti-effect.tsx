"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type ConfettiEffectProps = {
  active: boolean;
  duration?: number;
  teamColors?: string[];
};

export default function ConfettiEffect({
  active,
  duration = 5000,
  teamColors = ["#f44336", "#2196f3", "#ffeb3b", "#4caf50", "#9c27b0"],
}: ConfettiEffectProps) {
  const { width, height } = useWindowSize();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (active) {
      setIsActive(true);

      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isActive) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      colors={teamColors}
    />
  );
}

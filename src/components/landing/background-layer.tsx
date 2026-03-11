"use client";

import { ChromaFlow, Shader, Swirl } from "shaders/react";
import GrainOverlay from "./gradient-overlay";

export const BackgroundLayer = () => {
  return (
    <>
      <GrainOverlay />
      <Shader
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Swirl
          colorA="#000"
          colorB="#e1ff0015"
          speed={1}
          detail={0.8}
          blend={50}
        />
        <ChromaFlow
          baseColor="#e1ff00"
          upColor="#ff3300"
          downColor="#d1d1d1"
          leftColor="#e19136"
          rightColor="#e19136"
          intensity={0.9}
          radius={1.8}
          momentum={25}
          maskType="alpha"
          opacity={0.97}
        />
      </Shader>
    </>
  );
};

"use client";

import ScrollyVideo from "@/components/ScrollyVideo";
import Overlay from "@/components/Overlay";

export default function Hero() {
  return (
    <div className="relative" id="home">
      <ScrollyVideo>
        {(progress) => <Overlay scrollYProgress={progress} />}
      </ScrollyVideo>
    </div>
  );
}

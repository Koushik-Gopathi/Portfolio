"use client";

import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function ScrollyVideo({ children }) {
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const TOTAL_FRAMES = 175; // Total number of frames in your sequence

  // Scroll progress for the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll value
  const springScroll = useSpring(scrollYProgress, {
    damping: 50,
    stiffness: 400,
  });

  // Transform scroll progress to frame index
  const frameIndex = useTransform(springScroll, [0, 1], [1, TOTAL_FRAMES]);

  // Preload images for smooth performance
  useEffect(() => {
    const loadedImages = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      // Adjust path and naming convention here
      img.src = `/sequence/frame_${String(i).padStart(3, '0')}.png`;
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Use a canvas to render frames for maximum performance
  const canvasRef = useRef(null);

  useEffect(() => {
    const unsubscribe = frameIndex.on("change", (latest) => {
      const context = canvasRef.current?.getContext("2d");
      if (context) {
        const index = Math.floor(latest);
        const img = images[index - 1];
        if (img && img.complete) {
          // Draw image to fill canvas while maintaining aspect ratio (cover)
          const canvas = canvasRef.current;
          const hRatio = canvas.width / img.width;
          const vRatio = canvas.height / img.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShift_x = (canvas.width - img.width * ratio) / 2;
          const centerShift_y = (canvas.height - img.height * ratio) / 2;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }
      }
    });
    return () => unsubscribe();
  }, [images, frameIndex]);

  // Resize canvas to fill screen
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover"
        />
        {/* Render children (Overlay) passing the springScroll value */}
        {children && children(springScroll)}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import { PixiManager } from "@/services/pixi/PixiManager";
import { convertPixiContainerToSkia } from "@/services/skia/SkiaRenderer";
import { toast } from "sonner";

function Editor() {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  // save in ref because not need create of render
  const managerRef = useRef<PixiManager | null>(null);

  useEffect(() => {
    if (!pixiContainerRef.current) return;

    pixiContainerRef.current.innerHTML = "";

    const manager = new PixiManager(); // create copy services
    manager.init(pixiContainerRef.current);
    managerRef.current = manager;

    /*
      performed asynchronous loading
      defined variables to store the Skia instance
      and a flag to destroy the instance
      checking to ensure the component did not crash during loading
      if successful, call CanvasKit with the WASM path
      after which the instance of the convertPixiContainerToSkia class is called
    */
    let skiaRenderer: convertPixiContainerToSkia | null = null;
    let isDestroyed = false;

    const loadCanvasKitGlobal = async () => {
      try {
        const scriptId = "canvaskit-pdf-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src =
            "https://unpkg.com/canvaskit-wasm@0.39.1/bin/full/canvaskit.js";
          script.async = true;
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        if (isDestroyed) return;

        if (typeof (window as any).CanvasKitInit === "undefined") {
          throw new Error("CanvasKitInit is not defined on window");
        }

        const ck = await (window as any).CanvasKitInit({
          locateFile: (file: string) =>
            `https://unpkg.com/canvaskit-wasm@0.39.1/bin/full/${file}`,
        });

        if (!isDestroyed) {
          skiaRenderer = new convertPixiContainerToSkia(ck);
        }
      } catch (err) {
        console.error("CanvasKit Error:", err);
        toast.error("Error...");
      }
    };

    loadCanvasKitGlobal();

    const handleAddShape = () => {
      manager.addRandomShape();
    };
    window.addEventListener("add-random-shape", handleAddShape);

    // catching click
    const handleSwitchScene = (e: Event) => {
      const customEvent = e as CustomEvent<{ scene: string }>;
      manager.loadScene(customEvent.detail.scene);
    };
    window.addEventListener("switch-scene", handleSwitchScene);

    const handlePdfExport = (e: Event) => {
      const customEvent = e as CustomEvent<{ fileName: string }>;
      const fileName = customEvent.detail.fileName;

      if (skiaRenderer && manager.mainContainer) {
        skiaRenderer.exportToPDF(manager.mainContainer, fileName);
      } else if (!skiaRenderer) {
        toast.info("Loading...");
      }
    };

    window.addEventListener("trigger-pdf-export", handlePdfExport);

    // clear all function
    return () => {
      isDestroyed = true;
      window.removeEventListener("add-random-shape", handleAddShape);
      window.removeEventListener("switch-scene", handleSwitchScene);
      window.removeEventListener("trigger-pdf-export", handlePdfExport);
      manager.destroy();
    };
  }, []);

  return (
    <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-gray-50/50">
      <div className="text-center p-8 border-2 border-gray-200 rounded-2xl bg-white max-w-md shadow-sm">
        <div
          ref={pixiContainerRef}
          className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-white"
        />
      </div>
    </div>
  );
}

export default Editor;

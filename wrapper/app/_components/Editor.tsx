"use client";

import React, { useEffect, useRef, useState } from "react";
import { PixiManager } from "@/services/pixi/PixiManager";

function Editor() {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  // save in ref because not need create of render
  const managerRef = useRef<PixiManager | null>(null);

  useEffect(() => {
    if (!pixiContainerRef.current) return;

    const manager = new PixiManager(); // create copy services
    manager.init(pixiContainerRef.current);
    managerRef.current = manager;

    const handleAddShape = () => {
      manager.addRandomShape();
    };
    window.addEventListener("add-random-shape", handleAddShape);

    // catching click
    const handleSwitchScene = (e: Event) => {
      const customEvent = e as CustomEvent<{ scene: string }>;
      const sceneName = customEvent.detail.scene;
      manager.loadScene(sceneName);
    };
    window.addEventListener("switch-scene", handleSwitchScene);


    // clear all function
    return () => {
      window.removeEventListener("add-random-shape", handleAddShape);
      window.removeEventListener("switch-scene", handleSwitchScene);
      manager.destroy();
    };
  },[])

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

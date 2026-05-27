"use client";

import DesignHeader from "@/app/_compnents/DesignHeader";
import SideBar from "./_compnents/SideBar";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden bg-white">

      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle,#d4d4d8_1px,transparent_1px)]
          [background-size:30px_30px]
          z-0
        "
      />

      <div className="relative z-10 flex h-full flex-col">
        <DesignHeader />
        <div className="flex flex-1 overflow-hidden relative">
          <SideBar />
          <div>
            {/*
              TODO: Layout canvas
              // <Editor />
            */}
          </div>
        </div>
      </div>
    </main>
  );
}

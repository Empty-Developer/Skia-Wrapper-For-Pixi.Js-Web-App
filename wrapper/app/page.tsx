"use client";

import DesignHeader from "@/app/_components/DesignHeader";
import SideBar from "./_components/SideBar";
import Editor from "./_components/Editor";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden bg-white">

      {/* grid background */}
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
          <div className="flex-1 h-full w-full relative z-10">
            <Editor />
          </div>
        </div>
      </div>
    </main>
  );
}

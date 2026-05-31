"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Share } from "lucide-react";
import { useEffect, useState } from "react";

export default function DesignHeader() {
  const [projectName, setProjectName] = useState("untitled-project");

  useEffect(() => {
    const handleRequest = () => handleExportClick();
    window.addEventListener("request-pdf-export", handleRequest);
    return () =>
      window.removeEventListener("request-pdf-export", handleRequest);
  }, [projectName]);

  const handleExportClick = () => {
    // validation for name file
    const sanitizedName =
      projectName.trim().replace(/\s+/g, "-") || "untitled-project";

    const event = new CustomEvent("trigger-pdf-export", {
      detail: { fileName: sanitizedName },
    });
    window.dispatchEvent(event);
  };

  return (
    <header className="p-3 flex justify-between items-center shadow-sm bg-white border-b">
      <div className="flex items-center gap-4">
        <Image
          src={"/logo.png"}
          alt="Logo"
          width={100}
          height={100}
          priority
          className="w-[50px] h-[50px] object-contain"
        />
        <Input
          placeholder="Enter Name Project"
          className="border-b border-transparent hover:border-gray-200 outline-none px-2 py-1 text-lg font-semibold transition-colors text-gray-800"
        />
      </div>
      <div>
        <Button
          onClick={handleExportClick}
          className="bg-[#FF7E1F] shadow-sm border-none text-sm cursor-pointer rounded-xl transition-all duration-300 p-5"
        >
          Export PDF
          <Share />
        </Button>
      </div>
    </header>
  );
}

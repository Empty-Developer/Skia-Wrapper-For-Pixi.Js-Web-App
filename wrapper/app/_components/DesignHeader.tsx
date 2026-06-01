"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Share } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function DesignHeader() {
  const [projectName, setProjectName] = useState("");
  const projectNameRef = useRef(projectName);

  useEffect(() => {
    projectNameRef.current = projectName;
  }, [projectName]);

  // name validator is now in state
  const getSanitizedName = (name: string) => {
    return name.trim().replace(/\s+/g, "-") || "untitled-project";
  };

  useEffect(() => {
    // event handler for accepting a name
    const handleRequest = () => {
      const sanitizedName = getSanitizedName(projectNameRef.current);

      const event = new CustomEvent("trigger-pdf-export", {
        detail: { fileName: sanitizedName },
      });
      window.dispatchEvent(event);
    };

    window.addEventListener("request-pdf-export", handleRequest);
    return () =>
      window.removeEventListener("request-pdf-export", handleRequest);
  }, []);

  const handleExportClick = () => {
    /*
      removed the validation, so now can
      type the name directly into the
      input field
    */
    const sanitizedName = getSanitizedName(projectName);
    const event = new CustomEvent("trigger-pdf-export", {
      detail: { fileName: sanitizedName },
    });
    window.dispatchEvent(event);
  };

  return (
    <header className="p-3 flex justify-between items-center shadow-sm bg-white border-b">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={50}
          height={50}
          priority
          className="w-[50px] h-[50px] object-contain"
        />
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
          className="border-b border-transparent hover:border-gray-200 outline-none px-2 py-1 text-lg font-semibold transition-colors text-gray-800"
        />
      </div>
      <div>
        <Button
          onClick={handleExportClick}
          className="bg-[#FF7E1F] shadow-sm border-none text-sm cursor-pointer rounded-xl transition-all duration-300 p-5 gap-2"
        >
          Export PDF
          <Share className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

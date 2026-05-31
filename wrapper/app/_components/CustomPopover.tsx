"use client";

import React, { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

interface CustomPopoverProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CustomPopover({ children, open, onOpenChange }: CustomPopoverProps) {

  const handleSceneSelect = (sceneName: string) => {
    const event = new CustomEvent("switch-scene", { detail: { scene: sceneName } });
    window.dispatchEvent(event);
    onOpenChange(false); // close popover
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="w-full block">
        {children}
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        className="w-80 p-4"
      >
        <h3 className="font-semibold mb-3 text-sm text-gray-700">
          Completed Scene
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div
            onClick={() => handleSceneSelect("empty")}
            className="border relative h-24 w-full rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
            <Image src="/pluse.png" alt="Pluse" fill className="object-cover" />
          </div>
          <div
            onClick={() => handleSceneSelect("scene1")}
            className="border relative h-24 w-full rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Image src="/random-one.png" alt="Random One" fill className="object-cover" />
          </div>
          <div
            className="border relative h-24 w-full rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => handleSceneSelect("scene1")}
          >
            <Image src="/random-two.png" alt="Random Two" fill className="object-cover" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CustomPopover;

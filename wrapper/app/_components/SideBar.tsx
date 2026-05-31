"use client";

import React, { useEffect, useState } from "react";
import { WorkspaceMenu } from "../../services/options/Option";
import { usePathname } from "next/navigation";
import CustomPopover from "./CustomPopover";

function SideBar() {
  const path = usePathname();
  const [isScenePopoverOpen, setIsScenePopoverOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState("empty");

  useEffect(() => {
    const handleSceneChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ scene: string }>;
      setCurrentScene(customEvent.detail.scene);
    };
    window.addEventListener("switch-scene", handleSceneChanged);
    return () => window.removeEventListener("switch-scene", handleSceneChanged);
  },[])

  return (
    <div className="h-screen bg-white border-r p-2 w-64">
      {WorkspaceMenu.map((menu, index) => {
        const isSwitchScene = menu.name === "Switch Scene";
        const isAddShape = menu.name === "Add Random Shape";

        // button one
        const isAddDisabled = isAddShape && currentScene !== "empty";

        const menuButton = (
          <div
            className={`flex p-3 rounded-xl transition-all duration-200 items-center w-full
              ${isAddDisabled
                ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400"
                : "hover:bg-amber-100 cursor-pointer text-gray-700"
              }`}
            onClick={() => {
              if (isAddDisabled) return;

              if (isSwitchScene) {
                setIsScenePopoverOpen(!isScenePopoverOpen);
              } else if (isAddShape) {
                const event = new CustomEvent("add-random-shape");
                window.dispatchEvent(event);
              }
            }}
          >
            <menu.icon className="w-5 h-5 text-gray-500" />
            <h3 className="ml-3 font-medium text-sm text-gray-700">
              {menu.name}
            </h3>
          </div>
        );

        return (
          // moved the key to the top-level iterated ащк Virtual DOM integrity
          <div key={index} className="mt-5 flex w-full">
            {isSwitchScene ? (
              /*
                trigger is inside CustomPopover, so need pass width through it ~~~~
                Otherwise cant make PopoverTrigger full width
              */
              <div className="w-full">
                <CustomPopover
                  open={isScenePopoverOpen}
                  onOpenChange={setIsScenePopoverOpen}
                >
                  {menuButton}
                </CustomPopover>
              </div>
            ) : (
              menuButton
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SideBar;
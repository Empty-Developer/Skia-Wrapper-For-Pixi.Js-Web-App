"use client";

import React, { useState } from "react";
import { WorkspaceMenu } from "../../services/Option";
import { usePathname } from "next/navigation";
import CustomPopover from "./CustomPopover";

function SideBar() {
  const path = usePathname();
  const [isScenePopoverOpen, setIsScenePopoverOpen] = useState(false);

  return (
    <div className="h-screen bg-white border-r p-2 w-64">
      {WorkspaceMenu.map((menu, index) => {
        const isSwitchScene = menu.name === "Switch Scene";

        const menuButton = (
          <div
            className="flex hover:bg-amber-100 p-3 rounded-xl transition-all duration-200 cursor-pointer items-center w-full"
            onClick={() => {
              if (isSwitchScene) {
                setIsScenePopoverOpen(!isScenePopoverOpen);
              } else {
                // TODO: implement the logic for "Add Random Shape" aand "Export PDF"
                console.log(menu.name);
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
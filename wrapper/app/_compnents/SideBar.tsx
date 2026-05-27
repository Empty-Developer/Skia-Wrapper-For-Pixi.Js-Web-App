"use client"

import React from "react";
import { WorkspaceMenu } from "../services/Option";
import { usePathname } from "next/navigation";

function SideBar() {
  const path = usePathname();
  /*
    TODO: if user switch scene
    need create blok button for first
  */
  return (
    <div className="h-screen bg-white border-r p-2">
      {WorkspaceMenu.map((menu, index) => (
        <div className="mt-5">
          <div
            key={index}
            className="flex hover:bg-amber-100 p-3 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <menu.icon />
            <h3 className="ml-3">{menu.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SideBar;

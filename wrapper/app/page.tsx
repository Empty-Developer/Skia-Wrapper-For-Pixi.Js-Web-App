"use client"

import DesignHeader from "@/components/design/DesignHeader"

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden bg-white">

      <DesignHeader />

      {/* grid components */}
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle,#d4d4d8_1px,transparent_1px)]
            [background-size:30px_30px]
          "
        />
      </div>

    </main>
  )
}
# Skia Wrapper For Pixi.Js Web-App

Если вы плохо понимаете Английский или не понимаете его, откройте фаел [**README.ru.md**](https://github.com/Empty-Developer/Skia-Wrapper-For-Pixi.Js-Web-App/blob/main/README.ru.md)

![Platform Preview](/img/img.png)

This project explores a non-obvious idea: using two completely different graphics engines together in the same web app.

**[Pixi.js](https://pixijs.com/)** (legacy, Canvas 2D mode) handles the interactive canvas - drawing shapes, managing scene hierarchy, and responding to pointer events in real time.

**[CanvasKit WASM](https://skia.org/docs/user/modules/canvaskit/)** (Google Skia compiled to WebAssembly) is used purely as an export engine. The `convertPixiContainerToSkia` class walks the live Pixi.js scene graph, reads each object's geometry and transform, and redraws it using Skia's canvas API  enabling a high-quality PDF export that matches what the user sees on screen.

The result is a simple but technically interesting design editor that can export its canvas to a vector/raster PDF.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16 (App Router)](https://nextjs.org/docs/app/getting-started/installation) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [shadcn/ui components](https://ui.shadcn.com/docs/components/radix/sonner) |
| 2D Renderer | [pixi.js-legacy 7](https://pixijs.com/8.x/guides/getting-started/intro) (Canvas 2D, no WebGL) |
| Vector Export | [canvaskit-wasm 0.41 (Google Skia via WASM)](https://skia.org/docs/dev/) |
| PDF Fallback | [jsPDF 4](https://www.npmjs.com/package/jspdf?activeTab=code) |
| UI Primitives | [@base-ui/react](https://base-ui.com/react/overview/quick-start) |
| Runtime | [Bun](https://bun.com/) |

---

## Project Structure

```
wrapper/
├── app/
│   ├── _components/
│   │   ├── Editor.tsx          # Mounts Pixi canvas; loads CanvasKit async; wires custom events
│   │   ├── SideBar.tsx         # Action panel (Add Shape, Switch Scene, Export)
│   │   ├── DesignHeader.tsx    # Project name input + Export PDF button
│   │   └── CustomPopover.tsx   # Scene-switcher popover
│   ├── layout.tsx
│   └── page.tsx
├── services/
│   ├── pixi/
│   │   └── PixiManager.ts      # Pixi.js app lifecycle, scene loading, shape generation
│   └── skia/
│       └── SkiaRenderer.ts     # Skia wrapper converts Pixi scene graph → Skia draw calls → PDF
├── components/ui/              # shadcn/ui component library
└── lib/
    └── utils.ts
```
---

## Architecture

### Scene Manager - `PixiManager`

`PixiManager` owns the Pixi.js `Application` instance. It initialises a Canvas 2D renderer (`forceCanvas: true`) and exposes three public methods used by the React layer:

- **`init(container)`** - creates the Pixi app, appends the canvas element, and loads the empty scene.
- **`loadScene(sceneType)`** - clears the stage and loads either an empty canvas (shapes allowed) or a preset locked layout (`scene1` / `scene2`).
- **`addRandomShape()`** - appends a randomly sized, colored, and rotated rectangle or ellipse. Blocked when a preset scene is loaded.
- **`destroy()`** - tears down the Pixi app and frees GPU/memory resources.

### Skia Wrapper - `convertPixiContainerToSkia`

`convertPixiContainerToSkia` receives a `CanvasKit` instance and exposes:

- **`renderContainer(canvas, container)`** - recursively walks a `PIXI.Container` tree, reading each `Graphics` object's raw geometry data and applying the accumulated transformation matrix. Shapes are redrawn on a Skia canvas using matching fill and stroke paint descriptors.
- **`exportToPDF(container, fileName)`** - exports the container to a `.pdf` file. The export pipeline has three levels of fallback:
  1. **Native Skia PDF** (`SkPDF` / `CreatePDFWStream`) - tried first if the WASM build exposes it.
  2. **SVG string** - if the Skia picture exposes `toSVGString()`, the SVG is embedded into a jsPDF document.
  3. **HD rasterization** - 4× upscale render to an off-screen Skia surface, read back as raw RGBA pixels, painted onto a temporary `<canvas>`, and embedded as a PNG in jsPDF.

### Component Communication

The React components do not share state through props or context. Instead, they communicate via `window` custom events:

| Event | Direction | Payload |
|---|---|---|
| `add-random-shape` | Sidebar → Editor | — |
| `switch-scene` | Sidebar → Editor, Sidebar | `{ scene: string }` |
| `request-pdf-export` | Sidebar → Header | — |
| `trigger-pdf-export` | Header → Editor | `{ fileName: string }` |

This keeps each component independently mountable and avoids threading state through the page layout.

---

## Getting Started

**Prerequisites:** [Bun](https://bun.sh/) or Node.js ≥ 18 with npm/pnpm.

```bash
# 1. Enter the wrapper directory
cd wrapper

# 2. Install dependencies
bun install
# or: npm install

# 3. Start the development server
bun dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** CanvasKit WASM is loaded lazily from a CDN (`unpkg.com`) the first time the Editor mounts. PDF export will show a "Loading…" toast until the WASM binary finishes downloading (~8 MB). Subsequent exports in the same session are instant.

---

## Usage

| Action | How |
|---|---|
| Add a shape | Click **Add Random Shape** in the sidebar |
| Switch scenes | Click **Switch Scene** and choose a preset from the popover |
| Return to empty canvas | Switch to the **Empty** scene |
| Name your project | Type in the input field in the header |
| Export to PDF | Click **Export PDF** in the header or sidebar |

When a preset scene (`Scene 1` or `Scene 2`) is loaded, **Add Random Shape** is disabled. Switch back to an empty canvas to resume editing.


## How the Pixi → Skia Conversion Works

Pixi.js stores geometry in a `GraphicsData` array on each `Graphics` object. Each entry holds:

- A **shape** descriptor - a `PIXI.Rectangle`, `PIXI.Ellipse`, or polygon `points` array.
- A **fillStyle** - color (as a packed integer) and alpha.
- A **lineStyle** - color, alpha, and stroke width.

`SkiaRenderer` reads this raw data and maps it to Skia equivalents:

| Pixi geometry | Skia call |
|---|---|
| `PIXI.Rectangle` | `canvas.drawRect(XYWHRect(...))` |
| `PIXI.Ellipse` | `canvas.drawOval(XYWHRect(...))` |
| Polygon / line | `Path.moveTo / lineTo`, `canvas.drawPath(...)` |

Colors are converted from packed 24-bit integers to normalized `Float32Array([r, g, b, a])` as required by Skia's paint API.

Object transforms are applied by reading the `localTransform` matrix from each `PIXI.DisplayObject` and calling `canvas.concat([a, c, tx, b, d, ty, 0, 0, 1])` — matching Pixi's 2D affine transform layout.

## License

**PolyForm Noncommercial License 1.0.0** - free to use for non-commercial purposes.
Copyright 2026 Valery — [@empty_dev_](https://x.com/empty_dev_)

See [LICENSE.md](LICENSE.md) for the full license text.
import { Canvas, CanvasKit, Paint } from "canvaskit-wasm";
import * as PIXI from "pixi.js";

/*
  TODO: 
    need render point shapes and use pixi.js
    and transformation in skia method
*/

export class convertPixiContainerToSkia {
  private ck: any;

  constructor(canvasKit: CanvasKit) {
    this.ck = canvasKit;
  }

  /*
    converts HEX color
    Skia embraces colors 0.0 ~ 1.0
  */
  private hexToRgba(hex: number | string, alpha: number): Float32Array {
    // parsing number and knock in bit
    const num =
      typeof hex === "string" ? parseInt(hex.replace("#", ""), 16) : hex;

    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;

    return new Float32Array([r, g, b, alpha]);
  }

  // take geometry pixi and drawing in canvas skia
  private drawShape(canvas: Canvas, shape: any, paint: Paint): void {
    // circle
    if (shape instanceof PIXI.Rectangle) {
      canvas.drawRect(
        this.ck.XYWHRect(shape.x, shape.y, shape.width, shape.height),
        paint,
      );

      // square
    } else if (shape instanceof PIXI.Ellipse) {
      const rect = this.ck.XYWHRect(
        shape.x - shape.width,
        shape.y - shape.height,
        shape.width * 2,
        shape.height * 2,
      );
      canvas.drawOval(rect, paint);

      // and line
    } else if (
      shape &&
      ("points" in shape || shape.type === PIXI.SHAPES.POLY)
    ) {
      const points = shape.points as number[];
      if (!points || points.length < 4) return;
      const skiaPath = new this.ck.Path() as any;
      skiaPath.moveTo(points[0], points[1]);

      for (let i = 2; i < points.length; i += 2) {
        skiaPath.lineTo(points[i], points[i + 1]);
      }

      canvas.drawPath(skiaPath, paint);
      skiaPath.delete(); // clean
    }
  }


}

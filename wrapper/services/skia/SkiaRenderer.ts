import { Canvas, CanvasKit, Paint } from "canvaskit-wasm";
import * as PIXI from "pixi.js";
import { toast } from "sonner"

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

  // take instruction PIXI.Graphics and use in skia
  private drawGraphics(canvas: Canvas, graphics: PIXI.Graphics): void {
    const graphicsData = graphics.geometry.graphicsData;

    // paint this is marker for graphics
    const paint = new this.ck.Paint();
    paint.setAntiAlias(true);

    graphicsData.forEach((data) => {
      const { shape, fillStyle, lineStyle } = data;

      // background
      if (fillStyle && fillStyle.visible) {
        paint.setStyle(this.ck.PaintStyle.Fill);
        paint.setColor(this.hexToRgba(fillStyle.color, fillStyle.alpha));
        this.drawShape(canvas, shape, paint);
      }

      /*
        if shape have border, swipe for stroke
        add width and rendering
      */
      if (lineStyle && lineStyle.visible && lineStyle.width > 0) {
        paint.setStyle(this.ck.PaintStyle.Stroke);
        paint.setStrokeWidth(lineStyle.width);
        paint.setColor(this.hexToRgba(lineStyle.color, lineStyle.alpha));
        this.drawShape(canvas, shape, paint);
      }
    });

    paint.delete();
  }

  private renderObject(canvas: Canvas, obj: PIXI.DisplayObject): void {
    if (!obj.visible || obj.alpha === 0) return;

    canvas.save();

    const matrix = obj.transform.localTransform;
    canvas.concat([
      matrix.a,
      matrix.c,
      matrix.tx,
      matrix.b,
      matrix.d,
      matrix.ty,
      0,
      0,
      1
    ]);

    if (obj instanceof PIXI.Graphics) {
      this.drawGraphics(canvas, obj);
    }

    if (obj instanceof PIXI.Container && obj.children.length > 0) {
      obj.children.forEach((child) => this.renderObject(canvas, child));
    }

    canvas.restore();
  }

  public renderContainer(canvas: Canvas, container: PIXI.Container): void {
    this.renderObject(canvas, container);
  }

  public exportToPDF(container: PIXI.Container, fileName: string): void {

    if (!this.ck.MakePDFDocument) {
      toast.info("The current build does not include the PDF backend")
      return;
    }

    const doc = this.ck.MakePDFDocument();
    if (!doc) return;

    // open page
    const canvas = doc.beginPage(800, 600);
    if (canvas) {
      this.renderContainer(canvas, container);
      doc.endPage();
    }
    const data = doc.endDoc();
    doc.delete();

    if (data) {
      // conversion bit
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}

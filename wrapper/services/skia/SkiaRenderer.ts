import { Canvas, CanvasKit, Paint } from "canvaskit-wasm";
import * as PIXI from "pixi.js";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

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
      1,
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
    try {
      /*
      testing the native SkPDF backend
      (in case the testers are using a custom build)
     */
      const makePDF =
        (this.ck as any).MakePDFDocument || (this.ck as any).CreatePDFWStream;
      if (makePDF && (this.ck as any).DynamicMemoryWStream) {
        const stream = new (this.ck as any).DynamicMemoryWStream();
        const doc = (this.ck as any).CreatePDFWStream
          ? (this.ck as any).CreatePDFWStream(stream)
          : makePDF(stream);

        if (doc) {
          const canvas = doc.beginPage(800, 600);
          if (canvas) {
            this.renderContainer(canvas, container);
            doc.endPage();
          }
          doc.endDoc();
          const data = stream.detachAsData().toTypedArray();
          stream.delete();
          doc.delete();

          if (data && data.length > 0) {
            this.downloadBlob(data, fileName);
            return;
          }
        }
      }
      /*
        rendering a Skia scene into a
        stream of text coordinates in SVG format
      */
      const bounds = this.ck.LTRBRect(0, 0, 800, 600);
      const recorder = new this.ck.PictureRecorder();
      const recordingCanvas = recorder.beginRecording(bounds);

      const bgPaint = new this.ck.Paint();
      bgPaint.setColor(this.hexToRgba(0xffffff, 1)); // fill background with white in the vector image
      recordingCanvas.drawRect(bounds, bgPaint);
      bgPaint.delete();

      this.renderContainer(recordingCanvas, container); // render the objects

      const picture = recorder.finishRecordingAsPicture();
      recorder.delete();

      const svgString = (this.ck as any).MakeSVGCanvas ? "built-in" : null; // extract clean string of XML-SVG vector specification

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 600],
        compress: true,
      });

      // transferring vector elements to jsPDF
      if (picture && (picture as any).toSVGString) {
        const svgText = (picture as any).toSVGString();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgEl = svgDoc.documentElement;
        doc.svg(svgEl, { x: 0, y: 0, width: 800, height: 600 });
        picture.delete();
      } else {
        picture.delete();
        const upscaleFactor = 4;
        const hdSurface = this.ck.MakeSurface(
          800 * upscaleFactor,
          600 * upscaleFactor,
        );

        if (hdSurface) {
          const hdCanvas = hdSurface.getCanvas();
          hdCanvas.scale(upscaleFactor, upscaleFactor);

          const hdBgPaint = new this.ck.Paint();
          hdBgPaint.setColor(this.hexToRgba(0xffffff, 1));
          hdCanvas.drawRect(bounds, hdBgPaint);
          hdBgPaint.delete();

          this.renderContainer(hdCanvas, container);
          hdSurface.flush();

          const hdImage = hdSurface.makeImageSnapshot();
          if (hdImage) {
            const pixelBytes = hdImage.readPixels(0, 0, {
              width: 800 * upscaleFactor,
              height: 600 * upscaleFactor,
              colorType: this.ck.ColorType.RGBA_8888,
              alphaType: this.ck.AlphaType.Unpremul,
              colorSpace: this.ck.ColorSpace.SRGB,
            });
            hdImage.delete();

            if (pixelBytes) {
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = 800 * upscaleFactor;
              tempCanvas.height = 600 * upscaleFactor;
              const tempCtx = tempCanvas.getContext("2d");
              if (tempCtx) {
                const imgData = tempCtx.createImageData(
                  800 * upscaleFactor,
                  600 * upscaleFactor,
                );
                imgData.data.set(pixelBytes);
                tempCtx.putImageData(imgData, 0, 0);

                const dataUrl = tempCanvas.toDataURL("image/png");
                doc.addImage(dataUrl, "PNG", 0, 0, 800, 600, undefined, "SLOW");
              }
            }
          }
          hdSurface.delete();
        }
      }

      doc.save(`${fileName}.pdf`);
      toast.success("Completed");
    } catch (error) {
      toast.error("Error");
    }
  }
}

import * as PIXI from "pixi.js-legacy";
import { toast } from "sonner"

export class PixiManager {
  private createDemoScene(): void {
    if (!this.mainContainer) return;

    const subContainer = new PIXI.Container();

    const g3 = new PIXI.Graphics();
    const g4 = new PIXI.Graphics();

    // red circle
    const g1 = new PIXI.Graphics();
    g1.beginFill(0xff0000);
    g1.drawEllipse(0, 0, 200, 100);
    g1.endFill();
    g1.position.set(200, 100);

    g1.interactive = true;
    g1.on("pointerdown", () => {
      console.log("g1!");
    });

    // blue square
    const g2 = new PIXI.Graphics();
    g2.beginFill(0x0000ff);
    g2.drawRect(-50, -75, 100, 150);
    g2.endFill();
    g2.position.set(120, 60);

    g2.interactive = true;
    g2.on("pointerdown", () => {
      console.log("g2!");
    });

    g3.lineStyle(10, "#ffffff", 1).moveTo(0, 0).lineTo(150, 100);
    g3.angle = -20;

    g3.interactive = true;
    g3.on("pointerdown", () => {
      console.log("g3!");
    });

    g4.lineStyle(10, "#ffff00", 1).moveTo(0, 70).lineTo(150, -30);
    g4.angle = 20;

    g4.interactive = true;
    g4.on("pointerdown", () => {
      console.log("g4!");
    });

    this.mainContainer.addChild(subContainer, g1, g2);
    subContainer.addChild(g3, g4);
    subContainer.position.set(75, 50);
  }

  // object scene
  public app: PIXI.Application | null = null;
  public mainContainer: PIXI.Container | null = null;

  public isModificationAllowed: boolean = true;

  public init(container: HTMLDivElement): void {
    // canvas
    this.app = new PIXI.Application({
      width: 500,
      height: 400,
      backgroundColor: 0xe4e4e7,
      forceCanvas: true, // 2d
    });

    container.appendChild(this.app.view as unknown as Node); //add canvas

    // container for shapes
    this.mainContainer = new PIXI.Container();
    this.mainContainer.interactive = true;
    this.app.stage.addChild(this.mainContainer);

    this.loadScene("empty");
  }

  // swipe scene
  public loadScene(sceneType: string): void {
    if (!this.mainContainer) return;

    this.mainContainer.removeChildren();

    if (sceneType === "empty") {
      this.isModificationAllowed = true;
      toast.info("A blank canvas has been loaded. Adding shapes is allowed")
    } else {
      this.isModificationAllowed = false;
      toast.info("The finished layout has been uploaded. Adding is blocked")


      if (sceneType === "scene1") {
        this.generateStaticSceneOne();
      } else if (sceneType === "scene2") {
        this.generateStaticSceneTwo();
      }
    }
  }

  // canvas one
  private generateStaticSceneOne(): void {
    const subContainer = new PIXI.Container();
    const g3 = new PIXI.Graphics();
    const g4 = new PIXI.Graphics();

    const g1 = new PIXI.Graphics();
    g1.beginFill(0xff0000).drawEllipse(0, 0, 120, 60).endFill();
    g1.position.set(150, 150);
    g1.angle = 45;

    const g2 = new PIXI.Graphics();
    g2.beginFill(0x0000ff).drawRect(-30, -30, 60, 60).endFill();
    g2.position.set(350, 250);

    g3.lineStyle(10, "#ffffff", 1).moveTo(0, 0).lineTo(150, 100);
    g3.angle = -20;

    g3.interactive = true;
    g3.on("pointerdown", () => {
      console.log("g3!");
    });

    g4.lineStyle(10, "#ffff00", 1).moveTo(0, 70).lineTo(150, -30);
    g4.angle = 20;

    g4.interactive = true;
    g4.on("pointerdown", () => {
      console.log("g4!");
    });
    this.mainContainer?.addChild(subContainer, g1, g2);
    subContainer.addChild(g3, g4);
    subContainer.position.set(75, 50);
  }

  // canvas two
  private generateStaticSceneTwo(): void {
    const subContainer = new PIXI.Container();
    const g3 = new PIXI.Graphics();
    const g4 = new PIXI.Graphics();

    const g1 = new PIXI.Graphics();
    g1.beginFill(0x16a34a).drawRect(0, 0, 200, 40).endFill();
    g1.position.set(150, 80);
    g1.angle = -10;

    const g2 = new PIXI.Graphics();
    g2.beginFill(0x9333ea).drawEllipse(0, 0, 50, 50).endFill();
    g2.position.set(250, 250);

    g3.lineStyle(10, "#ffffff", 1).moveTo(0, 0).lineTo(150, 100);
    g3.angle = -20;

    g3.interactive = true;
    g3.on("pointerdown", () => {
      console.log("g3!");
    });

    g4.lineStyle(10, "#ffff00", 1).moveTo(0, 70).lineTo(150, -30);
    g4.angle = 20;

    g4.interactive = true;
    g4.on("pointerdown", () => {
      console.log("g4!");
    });

    this.mainContainer?.addChild(subContainer, g1, g2);
    subContainer.addChild(g3, g4);
    subContainer.position.set(75, 50);
  }

  public addRandomShape(): void {

    if (!this.mainContainer) return;
    if (!this.isModificationAllowed) return;

    const g = new PIXI.Graphics();
    const colors = [0xe11d48, 0x2563eb, 0x16a34a, 0xca8a04, 0x9333ea];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    g.beginFill(randomColor);
    if (Math.random() > 0.5) {
      // random width and height for square
      g.drawRect(0, 0, 80 + Math.random() * 70, 50 + Math.random() * 50);
    } else {
      // circle
      g.drawEllipse(0, 0, 40 + Math.random() * 40, 30 + Math.random() * 30);
    }
    g.endFill();

    g.position.set(100 + Math.random() * 300, 100 + Math.random() * 200); // random point
    g.angle = Math.random() * 360; // random turn

    g.interactive = true;
    g.on("pointerdown", () => {
      console.log(`%c[Pixi] #${randomColor.toString(16)}`, `color: #10b981; font-weight: bold;`);
    });

    this.mainContainer.addChild(g);

  }

  public destroy(): void {
    /*
      deletes the scene
      and frees up memory
    */
    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
      this.mainContainer = null;
    }
  }
}
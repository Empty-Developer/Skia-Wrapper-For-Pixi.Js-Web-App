import * as PIXI from 'pixi.js-legacy';

export class PixiManager {
  /*
    TODO:
      * draw the initial shapes
      * add random shapes
      * respond to clicks on the shapes
      * clear everything when closing
  */ 

  private createDemoScene(): void {
    if (!this.mainContainer) return;

    const subContainer = new PIXI.Container()

    const g3 = new PIXI.Graphics()
    const g4 = new PIXI.Graphics()

    // red circle
    const g1 = new PIXI.Graphics();
    g1.beginFill(0xff0000);
    g1.drawEllipse(0, 0, 200, 100);
    g1.endFill();
    g1.position.set(200, 100);

    // blue square
    const g2 = new PIXI.Graphics();
    g2.beginFill(0x0000ff);
    g2.drawRect(-50, -75, 100, 150);
    g2.endFill();
    g2.position.set(120, 60);

    g3.lineStyle(10, '#ffffff', 1)
      .moveTo(0, 0).lineTo(150, 100)
    g3.angle = -20


    g4.lineStyle(10, '#ffff00', 1)
      .moveTo(0, 70).lineTo(150, -30)
    g4.angle = 20

    
    this.mainContainer.addChild(subContainer, g1, g2);
    subContainer.addChild(g3, g4)
    subContainer.position.set(75, 50)
  }

  // object scene
  public app: PIXI.Application | null = null;
  public mainContainer: PIXI.Container | null = null;

  public init(container: HTMLDivElement): void { // canvas
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

    this.createDemoScene();
  }
}
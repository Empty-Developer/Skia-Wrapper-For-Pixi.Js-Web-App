import * as PIXI from 'pixi.js-legacy';

export class PixiManager {
  /*
    TODO:
      * create a drawing area
      * draw the initial shapes
      * add random shapes
      * respond to clicks on the shapes
      * clear everything when closing
  */ 

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
  }
}
import { CanvasKit } from 'canvaskit-wasm';
/*
  TODO: 
    create main class, create constructor 
    and basic function for conversions colors

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
    const num = typeof hex === 'string' ? parseInt(hex.replace('#', ''), 16) : hex;
    
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    
    return new Float32Array([r, g, b, alpha]);
  }
}
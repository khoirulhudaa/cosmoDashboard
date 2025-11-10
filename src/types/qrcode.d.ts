// src/types/qrcode.d.ts
declare module 'qrcode' {
  interface QRCodeRenderersOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    image?: string;
    imageOptions?: {
      width?: number;
      height?: number;
      margin?: number;
      crossOrigin?: string;
    };
  }

  export function toDataURL(
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<string>;

  export function toCanvas(
    canvas: HTMLCanvasElement | string,
    text: string,
    options?: QRCodeRenderersOptions
  ): Promise<void>;
}
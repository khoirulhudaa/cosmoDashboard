// src/types/html-docx-js.d.ts
declare module "html-docx-js/dist/html-docx" {
  export function asBlob(
    html: string,
    options?: {
      orientation?: "portrait" | "landscape";
      margins?: { top?: number; bottom?: number; left?: number; right?: number };
    }
  ): Blob;
}
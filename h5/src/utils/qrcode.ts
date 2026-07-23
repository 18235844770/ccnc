/**
 * 推广链接二维码（H5）
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import UQRCode from "uqrcodejs";

export function buildQrDataUrl(text: string, size = 220): string {
  const qr = new UQRCode();
  qr.data = text;
  qr.size = size;
  qr.make();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  qr.canvasContext = ctx;
  qr.drawCanvas();
  return canvas.toDataURL("image/png");
}

export function downloadQrDataUrl(dataUrl: string, filename = "promo-qrcode.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

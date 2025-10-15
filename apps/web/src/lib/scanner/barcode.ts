export type BarcodeResult = { raw: string; kind:'qr'|'code128'|'ean13'|'unknown' };

export async function decodeFrame(_canvas: HTMLCanvasElement): Promise<BarcodeResult|null> {
  // Заглушка: в реале подключить wasm-движок (zxing/quirc). Здесь имитируем пусто.
  return null;
}



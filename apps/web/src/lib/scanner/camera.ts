export async function ensureCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Камера недоступна');
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
}

export async function stopStream(s?: MediaStream) {
  s?.getTracks().forEach(t => t.stop());
}



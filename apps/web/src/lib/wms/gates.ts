// Вычисляются на основе данных WMS и подмешиваются в S15 -> api.fetchGates()
export async function calcReconcileGate(orderId: string) {
  // true если нет незакрытых расхождений
  return true;
}
export async function calcPackedGate(orderId: string) {
  // true если все позиции упакованы и размещены (или готовы к отгрузке)
  return true;
}


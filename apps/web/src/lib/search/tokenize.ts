export function normalize(q: string) {
  return q.trim().replace(/\s+/g,' ').toUpperCase();
}

// Извлекает маркеры: BR-xxxxxx, REQ-xxx, LPxxxxxx, номера телефонов, pdf/xlsx
export function extractMarkers(q: string) {
  const up = normalize(q);
  const markers: string[] = [];
  const re = [
    /(BR-\d{6})/g,
    /(REQ-\d{2,})/g,
    /(LP\d{6,})/g,
    /(\+?\d{10,12})/g,
    /(SHP_[A-Z0-9]+)/g
  ];
  re.forEach(r => { let m; while ((m = r.exec(up))) markers.push(m[1]); });
  return markers;
}



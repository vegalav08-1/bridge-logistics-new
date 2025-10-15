'use client';
import { useEffect, useRef, useState } from 'react';
import { decodeFromVideo } from './decode';

export function useScanner() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let tid: any;
    const loop = async () => {
      if (ref.current) {
        const v = await decodeFromVideo(ref.current);
        if (v) setValue(v);
      }
      tid = setTimeout(loop, 300);
    };
    loop();
    return () => clearTimeout(tid);
  }, [active]);

  return { ref, active, setActive, value, setValue };
}


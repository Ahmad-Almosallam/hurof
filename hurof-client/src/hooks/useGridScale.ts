import { useState, useEffect } from 'react';

const HEX_W_N = 110;
const HEX_H_N = HEX_W_N * 1.1547;
const HEX_ROW_STEP_N = HEX_H_N * 0.75 - 1;
const EDGE_TOTAL = (12 + 6) * 2;

export function computeNaturalSize(gridSize: number) {
  return {
    w: gridSize * HEX_W_N + HEX_W_N / 2 + EDGE_TOTAL,
    h: HEX_ROW_STEP_N * gridSize + (HEX_H_N - HEX_ROW_STEP_N) + EDGE_TOTAL,
  };
}

export function useGridScale(el: HTMLDivElement | null, gridSize: number) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!el) return;
    const { w, h } = computeNaturalSize(gridSize);
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setScale(Math.max(Math.min(width / w, height / h, 1), 0.3));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, gridSize]);
  return scale;
}

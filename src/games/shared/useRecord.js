import { useCallback, useState } from 'react';

export const readRecord = (key) => {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
};

// Récord persistente por juego. `submit` solo guarda si mejora y devuelve si fue récord.
export function useRecord(key) {
  const [record, setRecord] = useState(() => readRecord(key));

  const submit = useCallback(
    (value) => {
      const best = readRecord(key);
      if (value <= best) return false;
      try {
        localStorage.setItem(key, String(Math.round(value)));
      } catch {
        /* sin almacenamiento: el récord dura lo que la sesión */
      }
      setRecord(Math.round(value));
      return true;
    },
    [key],
  );

  return [record, submit];
}

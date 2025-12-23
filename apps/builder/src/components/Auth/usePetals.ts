import { useMemo } from 'react';

const petalColors = ['#f5d0d3', '#e8b4b8', '#fce4e2', '#d4969c', '#c9a1a6'];

interface Petal {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: number;
  color: string;
}

const generatePetals = (count: number = 10): Petal[] =>
  [...Array(count)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${15 + Math.random() * 10}s`,
    size: 14 + Math.random() * 10,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
  }));

export function usePetals(count: number = 10): Petal[] {
  return useMemo(() => generatePetals(count), [count]);
}


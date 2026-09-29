export function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

export function round(
  value: number,
  digits = 4,
): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function median(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort(
    (first, second) => first - second,
  );

  const middle = Math.floor(
    sorted.length / 2,
  );

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (
    sorted[middle - 1] +
    sorted[middle]
  ) / 2;
}

export function normalizeThree(
  home: number,
  draw: number,
  away: number,
) {
  const total = home + draw + away;

  if (total <= 0) {
    return {
      home: 1 / 3,
      draw: 1 / 3,
      away: 1 / 3,
    };
  }

  return {
    home: home / total,
    draw: draw / total,
    away: away / total,
  };
}

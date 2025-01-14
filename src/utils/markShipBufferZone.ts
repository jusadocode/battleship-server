export const markShipBufferZone = (
  bufferZone: number[][],
  coordinates: number[][],
  gridSize: number
) => {
  coordinates.forEach(([row, col]) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row - 1 + i;
        const newCol = col - 1 + j;

        if (
          newRow >= 0 &&
          newRow < gridSize &&
          newCol >= 0 &&
          newCol < gridSize
        ) {
          bufferZone[newRow][newCol] = 1;
        }
      }
    }
  });
};

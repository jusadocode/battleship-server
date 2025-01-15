import { Ship, ShipInfo } from "../types/types";
import { ships } from "../constants/gameConstants";
import { markShipBufferZone } from "./markShipBufferZone";

const generateShips = (grid: number[][]) => {
  const gridSize = grid.length;
  const shipPlacements: Map<string, string> = new Map();
  const shipObjects: Map<string, Ship> = new Map();

  const bufferZone = Array.from({ length: grid.length }, () =>
    Array(grid[0].length).fill(0)
  );

  const MAX_RETRIES = 100; // Maximum retries for a single ship placement attempt
  const placeShip = (ship: ShipInfo) => {
    let amountPlaced = 0;
    let retries = 0;

    while (amountPlaced < ship.amount) {
      if (retries > MAX_RETRIES) {
        console.warn(
          `Failed to place all ships after ${MAX_RETRIES} attempts. Aborting placement for ship: ${ship.name}`
        );
        break;
      }

      const isHorizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);

      let validPlacement = true;
      const coordinates: [number, number][] = [];

      for (let i = 0; i < ship.size; i++) {
        const newRow = (isHorizontal ? row : row + i) + 1;
        const newColumn = (isHorizontal ? col + i : col) + 1;

        if (
          newRow > gridSize ||
          newColumn > gridSize ||
          bufferZone[newRow - 1]?.[newColumn - 1] === 1 ||
          grid[newRow - 1]?.[newColumn - 1] === 1 ||
          shipPlacements.has(`${newRow}-${newColumn}`)
        ) {
          validPlacement = false;
          break;
        }

        coordinates.push([newRow, newColumn]);
      }

      if (validPlacement) {
        const shipId = `${ship.name}-${amountPlaced}`;

        shipObjects.set(shipId, {
          name: ship.name,
          coordinates: coordinates,
          health: ship.size,
        });

        coordinates.forEach((entry) => {
          shipPlacements.set(
            `${entry[0]}-${entry[1]}`,
            `${ship.name}-${amountPlaced}`
          );
        });

        amountPlaced++;
        markShipBufferZone(bufferZone, coordinates, gridSize);
      }

      retries++;
    }
  };

  ships.forEach(placeShip);

  return { coordinateMap: shipPlacements, shipMap: shipObjects };
};

export default generateShips;

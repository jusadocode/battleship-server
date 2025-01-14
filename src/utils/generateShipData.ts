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
  const placeShip = (ship: ShipInfo) => {
    let amountPlaced = 0;

    while (amountPlaced < ship.amount) {
      const isHorizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);

      let validPlacement = true;
      const coordinates = [];

      for (let i = 0; i < ship.size; i++) {
        const newRow = (isHorizontal ? row : row + i) + 1;
        const newCollumn = (isHorizontal ? col + i : col) + 1;

        if (
          bufferZone[newRow - 1][newCollumn - 1] === 1 ||
          newRow >= gridSize ||
          newCollumn >= gridSize ||
          grid[newRow - 1][newCollumn - 1] === 1 ||
          shipPlacements.has(`${newRow}-${newCollumn}`)
        ) {
          validPlacement = false;
          break;
        }

        coordinates.push([newRow, newCollumn]);
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
    }
  };

  ships.forEach(placeShip);

  return { coordinateMap: shipPlacements, shipMap: shipObjects };
};

export default generateShips;

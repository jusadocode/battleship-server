import { ShipInfo } from "../types/types";

export const boardWidth = 10;
export const boardHeight = 10;
export const bulletAmount = 25;

export const boardLayout: number[][] = Array.from({ length: boardHeight }, () =>
  Array(boardWidth).fill(0)
);

export const ships: ShipInfo[] = [
  { name: "Carrier", size: 5, amount: 1 },
  { name: "Battleship", size: 4, amount: 1 },
  { name: "Destroyer", size: 3, amount: 2 },
  { name: "Submarine", size: 2, amount: 3 },
  { name: "Patrol Boat", size: 1, amount: 3 },
];

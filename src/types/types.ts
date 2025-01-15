export interface ShipInfo {
  name: string;
  size: number;
  amount: number;
}

export interface Ship {
  name: string;
  coordinates: number[][];
  health: number;
}

export interface GameState {
  shipMap: Map<string, Ship>;
  coordinateMap: Map<string, string>;
  hitsCount: number;
  bulletsCount: number;
  markedData: Map<string, number>;
  gameEnded: boolean;
}

export interface ShootRequest {
  gameId: string;
  coordinates: {
    x: number;
    y: number;
  };
}

export interface ShotResponse {
  hit: boolean;
  shipDestroyed: Ship | null;
}

export interface EndGameRequest {
  gameId: string;
}

export interface EndGameResponse {
  coordinateMap: { [key: string]: string };
  hitsCount: number;
  bulletsCount: number;
}

export interface ErrorResponse {
  error: string;
}

export interface GameCreatedResponse {
  gameId: string;
}

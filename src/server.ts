import express, { Request, Response } from "express";

import cors from "cors";
import {
  GameCreatedResponse,
  GameState,
  ShootRequest,
  ShotResponse,
  ErrorResponse,
} from "./types/types";
import { boardLayout, bulletAmount } from "./constants/gameConstants";
import generateShips from "./utils/generateShipData";
import { PORT } from "./constants/serverConstants";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("../dist"));

const activeGames: Map<string, GameState> = new Map();

app.listen(PORT, () => {
  console.log(`Battleships server is running on port ${PORT}`);
});

app.post(
  "/api/game/new",
  (req: Request, res: Response<GameCreatedResponse | ErrorResponse>) => {
    const gameId: string = Date.now().toString();
    const { coordinateMap, shipMap } = generateShips(boardLayout);

    if (!coordinateMap || !shipMap) {
      res.status(400).json({ error: "Error generating ship placements" });
    }

    const gameState: GameState = {
      shipMap: shipMap,
      coordinateMap: coordinateMap,
      hitsCount: 0,
      bulletsCount: bulletAmount,
      markedData: new Map(),
      gameEnded: false,
    };

    activeGames.set(gameId, gameState);

    const response = { gameId };

    console.log(`Game initiated, game ID: ${gameId}`);
    res.status(200).json(response);
  }
);

app.post(
  "/api/game/shoot",
  (req: Request<ShootRequest>, res: Response<ShotResponse | ErrorResponse>) => {
    const { gameId, x, y } = req.body;

    console.log("Active games:" + activeGames);

    const gameState = activeGames.get(gameId);

    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    if (gameState.markedData.has(`${x}-${y}`)) {
      res.status(400).json({ error: "Already shot at this position" });
      return;
    }

    gameState.markedData.set(`${x}-${y}`, 1);

    const shipId = gameState.coordinateMap.get(`${x}-${y}`);

    const response: ShotResponse = {
      hit: false,
      shipDestroyed: null,
    };

    if (!shipId) {
      gameState.bulletsCount--;
      res.status(200).json(response);
      return;
    }

    const shipDamaged = gameState.shipMap.get(shipId);
    if (shipDamaged) {
      shipDamaged.health--;

      if (shipDamaged.health === 0) {
        response.hit = true;
        response.shipDestroyed = { ...shipDamaged };
      } else {
        response.hit = true;
      }
    }

    gameState.bulletsCount--;

    res.status(200).json(response);
    return;
  }
);

import express, { Request, Response } from "express";

import cors from "cors";
import {
  GameCreatedResponse,
  GameState,
  ShootRequest,
  ShotResponse,
  ErrorResponse,
  EndGameResponse,
  EndGameRequest,
} from "./types/types";
import { boardLayout, bulletAmount } from "./constants/gameConstants";
import generateShips from "./utils/generateShipData";
import { PORT } from "./constants/serverConstants";
import { serializeMap } from "./utils/mapUtils";

const app = express();

app.use(cors());
app.use(express.json());

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
      return;
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
    return;
  }
);

app.post(
  "/api/game/shoot",
  (req: Request<ShootRequest>, res: Response<ShotResponse | ErrorResponse>) => {
    const { gameId, coordinates } = req.body;

    const gameState = activeGames.get(gameId);

    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const shotKey = `${coordinates.x}-${coordinates.y}`;

    if (gameState.markedData.has(shotKey)) {
      res.status(400).json({ error: "Already shot at this position" });
      return;
    }

    gameState.markedData.set(shotKey, 1);

    const response: ShotResponse = {
      hit: false,
      shipDestroyed: null,
    };

    const shipId = gameState.coordinateMap.get(shotKey);
    if (shipId) {
      const shipDamaged = gameState.shipMap.get(shipId);
      if (shipDamaged) {
        shipDamaged.health--;
        gameState.hitsCount++;

        response.hit = true;
        if (shipDamaged.health === 0) {
          response.shipDestroyed = { ...shipDamaged };
        }
      }
    } else {
      gameState.bulletsCount--;
    }

    if (gameState.hitsCount === 24) {
      gameState.gameEnded = true;
      console.log(`Game ${gameId} ended: All ships destroyed.`);
    } else if (gameState.bulletsCount === 0) {
      gameState.gameEnded = true;
      console.log(`Game ${gameId} ended: No bullets left.`);
    }

    activeGames.set(gameId, gameState);

    res.status(200).json(response);
    return;
  }
);

app.post(
  "/api/game/endgame",
  (
    req: Request<EndGameRequest>,
    res: Response<EndGameResponse | ErrorResponse>
  ) => {
    const { gameId } = req.body;

    const gameState = activeGames.get(gameId);

    if (!gameState) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    if (!gameState.gameEnded) {
      res.status(400).json({ error: "Game is not finished" });
      return;
    }

    const responseState: EndGameResponse = {
      coordinateMap: serializeMap(gameState.coordinateMap),
      hitsCount: gameState.hitsCount,
      bulletsCount: gameState.bulletsCount,
    };

    res.status(200).json(responseState);
    return;
  }
);

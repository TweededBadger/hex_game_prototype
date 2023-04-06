import VectorNoiseGenerator from "atlas-vector-noise";

import { HexGrid } from "./HexGrid";
import { Hex, HexType, hexTypes } from "./Hex";
import { Player } from "./Player";

const thresholds: Record<number, HexType> = {
  0.4: "SEA",
  0.45: "SAND",
  0.7: "GRASS",
  0.8: "WOODS",
  1: "DEEP_WOODS"
};

export class Main {
  private gridSize: number;
  private hexTypes: Map<string, HexType>;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.hexTypes = this.generateHexTypes(this.gridSize);
  }

  public start(): void {
    const hexSize = 15;

    const hexGrid = new HexGrid(hexSize);

    hexGrid.renderGrid(this.gridSize, this.hexTypes);

    const player = new Player(new Hex(0, 0));
    const { offsetX, offsetY } = hexGrid.calculateOffset(this.gridSize);
    hexGrid.renderPlayer(player, offsetX, offsetY);

    hexGrid.canvas.addEventListener("click", (event) => {
      this.handleClick(event, hexGrid, player);
    });
  }
  private handleClick(
    event: MouseEvent,
    hexGrid: HexGrid,
    player: Player
  ): void {
    const rect = hexGrid.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { offsetX, offsetY } = hexGrid.calculateOffset(this.gridSize);
    const hex = hexGrid.pixelToHex(x - offsetX, y - offsetY);

    const hexKey = hex.toString();
    const type = this.hexTypes.get(hexKey);

    if (type === "SEA") return;

    console.log(type);
    if (player.hex.isAdjacent(hex)) {
      player.moveTo(hex);
      hexGrid.renderGrid(this.gridSize, this.hexTypes);
      hexGrid.renderPlayer(player, offsetX, offsetY);
    }
  }

  private getRandomHexType(): HexType {
    const rand = Math.random();
    const index = Math.floor(rand * hexTypes.length);
    return hexTypes[index];
  }

  private getHexTypeFromNoise(noiseValue: number): HexType {
    const sortedThresholds = Object.keys(thresholds)
      .map(parseFloat)
      .sort((a, b) => a - b);

    const normalizedNoiseValue = (noiseValue + 1) / 2; // Normalize the noise value to the range [0, 1]

    for (let i = 0; i < sortedThresholds.length; i++) {
      const threshold = sortedThresholds[i];
      if (noiseValue < threshold) {
        return thresholds[threshold];
      }
    }

    return thresholds[sortedThresholds[sortedThresholds.length - 1]];
  }

  // Convert axial coordinates to cube coordinates
  private axialToCube(hex: Hex): { x: number; y: number; z: number } {
    const x = hex.q;
    const z = hex.r;
    const y = -x - z;
    return { x, y, z };
  }

  private generateHexTypes(gridSize: number): Map<string, HexType> {
    const smallSquareGrid = new VectorNoiseGenerator(10);
    const noiseSize = 400;
    const scaleFactor = 10;

    const hexTypes = new Map<string, HexType>();

    for (let q = -gridSize; q <= gridSize; q++) {
      for (
        let r = Math.max(-gridSize, -q - gridSize);
        r <= Math.min(gridSize, -q + gridSize);
        r++
      ) {
        const hex = new Hex(q, r);
        const cube = this.axialToCube(hex);
        const x = Math.round(cube.x + gridSize);
        const y = Math.round(cube.y + gridSize);
        const noiseValue = smallSquareGrid.getPixel(
          x / scaleFactor,
          y / scaleFactor
        );
        // console.log({ x, y, noiseValue });
        // const noiseValue = 0;
        const hexType = this.getHexTypeFromNoise(noiseValue);
        const hexKey = hex.toString();
        hexTypes.set(hexKey, hexType);
      }
    }

    return hexTypes;
  }
}

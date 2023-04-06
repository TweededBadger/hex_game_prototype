import { Hex, HexType } from "./Hex";
import { Player } from "./Player";

const typeColors: Record<HexType, string> = {
  GRASS: "#00d04e",
  ROAD: "gray",
  SEA: "blue",
  WOODS: "#019437",
  DEEP_WOODS: "#00451a",
  SAND: "yellow"
};

export class HexGrid {
  private hexSize: number;
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(hexSize: number) {
    this.hexSize = hexSize;
    this.canvas = document.getElementById(
      "hex-grid-canvas"
    ) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  // Render a single hex cell
  private renderHex(
    hex: Hex,
    offsetX: number,
    offsetY: number,
    hexType: HexType
  ): void {
    const { x, y } = hex.toPixel(this.hexSize);
    const centerX = x + offsetX;
    const centerY = y + offsetY;

    const points = this.calculateHexPoints(centerX, centerY, this.hexSize);
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }

    const color = typeColors[hexType];
    // console.log(color);

    this.ctx.closePath();
    this.ctx.fillStyle = typeColors[hexType];
    this.ctx.fill();
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
  }

  // Calculate the points of a hexagon
  private calculateHexPoints(
    centerX: number,
    centerY: number,
    size: number
  ): { x: number; y: number }[] {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = ((2 * Math.PI) / 6) * i + Math.PI / 6; // Start at 30 degrees
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }

  public renderPlayer(player: Player, offsetX: number, offsetY: number): void {
    const { x, y } = player.hex.toPixel(this.hexSize);
    const centerX = x + offsetX;
    const centerY = y + offsetY;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.hexSize / 3, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = "red";
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
  }

  public calculateOffset(
    gridSize: number
  ): { offsetX: number; offsetY: number } {
    const minQ = -gridSize;
    const maxQ = gridSize;
    const minR = -gridSize;
    const maxR = gridSize;

    const topLeft = new Hex(minQ, minR).toPixel(this.hexSize);
    const bottomRight = new Hex(maxQ, maxR).toPixel(this.hexSize);

    const gridWidth = bottomRight.x - topLeft.x;
    const gridHeight = bottomRight.y - topLeft.y;
    const offsetX = (this.canvas.width - gridWidth) / 2 - topLeft.x;
    const offsetY = (this.canvas.height - gridHeight) / 2 - topLeft.y;

    return { offsetX, offsetY };
  }

  public *iterateGrid(gridSize: number): Generator<Hex> {
    for (let q = -gridSize; q <= gridSize; q++) {
      for (
        let r = Math.max(-gridSize, -q - gridSize);
        r <= Math.min(gridSize, -q + gridSize);
        r++
      ) {
        const hex = new Hex(q, r);
        yield hex;
      }
    }
  }

  // Render the hex grid on the canvas
  public renderGrid(gridSize: number, hexTypes: any): void {
    const { offsetX, offsetY } = this.calculateOffset(gridSize);

    const result = this.iterateGrid(gridSize);
    // debugger;

    for (const hex of this.iterateGrid(gridSize)) {
      const hexKey = hex.toString();
      const type = hexTypes.get(hexKey);
      this.renderHex(hex, offsetX, offsetY, type);
    }
  }
  public pixelToHex(x: number, y: number): Hex {
    const q = ((x * Math.sqrt(3)) / 3 - y / 3) / this.hexSize;
    const r = (y * 2) / 3 / this.hexSize;
    return new Hex(q, r).round();
  }
}

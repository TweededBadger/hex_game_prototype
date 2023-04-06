import { Hex } from "./Hex";

export class Player {
  public hex: Hex;

  constructor(startingHex: Hex) {
    this.hex = startingHex;
  }

  moveTo(hex: Hex): void {
    this.hex = hex;
  }
}

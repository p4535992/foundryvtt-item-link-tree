import { getItemSync } from "./lib";

export class DaeHelpers {
  static isDaeModuleActive() {
    return game.modules.get("dae")?.active;
  }
}

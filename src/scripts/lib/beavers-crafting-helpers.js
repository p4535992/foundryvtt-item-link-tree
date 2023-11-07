import { getItemSync, warn } from "./lib";

export class BeaverCraftingHelpers {
  static isBeaverCraftingModuleActive() {
    return game.modules.get("beavers-crafting")?.active;
  }

  static isItemBeaverCrafted(item) {
    const status = item.getFlag("beavers-crafting", "status");
    if (status === "created") {
      return true;
    }
    if (status === "updated") {
      return true;
    }
    return false;
  }

  static async setItemAsBeaverCrafted(itemOrItemUuid) {
    const item = getItemSync(itemOrItemUuid);
    if (!item) {
      warn(`I could not find the item with reference ${itemOrItemUuid}`);
      return;
    }
    const status = item.getFlag("beavers-crafting", "status");
    if (!status) {
      await item.setFlag(`beavers-crafting`, `status`, "created");
    } else {
      await item.setFlag(`beavers-crafting`, `status`, "updated");
    }
  }

  static async unsetItemAsBeaverCrafted(itemOrItemUuid) {
    const item = getItemSync(itemOrItemUuid);
    if (!item) {
      warn(`I could not find the item with reference ${itemOrItemUuid}`);
      return;
    }
    await item.unsetFlag("beavers-crafting", "status");
  }
}

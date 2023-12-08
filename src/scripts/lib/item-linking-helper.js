import { warn } from "./lib";

export class ItemLinkingHelpers {
  static isItemLinkingModuleActive() {
    return game.modules.get("item-linking")?.active;
  }

  static isItemLinked(itemToCheck) {
    if (!ItemLinkingHelpers.isItemLinkingModuleActive()) {
      return false;
    }
    const isLinked = itemToCheck.getFlag("item-linking", "baseItem");
    if (isLinked) {
      return true;
    }
    return false;
  }

  static retrieveLinkedItem(itemToCheck) {
    if (!ItemLinkingHelpers.isItemLinkingModuleActive()) {
      warn(`The module 'item-linking' is not active`);
      return;
    }
    if (!ItemLinkingHelpers.isItemLinked(itemToCheck)) {
      warn(`The item ${itemToCheck.name}|${itemToCheck.uuid} is not linked`);
      return;
    }
    const baseItemUuid = itemToCheck.getFlag("item-linking", "baseItem");
    if (!baseItemUuid) {
      warn(`No baseItemUuid is been found for ${itemToCheck.name}|${itemToCheck.uuid}`);
      return;
    }
    const baseItem = fromUuidSync(baseItemUuid);
    if (!baseItem) {
      warn(`No baseItem is been found for ${itemToCheck.name}|${itemToCheck.uuid}`);
      return;
    }
    return baseItem;
  }
}

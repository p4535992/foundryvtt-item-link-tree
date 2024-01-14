import { getItemAsync, warn } from "./lib";

export class ItemLinkingHelpers {
  static isItemLinkingModuleActive() {
    return game.modules.get("item-linking")?.active;
  }

  static isItemLinked(itemToCheck) {
    if (!ItemLinkingHelpers.isItemLinkingModuleActive()) {
      return false;
    }
    const isLinked = getProperty(itemToCheck, `flags.item-linking.baseItem`);
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
    // if (!ItemLinkingHelpers.isItemLinked(itemToCheck)) {
    //   warn(`The item ${itemToCheck.name}|${itemToCheck.uuid} is not linked`);
    //   return;
    // }
    const baseItemUuid = getProperty(itemToCheck, `flags.item-linking.baseItem`);
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

  static async setLinkedItem(itemToCheck, itemBaseReference) {
    if (!ItemLinkingHelpers.isItemLinkingModuleActive()) {
      warn(`The module 'item-linking' is not active`);
      return;
    }

    if (!itemBaseReference) {
      warn(`The 'baseItemReference' is null or empty`);
      return;
    }

    itemToCheck = await getItemAsync(itemToCheck);
    if (ItemLinkingHelpers.isItemLinked(itemToCheck)) {
      return itemToCheck;
    }

    const baseItem = await getItemAsync(itemBaseReference);
    const uuidToSet =
      ItemLinkingHelpers.retrieveLinkedItem(baseItem)?.uuid ??
      getProperty(baseItem, `flags.core.sourceId`) ??
      baseItem.uuid;

    if (!uuidToSet) {
      warn(`The 'uuidToSet' is null or empty`);
      return;
    }

    const baseItemUuid = getProperty(itemToCheck, `flags.item-linking.baseItem`);
    if (baseItemUuid) {
      warn(`No baseItemUuid is been found for ${itemToCheck.name}|${itemToCheck.uuid}`);
      return;
    }
    // itemToCheck = await itemToCheck.update({
    //   flags: {
    //     "item-linking": {
    //       baseItem: uuidToSet,
    //       isLinked: true,
    //     },
    //   },
    // });
    await itemToCheck.setFlag("item-linking", "baseItem", uuidToSet);
    await itemToCheck.setFlag("item-linking", "isLinked", true);
    return itemToCheck;
  }
}

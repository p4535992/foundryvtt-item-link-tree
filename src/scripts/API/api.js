import { ItemLinkTreeItem } from "../classes/ItemLinkTreeItem.js";
import CONSTANTS from "../constants/constants.js";
import { ItemLinkTreeManager } from "../item-link-tree-manager.js";
import { BeaverCraftingHelpers } from "../lib/beavers-crafting-helpers.js";
import { ItemLinkingHelpers } from "../lib/item-linking-helper.js";
import {
  debug,
  error,
  getItemAsync,
  getItemSync,
  info,
  isRealBooleanOrElseNull,
  isRealNumber,
  parseAsArray,
  warn,
} from "../lib/lib.js";
import { UpgradeItemGeneratorHelpers } from "../lib/upgrade-item-generator-helpers.js";
import { UpgradeItemHelpers } from "../lib/upgrade-item-helper.js";

const API = {
  getCollection(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw error("getCollection | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    // if (typeof inAttributes !== "object") {
    //   throw error("getCollection | inAttributes must be of type object");
    // }

    const itemRef = inAttributes.item ? inAttributes.item : inAttributes;
    const item = getItemSync(itemRef);
    if (!item) {
      warn(`No Item found`, true, inAttributes);
      return;
    }
    return item.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs) ?? [];
  },

  retrieveLeaf(inAttributes) {
    const leafsFounded = this.retrieveLeafs(inAttributes);
    return leafsFounded?.length > 0 ? leafsFounded[0] : null;
  },

  retrieveLeafs(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw error("getCollection | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    // if (typeof inAttributes !== "object") {
    //   throw error("getCollection | inAttributes must be of type object");
    // }

    let leafs = this.getCollection(inAttributes);
    if (!leafs || leafs?.length <= 0) {
      warn(`No Leafs found`, true, inAttributes);
      return;
    }

    if (inAttributes.name) {
      leafs = leafs.filter((l) => {
        return ItemLinkTreeManager._cleanName(l.name) === ItemLinkTreeManager._cleanName(inAttributes.name);
      });
    }
    if (inAttributes.uuid) {
      leafs = leafs.filter((l) => {
        return l.uuid === inAttributes.uuid;
      });
    }
    if (inAttributes.id) {
      leafs = leafs.filter((l) => {
        return l.id === inAttributes.id;
      });
    }

    return leafs;
  },

  getCollectionEffectAndBonus(itemWithLeafs) {
    const leafs = this.getCollection(itemWithLeafs);
    if (!leafs || leafs?.length <= 0) {
      return;
    }
    const leafsFilter = leafs.filter((leaf) => {
      // Aggiungo anche la stringa vuota per strani casi d'uso
      return (
        leaf.customLink === "" ||
        leaf.customLink === "bonus" ||
        leaf.customLink === "effect" ||
        leaf.customLink === "effectAndBonus"
      );
    });
    return leafsFilter;
  },

  getCollectionByFeature(inAttributes) {
    if (typeof inAttributes !== "object") {
      throw error("getCollectionBySubType | inAttributes must be of type object");
    }
    const itemWithLeafs = inAttributes.item;
    const features = inAttributes.features ?? [];
    const excludes = inAttributes.excludes ?? [];
    const leafs = this.getCollection(itemWithLeafs);
    if (leafs?.length <= 0) {
      return [];
    }
    const leafsFilter = leafs.filter((leaf) => {
      let result = true;
      if (features.length > 0) {
        result = features.includes(leaf.customLink);
      }
      if (excludes.length > 0) {
        result = !excludes.includes(leaf.customLink);
      }
      return result;
    });
    return leafsFilter;
  },

  getCollectionBySubType(inAttributes) {
    if (typeof inAttributes !== "object") {
      throw error("getCollectionBySubType | inAttributes must be of type object");
    }
    const itemWithLeafs = inAttributes.item;
    const types = inAttributes.types ?? [];
    const excludes = inAttributes.excludes ?? [];
    const leafs = this.getCollection(itemWithLeafs);
    if (leafs?.length <= 0) {
      return [];
    }
    const leafsFilter = leafs.filter((leaf) => {
      let result = true;
      if (types.length > 0) {
        result = types.includes(leaf.subType);
      }
      if (excludes.length > 0) {
        result = !excludes.includes(leaf.subType);
      }
      return result;
    });
    return leafsFilter;
  },

  getCollectionUpgradableItems(inAttributes) {
    if (typeof inAttributes !== "object") {
      throw error("getCollectionBySubType | inAttributes must be of type object");
    }
    const itemWithLeafs = inAttributes.item;
    const nameReference = inAttributes.name ?? [];
    const excludes = inAttributes.excludes ?? [];
    const leafs = this.getCollection(itemWithLeafs);
    if (leafs?.length <= 0) {
      return [];
    }
    const leafsFilter = leafs.filter((leaf) => {
      let result = false;
      let arrValidSources = parseAsArray(leaf.shortDescriptionLink);
      if (arrValidSources.length > 0) {
        result = arrValidSources.includes(nameReference);
      }
      if (excludes.length > 0) {
        const difference = arrValidSources.filter((x) => !excludes.has(x));
        result = difference.length > 0;
      }
      return result;
    });
    return leafsFilter;
  },

  isItemLeaf(itemLeafToCheck) {
    const isLeaf = itemLeafToCheck.getFlag("item-link-tree", "isLeaf");
    if (isLeaf) {
      return true;
    }
    return false;
  },

  isItemLeafBySubType(itemLeafToCheck, subTypeToCheck) {
    const isLeaf = itemLeafToCheck.getFlag("item-link-tree", "isLeaf");
    const subtype = itemLeafToCheck.getFlag("item-link-tree", "subType");
    if (isLeaf && subtype === subTypeToCheck) {
      return true;
    }
    return false;
  },

  isItemLeafByFeature(itemLeafToCheck, customTypeToCheck) {
    const isLeaf = itemLeafToCheck.getFlag("item-link-tree", "isLeaf");
    const customType = itemLeafToCheck.getFlag("item-link-tree", "customType");
    if (isLeaf && customType === customTypeToCheck) {
      return true;
    }
    return false;
  },

  isFilterByItemTypeOk(itemToCheck, itemType) {
    const filterItemType = itemToCheck.getFlag("item-link-tree", "filterItemType");
    if (filterItemType && itemType) {
      const filterItemTypeArr = parseAsArray(filterItemType);
      if (filterItemTypeArr.length > 0 && filterItemTypeArr.includes(itemType)) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  },

  hasSubtype(itemWithLeafs, subtype) {
    const options = {
      item: itemWithLeafs,
    };
    const leafs = this.getCollection(options);
    if (!leafs || leafs?.length <= 0) {
      return false;
    }

    const leafFilter = leafs.find((leaf) => {
      return leaf.subType === subtype;
    });
    return leafFilter ? true : false;
  },

  // isShowImageIconEnabled(item) {
  //   const options = {
  //     item: item,
  //   };
  //   const leafs = this.getCollection(options);
  //   if (!leafs || leafs?.length <= 0) {
  //     return false;
  //   }

  //   const leafsFilter = leafs.find((leaf) => {
  //     return leaf.showImageIcon;
  //   });
  //   return !!leafsFilter;
  // },

  async upgradeItem(item, leaf) {
    return await UpgradeItemHelpers.retrieveSuperiorItemAndReplaceOnActor(item, leaf);
  },

  async removeLeaf(item, leaf) {
    const itemI = await getItemAsync(item);
    const itemLinkTree = new ItemLinkTreeItem(itemI);

    const itemToDelete = itemLinkTree.itemTreeFlagMap.get(leaf.id);

    // If owned, we are storing the actual owned item item's uuid. Else we store the source id.
    // const uuidToRemove = itemLinkTree.item.isOwned ? itemToDelete.uuid : itemToDelete.getFlag("core", "sourceId");
    let uuidToRemove = itemToDelete.uuid;
    const itemRemoved = await fromUuid(uuidToRemove);
    let itemBaseRemoved = itemRemoved;
    if (itemRemoved && ItemLinkingHelpers.isItemLinked(itemRemoved)) {
      itemBaseRemoved = ItemLinkingHelpers.retrieveLinkedItem(itemRemoved);
      uuidToRemove = itemBaseRemoved.uuid;
    }

    if (Hooks.call("item-link-tree.preRemoveLeafFromItem", itemLinkTree.item, itemRemoved) === false) {
      log(`AddRemoveLeafFromItem completion was prevented by the 'item-link-tree.preRemoveLeafFromItem' hook.`);
      return;
    }

    const options = {};
    ItemLinkTreeManager.managePreRemoveLeafFromItem(itemLinkTree.item, itemRemoved, options);

    const newItemLeafs = itemLinkTree.itemTreeList.filter(({ uuid }) => uuid !== uuidToRemove);

    itemLinkTree._itemTreeFlagMap?.delete(itemId);
    await itemLinkTree.item.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs, newItemLeafs);

    //     const shouldDeleteLeaf =
    //     alsoDeleteEmbeddedLeaf &&
    //     (await Dialog.confirm({
    //       title: game.i18n.localize("item-link-tree.MODULE_NAME"),
    //       content: game.i18n.localize("item-link-tree.WARN_ALSO_DELETE"),
    //     }));

    //   if (shouldDeleteLeaf) {
    //     this._itemTreeFlagMap?.delete(itemId);
    //     await this.item.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs, newItemLeafs);
    //   } else if (!alsoDeleteEmbeddedLeaf) {
    //     this._itemTreeFlagMap?.delete(itemId);
    //     await this.item.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs, newItemLeafs);
    //   }

    await ItemLinkTreeManager.managePostRemoveLeafFromItem(itemLinkTree.item, itemRemoved, options);

    await Hooks.call("item-link-tree.postRemoveLeafFromItem", itemLinkTree.item, itemRemoved);
  },

  async addLeaf(item, itemLeaf, leafOptions = {}) {
    const itemI = await getItemAsync(item);
    const itemLinkTree = new ItemLinkTreeItem(itemI);

    // MUTATED if this is an owned item
    // let uuidToAdd = providedUuid;
    // const itemAdded = await fromUuid(uuidToAdd);
    const itemAdded = await getItemAsync(itemLeaf);
    let itemBaseAdded = itemAdded;
    if (!itemAdded) {
      warn(`Cannot find this item with uuid ${itemLeaf}`);
      return;
    }
    let uuidToAdd = itemAdded.uuid;
    if (ItemLinkingHelpers.isItemLinked(itemAdded)) {
      itemBaseAdded = ItemLinkingHelpers.retrieveLinkedItem(itemAdded);
      uuidToAdd = itemBaseAdded.uuid;
    }

    // if (!game.user.isGM) {
    //   const shouldAddLeaf = await Dialog.confirm({
    //     title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialog.warning.areyousuretoadd.name`),
    //     content: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialog.warning.areyousuretoadd.hint`),
    //   });

    //   if (!shouldAddLeaf) {
    //     return false;
    //   }
    // }

    if (Hooks.call("item-link-tree.preAddLeafToItem", itemLinkTree.item, itemAdded) === false) {
      log(`AddLeafToItem completion was prevented by the 'item-link-tree.preAddLeafToItem' hook.`);
      return;
    }

    const options = {
      checkForItemLinking:
        ItemLinkingHelpers.isItemLinkingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemCrafted"),
      checkForBeaverCrafting:
        BeaverCraftingHelpers.isBeaverCraftingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemLinked"),
    };
    const preResult = ItemLinkTreeManager.managePreAddLeafToItem(itemLinkTree.item, itemAdded, options);
    if (!preResult) {
      return;
    }

    const subType = leafOptions.subType ?? getProperty(itemBaseAdded, `flags.item-link-tree.subType`) ?? "";
    const showImageIcon = isRealBooleanOrElseNull(leafOptions.showImageIcon)
      ? leafOptions.showImageIcon
      : getProperty(itemBaseAdded, `flags.item-link-tree.showImageIcon`) ?? false;
    const customType = leafOptions.customType ?? getProperty(itemBaseAdded, `flags.item-link-tree.customType`) ?? "";
    const shortDescription =
      leafOptions.shortDescriptionLink ?? getProperty(itemBaseAdded, `flags.item-link-tree.shortDescription`) ?? "";
    const customLink = leafOptions.customLink;

    // Ignore any flag update if is a upgrade
    if (customType === "upgrade") {
      try {
        await ItemLinkTreeManager.managePostAddLeafToItem(this.item, itemAdded, options);

        // await Hooks.call("item-link-tree.postAddLeafToItem", this.item, itemAdded);
      } catch (e) {
        throw e;
      }
      return;
    }

    const itemLeafs = [
      ...itemLinkTree.itemTreeList,
      {
        name: itemBaseAdded.name,
        img: itemBaseAdded.img,
        uuid: uuidToAdd,
        id: itemBaseAdded.id ? itemBaseAdded.id : itemBaseAdded._id,
        customLink: customLink ?? customType,
        shortDescriptionLink: shortDescription,
        subType: subType,
        showImageIcon: showImageIcon,
      },
    ];

    // this update should not re-render the item sheet because we need to wait until we refresh to do so
    const property = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.itemLeafs}`;
    await itemLinkTree.item.update({ [property]: itemLeafs }, { render: false });

    await itemLinkTree.refresh();

    await ItemLinkTreeManager.managePostAddLeafToItem(itemLinkTree.item, itemAdded, options);

    await Hooks.call("item-link-tree.postAddLeafToItem", itemLinkTree.item, itemAdded);

    // now re-render the item and actor sheets
    await itemLinkTree.item.render();
    if (itemLinkTree.item.actor) await itemLinkTree.item.actor.render();
  },

  async prepareItemsLeafsFromAddLeaf(item, itemLeaf) {
    const itemI = await getItemAsync(item);
    const itemLinkTree = new ItemLinkTreeItem(itemI);

    // MUTATED if this is an owned item
    // let uuidToAdd = providedUuid;
    // const itemAdded = await fromUuid(uuidToAdd);
    const itemAdded = await getItemAsync(itemLeaf);
    let itemBaseAdded = itemAdded;
    if (!itemAdded) {
      warn(`Cannot find this item with uuid ${itemLeaf}`);
      return;
    }
    let uuidToAdd = itemAdded.uuid;
    if (ItemLinkingHelpers.isItemLinked(itemAdded)) {
      itemBaseAdded = ItemLinkingHelpers.retrieveLinkedItem(itemAdded);
      uuidToAdd = itemBaseAdded.uuid;
    }

    if (Hooks.call("item-link-tree.preAddLeafToItem", item, itemAdded) === false) {
      log(`AddLeafToItem completion was prevented by the 'item-link-tree.preAddLeafToItem' hook.`);
      return;
    }

    const options = {
      checkForItemLinking:
        ItemLinkingHelpers.isItemLinkingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemCrafted"),
      checkForBeaverCrafting:
        BeaverCraftingHelpers.isBeaverCraftingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemLinked"),
    };
    const preResult = ItemLinkTreeManager.managePreAddLeafToItem(itemI, itemAdded, options);
    if (!preResult) {
      return;
    }

    const subType = getProperty(itemBaseAdded, `flags.item-link-tree.subType`) ?? "";
    const showImageIcon = getProperty(itemBaseAdded, `flags.item-link-tree.showImageIcon`) ?? false;
    const customType = getProperty(itemBaseAdded, `flags.item-link-tree.customType`) ?? "";
    const shortDescription = getProperty(itemBaseAdded, `flags.item-link-tree.shortDescription`) ?? "";
    const customLink = null;

    // Ignore any flag update if is a upgrade
    if (customType === "upgrade") {
      return;
    }

    const itemLeafs = [
      ...itemLinkTree.itemTreeList,
      {
        name: itemBaseAdded.name,
        img: itemBaseAdded.img,
        uuid: uuidToAdd,
        id: itemBaseAdded.id ? itemBaseAdded.id : itemBaseAdded._id,
        customLink: customLink ?? customType,
        shortDescriptionLink: shortDescription,
        subType: subType,
        showImageIcon: showImageIcon,
      },
    ];

    // this update should not re-render the item sheet because we need to wait until we refresh to do so
    const property = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.itemLeafs}`;
    await itemI.update({ [property]: itemLeafs });

    // await ItemLinkTreeManager.managePostAddLeafToItem(itemI, itemAdded, options);

    await Hooks.call("item-link-tree.postAddLeafToItem", itemI, itemAdded);

    //return itemLeafs;
  },

  async upgradeItemGeneratorHelpers(compendiumsLabels) {
    return await UpgradeItemGeneratorHelpers.generateItemUpgradeCompendiums(compendiumsLabels);
  },
};

export default API;

import { ItemLinkTreeItem } from "../classes/ItemLinkTreeItem.js";
import CONSTANTS from "../constants/constants.js";
import { ItemLinkTreeManager } from "../item-link-tree-manager.js";
import Logger from "../lib/Logger.js";
import { BeaverCraftingHelpers } from "../lib/beavers-crafting-helpers.js";
import { ItemLinkingHelpers } from "../lib/item-linking-helper.js";
import { getItemAsync, getItemSync, isRealBooleanOrElseNull, isRealNumber, parseAsArray } from "../lib/lib.js";
import { UpgradeItemGeneratorHelpers } from "../lib/upgrade-item-generator-helpers.js";
import { UpgradeItemHelpers } from "../lib/upgrade-item-helper.js";

const API = {
  /**
   * Method to retrieve all the child item leafs on the the item
   * @param {object} inAttributes The options object to pass
   * @param {Item|string} [inAttributes.item] The uuid/id of the item or the item object himself.
   * @returns {Leaf[]} All the leafs on the item
   */
  getCollection(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw Logger.error("getCollection | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    // if (typeof inAttributes !== "object") {
    //   throw Logger.error("getCollection | inAttributes must be of type object");
    // }

    const itemRef = inAttributes.item ? inAttributes.item : inAttributes;
    const item = getItemSync(itemRef);
    if (!item) {
      Logger.warn(`No Item found`, true, inAttributes);
      return;
    }
    // return item.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs) ?? [];
    return getProperty(item, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.itemLeafs}`) ?? [];
  },

  /**
   * Method to retrieve all the child item leafs on the the item filtered by name,uuid, id. This is usually a valid and more intuitive method to 'getCollection'
   * @param {object} inAttributes The options object to pass
   * @param {Item|string} [inAttributes.item] The uuid/id of the item or the item object himself.
   * @param {string} [inAttributes.name=null] OPTIONAL: The name of the leaf to retrieve
   * @param {string} [inAttributes.uuid=null] OPTIONAL: The uuid of the leaf to retrieve
   * @param {string} [inAttributes.id=null] OPTIONAL: The id of the leaf to retrieve
   * @returns {Leaf[]} All the leafs on the item
   */
  retrieveLeafs(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw Logger.error("getCollection | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    // if (typeof inAttributes !== "object") {
    //   throw Logger.error("getCollection | inAttributes must be of type object");
    // }

    let leafs = this.getCollection(inAttributes);
    if (!leafs || leafs?.length <= 0) {
      Logger.warn(`No Leafs found`, true, inAttributes);
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

  /**
   * Method to retrieve a specific child item leaf on the the item
   * @param {object} inAttributes The options object to pass
   * @param {Item|string} [inAttributes.item] The uuid/id of the item or the item object himself.
   * @param {string} [inAttributes.name=null] OPTIONAL: The name of the leaf to retrieve
   * @param {string} [inAttributes.uuid=null] OPTIONAL: The uuid of the leaf to retrieve
   * @param {string} [inAttributes.id=null] OPTIONAL: The id of the leaf to retrieve
   * @returns {Leaf} The leaf
   */
  retrieveLeaf(inAttributes) {
    if (!inAttributes.name && !inAttributes.uuid && !inAttributes.id) {
      const leafsFounded = this.getCollection(inAttributes);
      return leafsFounded?.length > 0 ? leafsFounded[0] : null;
    } else {
      const leafsFounded = this.retrieveLeafs(inAttributes);
      return leafsFounded?.length > 0 ? leafsFounded[0] : null;
    }
  },

  /**
   * Method to retrieve all the child item leafs on the the item with subtype or customlink with value 'bonus' or 'effect' or 'effectAndBonus' or ''.
   * @param {Item|string} [item] The uuid/id of the item or the item object himself.
   * @returns {Leaf[]} Return All the leafs set as effect or bonus on the item.
   */
  getCollectionEffectAndBonus(item) {
    const itemRef = item.item ? item.item : item;
    const itemWithLeafs = getItemSync(itemRef);
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

  /**
   * Method to retrieve all the child item leafs on the the item filtered by feature (alias for the customLink flag)
   * @param {object} inAttributes The options object to pass
   * @param {Item|string} [inAttributes.item] The uuid/id of the item or the item object himself.
   * @param {Array.<string>} [inAttributes.features=[]] OPTIONAL: Pass only the leafs where the feature/customLink is contains in this array
   * @param {Array.<string>} [inAttributes.excludes=[]] OPTIONAL: Pass only the leafs where the feature/customLink is not contains in this array
   * @returns {Leaf[]} All the leafs on the item filtered by specific feature/customLink
   */
  getCollectionByFeature(inAttributes) {
    if (typeof inAttributes !== "object") {
      throw Logger.error("getCollectionBySubType | inAttributes must be of type object");
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

  /**
   * Method to retrieve all the child item leafs on the the item filtered by `feature` (alias for the `customLink` property)
   * @param {object} inAttributes The options object to pass
   * @param {Item|string} [inAttributes.item] The uuid/id of the item or the item object himself.
   * @param {Array.<string>} [inAttributes.types=[]] OPTIONAL: Pass only the leafs where the `feature/customLink/customType` is contains in this array
   * @param {Array.<string>} [inAttributes.excludes=[]] OPTIONAL: Pass only the leafs where the `feature/customLink/customType` is not contains in this array
   * @returns {Leaf[]} All the leafs on the item filtered by specific `feature/customLink/customType`
   */
  getCollectionBySubType(inAttributes) {
    if (typeof inAttributes !== "object") {
      throw Logger.error("getCollectionBySubType | inAttributes must be of type object");
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

  /**
   * Method to retrieve all the child item leafs on the the item valid and present on the property shortDescriptionLink for the item with the specific name given. This is a utility method for the upgrade behaviour.
   * @param {object} inAttributes The options object to pass
   * @param {Item|string} [inAttributes.item] The uuid/id of the item or the item object himself.
   * @param {string} [inAttributes.name] The name of the item to upgrade.
   * @param {Array.<string>} [inAttributes.excludes=[]] OPTIONAL: Pass only the leafs where the source is not contains in this array
   * @returns {Leaf[]} Return All the leafs on the item filtered as valid for the upgrade of hte item with a specific name.
   */
  getCollectionUpgradableItems(inAttributes) {
    if (typeof inAttributes !== "object") {
      throw Logger.error("getCollectionUpgradableItems | inAttributes must be of type object");
    }
    const itemWithLeafs = inAttributes.item;
    const nameReference = inAttributes.name ?? "";
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

  /**
   * Method to check if the item is categorized as 'Leaf'
   * @param {Item|string} item The uuid/id of the item or the item object himself.
   * @returns {boolean} The flag if is a 'Leaf' or no.
   */
  isItemLeaf(item) {
    const itemRef = item.item ? item.item : item;
    const itemLeafToCheck = getItemSync(itemRef);
    const isLeaf = getProperty(itemLeafToCheck, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.isLeaf}`);
    if (isLeaf) {
      return true;
    }
    return false;
  },

  /**
   * Method to check if the item is categorized as 'Leaf' and with the specific 'subtype'
   * @param {Item|string} item The uuid/id of the item or the item object himself.
   * @param {string} subtype The subtype reference to check e.g.'gem' or 'crystal'.
   * @returns {boolean} The flag if is a 'Leaf' and with the specific 'subType' or no.
   */
  isItemLeafBySubType(item, subtype) {
    const itemRef = item.item ? item.item : item;
    const itemLeafToCheck = getItemSync(itemRef);
    const isLeaf = getProperty(itemLeafToCheck, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.isLeaf}`);
    const subTypeToCheck =
      getProperty(itemLeafToCheck, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.subType}`) ?? "";
    if (isLeaf && subTypeToCheck === subtype) {
      return true;
    }
    return false;
  },

  /**
   * Method to check if the item is categorized as 'Leaf' and with the specific `feature/customLink/customType`
   * @param {Item|string} item The uuid/id of the item or the item object himself.
   * @param {string} feature The `feature/customLink/customType` reference to check e.g.'upgrade' or 'effect'.
   * @returns {boolean} The flag if is a 'Leaf' and with the specific `feature/customLink/customType` or no.
   */
  isItemLeafByFeature(item, feature) {
    const itemRef = item.item ? item.item : item;
    const itemLeafToCheck = getItemSync(itemRef);
    const isLeaf = getProperty(itemLeafToCheck, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.isLeaf}`);
    const customTypeToCheck = getProperty(
      itemLeafToCheck,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.customType}`
    );
    if (isLeaf && customTypeToCheck === feature) {
      return true;
    }
    return false;
  },

  /**
   * Method to check if the item is with the specific item type
   * @param {Item|string} item The uuid/id of the item or the item object himself.
   * @param {string} itemType The item type reference to check e.g.'gem' or 'crystal'.
   * @returns {boolean} The flag if is a 'Leaf' is with the specific item type or no.
   */
  isFilterByItemTypeOk(item, itemType) {
    const itemRef = item.item ? item.item : item;
    const itemToCheck = getItemSync(itemRef);
    const filterItemType = getProperty(itemToCheck, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.filterItemTypef}`);
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

  /**
   * Method to verify if at least one child leaf has the passed subType on the current item.
   * @param {Item|string} item The uuid/id of the item or the item object himself.
   * @param {string} subtype The subtype reference to check e.g.'gem' or 'crystal'.
   * @returns {boolean} The flag there is at least at least one child leaf with the specified subType.
   */
  hasSubtype(item, subtype) {
    const itemRef = item.item ? item.item : item;
    const itemWithLeafs = getItemSync(itemRef);
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

  /**
   * Method to upgrade a item with the passed leaf
   * NOTE: The leaf must be a valid one set as upgrade and with all the options for the upgrade, major information on the upgrade behavior paragraph at the bottom of the document.
   * @param {Item|string} item The uuid/id of the item or the item object himself to upgrade.
   * @param {Item|string} leaf The uuid/id of the item leaf with all the details about the upgrade.
   * @returns {Promise<void>} No response.
   */
  async upgradeItem(item, leaf) {
    return await UpgradeItemHelpers.retrieveSuperiorItemAndReplaceOnActor(item, leaf);
  },

  /**
   * Method to remove a child item leaf from the item parent
   * @param {Item|string} item The uuid/id of the item or the item object himself containing the leaf.
   * @param {Item|string} leaf The uuid/id of the item leaf to remove.
   * @returns {Promise<void>} No response.
   */
  async removeLeaf(item, leaf) {
    const itemRef = item.item ? item.item : item;
    const itemI = await getItemAsync(itemRef);
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
      Logger.log(`AddRemoveLeafFromItem completion was prevented by the 'item-link-tree.preRemoveLeafFromItem' hook.`);
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

    Hooks.call("item-link-tree.postRemoveLeafFromItem", itemLinkTree.item, itemRemoved);
  },

  /**
   * Method to add a child item leaf from the item parent.
   * NOTE: If both the property `customLink` and `customType` are passed `customLink` is the one used.
   * @param {Item|string} item The uuid/id of the item or the item object himself containing the leaf.
   * @param {Item|string} leaf The uuid/id of the item leaf to add.
   * @param {object} [leafOptions={}] OPTIONAL: The options object to pass for customize the leaf data by ovverriding the one passed by default on the item leaf
   * @param {string} [leafOptions.subType=null] The `subType` to override on the leaf data
   * @param {boolean} [leafOptions.showImageIcon=false] The `showImageIcon` to override on the leaf data
   * @param {string} [leafOptions.customType=null] The `customType` to override on the leaf data
   * @param {string} [leafOptions.shortDescriptionLink =null] The `shortDescriptionLink` to override on the leaf data
   * @param {string} [leafOptions.customLink=null] The `customLink` to override on the leaf data
   * @returns {Promise<void>} No response.
   */
  async addLeaf(item, itemLeaf, leafOptions = {}) {
    const itemRef = item.item ? item.item : item;
    const itemI = await getItemAsync(itemRef);
    const itemLinkTree = new ItemLinkTreeItem(itemI);

    // MUTATED if this is an owned item
    // let uuidToAdd = providedUuid;
    // const itemAdded = await fromUuid(uuidToAdd);
    const itemLeafRef = itemLeaf.item ? itemLeaf.item : itemLeaf;
    const itemAdded = await getItemAsync(itemLeafRef);
    let itemBaseAdded = itemAdded;
    if (!itemAdded) {
      Logger.warn(`Cannot find this item with uuid ${itemLeaf}`);
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
      Logger.log(`AddLeafToItem completion was prevented by the 'item-link-tree.preAddLeafToItem' hook.`);
      return;
    }

    const options = {
      checkForItemLinking:
        ItemLinkingHelpers.isItemLinkingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemLinked"),
      checkForBeaverCrafting:
        BeaverCraftingHelpers.isBeaverCraftingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemCrafted"),
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
        await ItemLinkTreeManager.managePostAddLeafToItem(item, itemAdded, options);

        // Hooks.call("item-link-tree.postAddLeafToItem", item, itemAdded);
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

    Hooks.call("item-link-tree.postAddLeafToItem", itemLinkTree.item, itemAdded);

    // now re-render the item and actor sheets
    await itemLinkTree.item.render();
    if (itemLinkTree.item.actor) await itemLinkTree.item.actor.render();
  },

  /**
   * Method to add a child item leaf from the item parent, just like the method 'addLeaf' but for a 'bulk' opertions on multiple items.
   * NOTE: If both the property `customLink` and `customType` are passed `customLink` is the one used.
   * @param {Item|string} item The uuid/id of the item or the item object himself containing the leaf.
   * @deprecated usa insetad `addLeafLight`
   * @param {Item|string} leaf The uuid/id of the item leaf to add.
   * @param {object} [leafOptions={}] OPTIONAL: The options object to pass for customize the leaf data by ovverriding the one passed by default on the item leaf
   * @param {string} [leafOptions.subType=null] The `subType` to override on the leaf data
   * @param {boolean} [leafOptions.showImageIcon=false] The `showImageIcon` to override on the leaf data
   * @param {string} [leafOptions.customType=null] The `customType` to override on the leaf data
   * @param {string} [leafOptions.shortDescriptionLink =null] The `shortDescriptionLink` to override on the leaf data
   * @param {string} [leafOptions.customLink=null] The `customLink` to override on the leaf data
   * @returns {Promise<void>} No response.
   */
  async prepareItemsLeafsFromAddLeaf(item, itemLeaf, leafOptions = {}) {
    return await this.addLeafLight(item, itemLeaf, leafOptions);
  },

  /**
   * Method to add a child item leaf from the item parent, just like the method 'addLeaf' but for a 'bulk' opertions on multiple items.
   * NOTE: If both the property `customLink` and `customType` are passed `customLink` is the one used.
   * @param {Item|string} item The uuid/id of the item or the item object himself containing the leaf.
   * @param {Item|string} leaf The uuid/id of the item leaf to add.
   * @param {object} [leafOptions={}] OPTIONAL: The options object to pass for customize the leaf data by ovverriding the one passed by default on the item leaf
   * @param {string} [leafOptions.subType=null] The `subType` to override on the leaf data
   * @param {boolean} [leafOptions.showImageIcon=false] The `showImageIcon` to override on the leaf data
   * @param {string} [leafOptions.customType=null] The `customType` to override on the leaf data
   * @param {string} [leafOptions.shortDescriptionLink =null] The `shortDescriptionLink` to override on the leaf data
   * @param {string} [leafOptions.customLink=null] The `customLink` to override on the leaf data
   * @returns {Promise<void>} No response.
   */
  async addLeafLight(item, itemLeaf, leafOptions = {}) {
    const itemRef = item.item ? item.item : item;
    const itemI = await getItemAsync(itemRef);
    const itemLinkTree = new ItemLinkTreeItem(itemI);

    // MUTATED if this is an owned item
    // let uuidToAdd = providedUuid;
    // const itemAdded = await fromUuid(uuidToAdd);
    const itemLeafRef = itemLeaf.item ? itemLeaf.item : itemLeaf;
    const itemAdded = await getItemAsync(itemLeafRef);
    let itemBaseAdded = itemAdded;
    if (!itemAdded) {
      Logger.warn(`Cannot find this item with uuid ${itemLeaf}`);
      return;
    }
    let uuidToAdd = itemAdded.uuid;
    if (ItemLinkingHelpers.isItemLinked(itemAdded)) {
      itemBaseAdded = ItemLinkingHelpers.retrieveLinkedItem(itemAdded);
      uuidToAdd = itemBaseAdded.uuid;
    }

    if (Hooks.call("item-link-tree.preAddLeafToItem", item, itemAdded) === false) {
      Logger.log(`AddLeafToItem completion was prevented by the 'item-link-tree.preAddLeafToItem' hook.`);
      return;
    }

    const options = {
      checkForItemLinking:
        ItemLinkingHelpers.isItemLinkingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemLinked"),
      checkForBeaverCrafting:
        BeaverCraftingHelpers.isBeaverCraftingModuleActive() &&
        game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemCrafted"),
    };
    const preResult = ItemLinkTreeManager.managePreAddLeafToItem(itemI, itemAdded, options);
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

    Hooks.call("item-link-tree.postAddLeafToItem", itemI, itemAdded);

    //return itemLeafs;
  },

  /**
   * Method for 'try' to automatic generate some upgradable leaf for the chain Dnd5e logic for weapons and armors +1,+2,+3
   * @param {Object.<string, string[]>} compendiumMapLabelsByType The record list containing filter for itme type and a array  of labels compendiums to check
   * @returns {Promise<void>} No response.
   */
  async upgradeItemGeneratorHelpers(compendiumMapLabelsByType) {
    return await UpgradeItemGeneratorHelpers.generateItemUpgradeCompendiums(compendiumMapLabelsByType);
  },
};

export default API;

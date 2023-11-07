import { ItemLinkTree } from "../ItemLinkTree.js";
import CONSTANTS from "../constants/constants.js";
import { ItemLinkTreeManager } from "../item-link-tree-manager.js";
import { ItemLinkingHelpers } from "../lib/item-linking-helper.js";
import { log, warn } from "../lib/lib.js";
import { ItemLinkTreeItemSheet } from "./ItemLinkTreeItemSheet.js";

/**
 * Creates a fake temporary item as filler for when a UUID is unable to resolve an item
 * @param {string} uuid - the `uuid` of the source of this item
 * @returns item with the correct flags to allow deletion
 */
const FakeEmptyItem = (uuid, parent) =>
  new Item.implementation(
    {
      name: game.i18n.localize("item-link-tree.MISSING_ITEM"),
      img: "icons/svg/hazard.svg",
      type: "spell",
      system: {
        description: {
          value: game.i18n.localize("item-link-tree.MISSING_ITEM_DESCRIPTION"),
        },
      },
      _id: uuid.split(".").pop(),
    },
    { temporary: true, parent }
  );

/**
 * A class made to make managing the operations for an Item with items attached easier.
 */
export class ItemLinkTreeItem {
  constructor(item) {
    this.item = item;

    this._itemTreeFlagMap = null;
    // this._itemTreeItems = null;
  }

  /**
   * A map of what the "id" of the new item would be to its corresponding flag definition on this parent item
   * Used when updating an item's overrides as the map lookup is easier than the array lookup
   */
  get itemTreeFlagMap() {
    if (this._itemTreeFlagMap === null) {
      return this._getItemTreeFlagMap();
    }

    return this._itemTreeFlagMap;
  }

  /**
   * Raw flag data
   */
  get itemTreeList() {
    return this.item.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs) ?? [];
  }

  /**
   * Update this class's understanding of the item items
   */
  async refresh() {
    log("", false, "REFRESHING", this.itemTreeList);
    this._getItemTreeFlagMap();
    // await this._getItemTreeItems();
    log("", false, "REFRESHed");
  }

  /**
   * Gets the child item from its uuid and provided changes.
   * If the uuid points to an item already created on the actor: return that item.
   * Otherwise create a temporary item, apply changes, and return that item's json.
   */
  async _getChildItem({ uuid, changes = {} }) {
    // original could be in a compendium or on an actor
    let original = await fromUuid(uuid);

    log("", false, "original", original);

    // return a fake 'empty' item if we could not create a childItem
    if (!original) {
      original = FakeEmptyItem(uuid, this.item.parent);
    }
  }

  /**
   * Get or Create a cached map of child item item "ids" to their flags
   * Useful when updating overrides for a specific 'child item'
   * @returns {Map<string, object>} - Map of ids to flags
   */
  _getItemTreeFlagMap() {
    const map = new Map();
    this.itemTreeList.forEach((itemLeafFlag) => {
      const id = itemLeafFlag.uuid.split(".").pop();
      map.set(id, itemLeafFlag);
    });
    this._itemTreeFlagMap = map;
    return map;
  }

  /**
   * Adds a given UUID to the item's item list
   * @param {string} providedUuid
   */
  async addLeafToItem(providedUuid) {
    // MUTATED if this is an owned item
    let uuidToAdd = providedUuid;
    const itemAdded = await fromUuid(uuidToAdd);
    let itemBaseAdded = itemAdded;
    if (!itemAdded) {
      warn(`Cannot find this item with uuid ${uuidToAdd}`);
      return;
    }
    if (ItemLinkingHelpers.isItemLinked(itemAdded)) {
      itemBaseAdded = ItemLinkingHelpers.retrieveLinkedItem(itemAdded);
      uuidToAdd = itemBaseAdded.uuid;
    }

    if (!game.user.isGM) {
      const shouldAddLeaf = await Dialog.confirm({
        title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialog.warning.areyousuretoadd.name`),
        content: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialog.warning.areyousuretoadd.hint`),
      });

      if (!shouldAddLeaf) {
        return false;
      }
    }

    if (Hooks.call("item-link-tree.preAddLeafToItem", this.item, itemAdded) === false) {
      log(`AddLeafToItem completion was prevented by the 'item-link-tree.preAddLeafToItem' hook.`);
      return;
    }

    const options = {
      checkForItemLinking: ItemLinkingHelpers.isItemLinkingModuleActive(),
      checkForBeaverCrafting: false,
    };
    ItemLinkTreeManager.managePreAddLeafToItem(this.item, itemAdded, options);

    const customType = getProperty(itemBaseAdded, `flags.item-link-tree.customType`) ?? "";
    const shortDescription = getProperty(itemBaseAdded, `flags.item-link-tree.shortDescription`) ?? "";
    const itemLeafs = [
      ...this.itemTreeList,
      {
        uuid: uuidToAdd,
        customLink: customType,
        shortDescriptionLink: shortDescription,
      },
    ];

    // this update should not re-render the item sheet because we need to wait until we refresh to do so
    const property = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.itemLeafs}`;
    await this.item.update({ [property]: itemLeafs }, { render: false });

    await this.refresh();

    // now re-render the item and actor sheets
    this.item.render();
    if (this.item.actor) this.item.actor.render();

    Hooks.call("item-link-tree.postAddLeafToItem", this.item, itemAdded);

    ItemLinkTreeManager.managePostAddLeafToItem(this.item, itemAdded, options);
  }

  /**
   * Removes the relationship between the provided item and this item's items
   * @param {string} itemId - the id of the item to remove
   * @param {Object} options
   * @param {boolean} [options.alsoDeleteEmbeddedLeaf] - Should the item be deleted also, only for owned items
   * @returns {Item} the updated or deleted item after having its parent item removed, or null
   */
  async removeLeafFromItem(itemId, { alsoDeleteEmbeddedLeaf } = {}) {
    const itemToDelete = this.itemTreeFlagMap.get(itemId);

    // If owned, we are storing the actual owned item item's uuid. Else we store the source id.
    // const uuidToRemove = this.item.isOwned ? itemToDelete.uuid : itemToDelete.getFlag("core", "sourceId");
    let uuidToRemove = itemToDelete.uuid;
    const itemRemoved = await fromUuid(uuidToRemove);
    let itemBaseRemoved = itemRemoved;
    if (itemRemoved && ItemLinkingHelpers.isItemLinked(itemRemoved)) {
      itemBaseRemoved = ItemLinkingHelpers.retrieveLinkedItem(itemRemoved);
      uuidToRemove = itemBaseRemoved.uuid;
    }

    if (Hooks.call("item-link-tree.preRemoveLeafFromItem", this.item, itemRemoved) === false) {
      log(`AddRemoveLeafFromItem completion was prevented by the 'item-link-tree.preRemoveLeafFromItem' hook.`);
      return;
    }

    const options = {};
    ItemLinkTreeManager.managePreRemoveLeafFromItem(this.item, itemRemoved, options);

    const newItemLeafs = this.itemTreeList.filter(({ uuid }) => uuid !== uuidToRemove);

    const shouldDeleteLeaf =
      alsoDeleteEmbeddedLeaf &&
      (await Dialog.confirm({
        title: game.i18n.localize("item-link-tree.MODULE_NAME"),
        content: game.i18n.localize("item-link-tree.WARN_ALSO_DELETE"),
      }));

    if (shouldDeleteLeaf) {
      this._itemTreeFlagMap?.delete(itemId);
      await this.item.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs, newItemLeafs);
    } else if (!alsoDeleteEmbeddedLeaf) {
      this._itemTreeFlagMap?.delete(itemId);
      await this.item.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs, newItemLeafs);
    }

    Hooks.call("item-link-tree.postRemoveLeafFromItem", this.item, itemRemoved);

    ItemLinkTreeManager.managePostRemoveLeafFromItem(this.item, itemRemoved, options);
  }

  /**
   * Removes the relationship between the provided item and this item's items
   * @param {string} itemId - the id of the item to remove
   * @param {Object} options
   * @param {boolean} [options.alsoDeleteEmbeddedLeaf] - Should the item be deleted also, only for owned items
   * @returns {Item} the updated or deleted item after having its parent item removed, or null
   */
  async createCustomLinkItem(itemId) {
    const itemToUpdateLeaf = this.itemTreeFlagMap.get(itemId);

    // If owned, we are storing the actual owned item item's uuid. Else we store the source id.
    // const uuidToUpdate = this.item.isOwned ? itemToUpdate.uuid : itemToUpdate.getFlag("core", "sourceId");
    const uuidToUpdate = itemToUpdateLeaf.uuid;
    const itemUpdated = await fromUuid(uuidToUpdate);

    if (Hooks.call("item-link-tree.preUpdateLeafFromItem", this.item, itemUpdated, this.itemTreeList) === false) {
      log(`UpdateLeafFromItem completion was prevented by the 'item-link-tree.preUpdateLeafFromItem' hook.`);
      return;
    }

    const options = {};
    ItemLinkTreeManager.managePreUpdateLeafFromItem(this.item, itemUpdated, options);

    const newItemLeafs = deepClone(this.itemTreeList);

    let currentLeaf;
    for (const leaf of this.itemTreeList) {
      if (leaf.uuid === uuidToUpdate) {
        currentLeaf = leaf;
        break;
      }
    }

    new Dialog({
      title: "Update Custom Link Type",
      //   content: `
      //       <form>
      //         <div class="form-group">
      //             <label>Prefix</label>
      //             <input type='text' name='prefix' value='${currentLeaf.prefix ?? ""}'></input>
      //         </div>
      //         <div class="form-group">
      //             <label>Suffix</label>
      //             <input type='text' name='suffix' value='${currentLeaf.suffix ?? ""}'></input>
      //         </div>
      //         <div class="form-group">
      //           <label>Custom Link Type</label>
      //           <input type='text' name='customLink' value='${currentLeaf.customLink ?? ""}'></input>
      //         </div>
      //       </form>`,
      content: `
            <form>
            <div class="form-group">
                <label>Custom Link Type</label>
                <input type='text' name='shortDescriptionLink' value='${
                  currentLeaf.shortDescriptionLink ?? ""
                }'></input>
            </div>
            <div class="form-group">
                <label>Custom Link Type</label>
                <input type='text' name='customLink' value='${currentLeaf.customLink ?? ""}'></input>
            </div>
            </form>`,
      buttons: {
        update: {
          icon: "<i class='fas fa-check'></i>",
          label: `Update Custom Link Type`,
          callback: async (html) => {
            // let resultPrefix = html.find(`input[name='prefix']`);
            // let resultSuffix = html.find(`input[name='suffix']`);
            let resultCustomLink = html.find(`input[name='customLink']`);
            let resultShortDescriptionLink = html.find(`input[name='shortDescriptionLink']`);
            for (const leaf of newItemLeafs) {
              if (leaf.uuid === uuidToUpdate) {
                // leaf.prefix = resultPrefix.val() ?? "";
                // leaf.suffix = resultSuffix.val() ?? "";
                leaf.customLink = resultCustomLink.val() ?? "";
                leaf.shortDescriptionLink = resultShortDescriptionLink.val() ?? "";
                break;
              }
            }

            // await this.item.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs, newItemLeafs);

            // // Nothing more to do for unowned items.
            // if (!this.item.isOwned) return;

            // this update should not re-render the item sheet because we need to wait until we refresh to do so
            await this.item.update(
              {
                flags: {
                  [CONSTANTS.MODULE_ID]: {
                    [CONSTANTS.FLAGS.itemLeafs]: newItemLeafs,
                  },
                },
              },
              { render: false }
            );

            // update this data manager's understanding of the items it contains
            await this.refresh();

            ItemLinkTreeItemSheet.instances.forEach((instance) => {
              if (instance.itemLinkTreeItem === this) {
                instance._shouldOpenTreeTab = true;
              }
            });

            // now re-render the item sheets
            this.item.render();

            Hooks.call("item-link-tree.postUpdateLeafFromItem", this.item, itemToUpdate, this.itemTreeList);

            ItemLinkTreeManager.managePostUpdateLeafFromItem(this.item, itemUpdated, options);
          },
        },
      },
      default: "update",
      close: (html) => {
        // Do nothing
      },
    }).render(true);
  }

  /**
   * Updates the given item's overrides
   * @param {*} itemId - item attached to this item
   * @param {*} overrides - object describing the changes that should be applied to the item
   */
  async updateItemLeafOverrides(itemId, overrides) {
    const itemLeafFlagsToUpdate = this.itemTreeFlagMap.get(itemId);

    itemLeafFlagsToUpdate.changes = overrides;

    this.itemTreeFlagMap.set(itemId, itemLeafFlagsToUpdate);

    const newItemLeafsFlagValue = [...this.itemTreeFlagMap.values()];

    // this update should not re-render the item sheet because we need to wait until we refresh to do so
    await this.item.update(
      {
        flags: {
          [CONSTANTS.MODULE_ID]: {
            [CONSTANTS.FLAGS.itemLeafs]: newItemLeafsFlagValue,
          },
        },
      },
      { render: false }
    );

    // update this data manager's understanding of the items it contains
    await this.refresh();

    ItemLinkTreeItemSheet.instances.forEach((instance) => {
      if (instance.itemLinkTreeItem === this) {
        instance._shouldOpenTreeTab = true;
      }
    });

    // now re-render the item sheets
    this.item.render();
  }
}

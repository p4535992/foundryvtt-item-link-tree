import { ItemLinkTree } from "../../module.js";
import { ItemLinkTreeItemSheet } from "./item-sheet.js";

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
    return this.item.getFlag(ItemLinkTree.MODULE_ID, ItemLinkTree.FLAGS.itemLeafs) ?? [];
  }

  // /**
  //  * A map of what the "id" of the New item would be to its corresponding Item Data, taking any defined overrides into account.
  //  */
  // get itemTreeItemMap() {
  //   if (this._itemTreeItems === null) {
  //     return this._getItemTreeItems();
  //   }

  //   return this._itemTreeItems;
  // }

  /**
   * Update this class's understanding of the item items
   */
  async refresh() {
    ItemLinkTree.log(false, "REFRESHING", this.itemTreeList);
    this._getItemTreeFlagMap();
    // await this._getItemTreeItems();
    ItemLinkTree.log(false, "REFRESHed");
  }

  /**
   * Gets the child item from its uuid and provided changes.
   * If the uuid points to an item already created on the actor: return that item.
   * Otherwise create a temporary item, apply changes, and return that item's json.
   */
  async _getChildItem({ uuid, changes = {} }) {
    // original could be in a compendium or on an actor
    let original = await fromUuid(uuid);

    ItemLinkTree.log(false, "original", original);

    // return a fake 'empty' item if we could not create a childItem
    if (!original) {
      original = FakeEmptyItem(uuid, this.item.parent);
    }

    /*
    // this exists if the 'child' item has been created on an actor
    if (original.getFlag(ItemLinkTree.MODULE_ID, ItemLinkTree.FLAGS.parentItem) === this.item.uuid) {
      return original;
    }

    // these changes are always applied
    const fixedChanges = {
      ["flags.core.sourceId"]: uuid, // set the sourceId as the original item
      [`flags.${ItemLinkTree.MODULE_ID}.${ItemLinkTree.FLAGS.parentItem}`]: this.item.uuid,
      ["system.preparation.mode"]: "atwill",
    };

    const update = foundry.utils.mergeObject(changes, fixedChanges);

    // backfill the 'charges' and 'target' for parent-item-charge consumption style items
    if (foundry.utils.getProperty(changes, "system.consume.amount")) {
      foundry.utils.mergeObject(update, {
        "system.consume.type": "charges",
        "system.consume.target": this.item.id,
      });
    }

    const childItem = new Item.implementation(original.toObject(), {
      temporary: true,
      keepId: false,
      parent: this.item.parent,
    });
    await childItem.updateSource(update);

    ItemLinkTree.log(false, "getChildItem", childItem);

    return childItem;
    */
  }

  // /**
  //  * Get a cached copy of temporary items or create and cache those items with the changes from flags applied.
  //  * @returns {Promise<Map<string, Item5e>>} - array of temporary items created from the uuids and changes attached to this item
  //  */
  // async _getItemTreeItems() {
  //   const itemMap = new Map();

  //   await Promise.all(
  //     this.itemTreeList.map(async ({ uuid, changes }) => {
  //       const childItem = await this._getChildItem({ uuid, changes });

  //       if (!childItem) return;

  //       itemMap.set(childItem.id, childItem);
  //       return childItem;
  //     })
  //   );

  //   this._itemTreeItems = itemMap;
  //   return itemMap;
  // }

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
  async addLinkToItem(providedUuid) {
    // MUTATED if this is an owned item
    let uuid = providedUuid;

    // MOD 4535992
    /*
    if (this.item.isOwned) {
      // if this item is already on an actor, we need to
      // 0. see if the uuid is already on the actor
      // 1. create the dropped uuid on the Actor's item list (OR update that item to be a child of this one)
      // 2. get the new uuid from the created item
      // 3. add that uuid to this item's flags\
      const fullItemData = await fromUuid(uuid);

      if (!fullItemData) {
        ui.notifications.error('Item data for', uuid, 'not found');
        return;
      }

      const adjustedItemData = foundry.utils.mergeObject(fullItemData.toObject(), {
        ['flags.core.sourceId']: uuid, // set the sourceId as the original item
        [`flags.${ItemLinkTree.MODULE_ID}.${ItemLinkTree.FLAGS.parentItem}`]: this.item.uuid,
        ['system.preparation.mode']: 'atwill',
      });

      const [newItem] = await this.item.actor.createEmbeddedDocuments('Item', [adjustedItemData]);
      uuid = newItem.uuid;

      ItemLinkTree.log(false, 'new item created', newItem);
    }
    */
    const itemLeafs = [...this.itemTreeList, { uuid }];

    // this update should not re-render the item sheet because we need to wait until we refresh to do so
    const property = `flags.${ItemLinkTree.MODULE_ID}.${ItemLinkTree.FLAGS.itemLeafs}`;
    await this.item.update({ [property]: itemLeafs }, { render: false });

    await this.refresh();

    // now re-render the item and actor sheets
    this.item.render();
    if (this.item.actor) this.item.actor.render();
  }

  /**
   * Removes the relationship between the provided item and this item's items
   * @param {string} itemId - the id of the item to remove
   * @param {Object} options
   * @param {boolean} [options.alsoDeleteEmbeddedLeaf] - Should the item be deleted also, only for owned items
   * @returns {Item} the updated or deleted item after having its parent item removed, or null
   */
  async removeLeafFromItem(itemId, { alsoDeleteEmbeddedLeaf } = {}) {
    // MOD 4535992
    // const itemToDelete = this.itemTreeItemMap.get(itemId);
    const itemToDelete = this.itemTreeFlagMap.get(itemId);

    // If owned, we are storing the actual owned item item's uuid. Else we store the source id.
    // const uuidToRemove = this.item.isOwned ? itemToDelete.uuid : itemToDelete.getFlag("core", "sourceId");
    const uuidToRemove = itemToDelete.uuid;
    const newItemLeafs = this.itemTreeList.filter(({ uuid }) => uuid !== uuidToRemove);

    const shouldDeleteLeaf =
      alsoDeleteEmbeddedLeaf &&
      (await Dialog.confirm({
        title: game.i18n.localize("item-link-tree.MODULE_NAME"),
        content: game.i18n.localize("item-link-tree.WARN_ALSO_DELETE"),
      }));

    if (shouldDeleteLeaf) {
      this._itemTreeFlagMap?.delete(itemId);
      await this.item.setFlag(ItemLinkTree.MODULE_ID, ItemLinkTree.FLAGS.itemLeafs, newItemLeafs);
    } else if (!alsoDeleteEmbeddedLeaf) {
      this._itemTreeFlagMap?.delete(itemId);
      await this.item.setFlag(ItemLinkTree.MODULE_ID, ItemLinkTree.FLAGS.itemLeafs, newItemLeafs);
    }
    // MOD 4535992
    /*
    // Nothing more to do for unowned items.
    if (!this.item.isOwned) return;

    // remove the item's `parentItem` flag
    const treeItem = fromUuidSync(uuidToRemove);

    // the other item has already been deleted, probably do nothing.
    if (!treeItem) return;

    const shouldDeleteLeaf = alsoDeleteEmbeddedLeaf && (await Dialog.confirm({
      title: game.i18n.localize("item-link-tree.MODULE_NAME"),
      content: game.i18n.localize("item-link-tree.WARN_ALSO_DELETE")
    }));

    if (shouldDeleteLeaf) return treeItem.delete();
    else return treeItem.unsetFlag(ItemLinkTree.MODULE_ID, ItemLinkTree.FLAGS.parentItem);
    */
  }

  /**
   * Removes the relationship between the provided item and this item's items
   * @param {string} itemId - the id of the item to remove
   * @param {Object} options
   * @param {boolean} [options.alsoDeleteEmbeddedLeaf] - Should the item be deleted also, only for owned items
   * @returns {Item} the updated or deleted item after having its parent item removed, or null
   */
  async createCustomLinkItem(itemId) {
    const itemToUpdate = this.itemTreeFlagMap.get(itemId);

    // If owned, we are storing the actual owned item item's uuid. Else we store the source id.
    // const uuidToUpdate = this.item.isOwned ? itemToUpdate.uuid : itemToUpdate.getFlag("core", "sourceId");
    const uuidToUpdate = itemToUpdate.uuid;
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
      content: `
          <form>
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
            let result = html.find(`input[name='customLink']`);
            if (result.val() !== "") {
              for (const leaf of newItemLeafs) {
                if (leaf.uuid === uuidToUpdate) {
                  leaf.customLink = result.val();
                  break;
                }
              }
            }

            // await this.item.setFlag(ItemLinkTree.MODULE_ID, ItemLinkTree.FLAGS.itemLeafs, newItemLeafs);

            // // Nothing more to do for unowned items.
            // if (!this.item.isOwned) return;

            // this update should not re-render the item sheet because we need to wait until we refresh to do so
            await this.item.update(
              {
                flags: {
                  [ItemLinkTree.MODULE_ID]: {
                    [ItemLinkTree.FLAGS.itemLeafs]: newItemLeafs,
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
          [ItemLinkTree.MODULE_ID]: {
            [ItemLinkTree.FLAGS.itemLeafs]: newItemLeafsFlagValue,
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

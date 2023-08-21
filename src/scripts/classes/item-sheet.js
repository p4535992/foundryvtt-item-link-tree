import { ItemLinkTree } from "../../module.js";
import { ItemLinkTreeItemSpellOverrides } from "./item-link-item-overrides.js";
import { ItemLinkTreeItem } from "./item.js";

/**
 * A class made to make managing the operations for an Item sheet easier.
 */
export class ItemLinkTreeItemSheet {
  /** A boolean to set when we are causing an item update we know should re-open to this tab */
  _shouldOpenTreeTab = false;

  constructor(app, html) {
    this.app = app;
    this.item = app.item;
    this.sheetHtml = html;
    this.itemLinkTreeItem = new ItemLinkTreeItem(this.item);
  }

  /** MUTATED: All open ItemSheet have a cached instance of this class */
  static instances = new Map();

  /**
   * Handles the item sheet render hook
   */
  static init() {
    Hooks.on("renderItemSheet", (app, html) => {
      let include = false;
      try {
        include = !!game.settings.get(ItemLinkTree.MODULE_ID, `includeItemType${app.item.type.titleCase()}`);
      } catch {}
      if (!include) return;

      ItemLinkTree.log(false, {
        instances: this.instances,
      });

      if (this.instances.get(app.appId)) {
        const instance = this.instances.get(app.appId);

        instance.renderLite();

        if (instance._shouldOpenTreeTab) {
          app._tabs?.[0]?.activate?.("tree");
          instance._shouldOpenTreeTab = false;
        }
        return;
      }

      const newInstance = new this(app, html);

      this.instances.set(app.appId, newInstance);

      return newInstance.renderLite();
    });

    // clean up instances as sheets are closed
    Hooks.on("closeItemSheet", async (app) => {
      if (this.instances.get(app.appId)) {
        return this.instances.delete(app.appId);
      }
    });
  }

  /**
   * Renders the tree tab template to be injected
   */
  async _renderLeafsList() {
    // MOD 4535992
    //const itemLeafsArray = [...(await this.itemLinkTreeItem.itemSpellItemMap).values()];
    const itemLeafsArray = [...(await this.itemLinkTreeItem.itemSpellFlagMap).values()];

    ItemLinkTree.log(false, "rendering list", itemLeafsArray);

    const itemLeafsArrayTmp = [];
    // TOD made this better...
    for (const leaf of itemLeafsArray) {
      const i = fromUuidSync(leaf.uuid);
      if (i) {
        itemLeafsArrayTmp.push(i);
      } else {
        console.warn(`${MODULE_ID} | there is a worng item uuid ${leaf}`);
      }
    }

    return renderTemplate(ItemLinkTree.TEMPLATES.treeTab, {
      itemLeafs: itemLeafsArrayTmp, // MOD 4535992 itemLeafsArray,
      config: {
        limitedUsePeriods: CONFIG.DND5E.limitedUsePeriods,
        abilities: CONFIG.DND5E.abilities,
      },
      isOwner: this.item.isOwner,
      isOwned: this.item.isOwned,
    });
  }

  /**
   * Ensure the item dropped is a item, add the item to the item flags.
   * @returns Promise that resolves when the item has been modified
   */
  async _dragEnd(event) {
    if (!this.app.isEditable) return;
    ItemLinkTree.log(false, "dragEnd", { event });

    const data = TextEditor.getDragEventData(event);
    ItemLinkTree.log(false, "dragEnd", { data });

    if (data.type !== "Item") return;

    const item = fromUuidSync(data.uuid);
    ItemLinkTree.log(false, "dragEnd", { item });

    // MOD 4535992
    //if (item.type !== 'spell') return;

    // set the flag to re-open this tab when the update completes
    this._shouldOpenTreeTab = true;
    return this.itemLinkTreeItem.addLinkToItem(data.uuid);
  }

  /**
   * Event Handler that opens the item's sheet
   */
  async _handleItemClick(event) {
    const { itemId } = $(event.currentTarget).parents("[data-item-id]").data();
    // MOD 4535992
    //const item = this.itemLinkTreeItem.itemSpellItemMap.get(itemId);
    const item = this.itemLinkTreeItem.itemSpellFlagMap.get(itemId);

    ItemLinkTree.log(false, "_handleItemClick", !!item.isOwned && !!item.isOwner);
    item?.sheet.render(true, {
      editable: !!item.isOwned && !!item.isOwner,
    });
  }

  /**
   * Event Handler that removes the link between this item and the item
   */
  async _handleItemDeleteClick(event) {
    const { itemId } = $(event.currentTarget).parents("[data-item-id]").data();

    // MOD 4535992
    //ItemLinkTree.log(false, "deleting", itemId, this.itemLinkTreeItem.itemSpellItemMap);
    ItemLinkTree.log(false, "deleting", itemId, this.itemLinkTreeItem.itemSpellFlagMap);

    // set the flag to re-open this tab when the update completes
    this._shouldOpenTreeTab = true;
    await this.itemLinkTreeItem.removeSpellFromItem(itemId);
  }

  /**
   * Event Handler that also Deletes the embedded item
   */
  async _handleItemDestroyClick(event) {
    const { itemId } = $(event.currentTarget).parents("[data-item-id]").data();

    // MOD 4535992
    //ItemLinkTree.log(false, "destroying", itemId, this.itemLinkTreeItem.itemSpellItemMap);
    ItemLinkTree.log(false, "destroying", itemId, this.itemLinkTreeItem.itemSpellFlagMap);

    // set the flag to re-open this tab when the update completes
    this._shouldOpenTreeTab = true;
    await this.itemLinkTreeItem.removeSpellFromItem(itemId, { alsoDeleteEmbeddedSpell: true });
  }

  /**
   * Event Handler that opens the item's sheet or config overrides, depending on if the item is owned
   */
  async _handleItemEditClick(event) {
    const { itemId } = $(event.currentTarget).parents("[data-item-id]").data();

    // MOD 4535992
    /*
    //const item = this.itemLinkTreeItem.itemSpellItemMap.get(itemId);
    
    if (item.isOwned) {
      return item.sheet.render(true);
    }

    // pop up a formapp to configure this item's overrides
    return new ItemLinkTreeItemSpellOverrides(this.itemLinkTreeItem, itemId).render(true);
    */
    const itemTmp = this.itemLinkTreeItem.itemSpellFlagMap.get(itemId);
    const item = fromUuidSync(itemTmp.uuid);
    return item.sheet.render(true);
  }

  /**
   * Synchronous part of the render which calls the asynchronous `renderHeavy`
   * This allows for less delay during the update -> renderItemSheet -> set tab cycle
   */
  renderLite() {
    ItemLinkTree.log(false, "RENDERING");
    // Update the nav menu
    const treeTabButton = $(
      '<a class="item" data-tab="tree">' + game.i18n.localize(`${ItemLinkTree.MODULE_ID}.tab.label`) + "</a>"
    );
    const tabs = this.sheetHtml.find('.tabs[data-group="primary"]');

    if (!tabs) {
      return;
    }

    tabs.append(treeTabButton);

    // Create the tab
    const sheetBody = this.sheetHtml.find(".sheet-body");
    const treeTab = $(`<div class="tab tree flexcol" data-group="primary" data-tab="tree"></div>`);
    sheetBody.append(treeTab);

    this.renderHeavy(treeTab);
  }

  /**
   * Heavy lifting part of the items tab rendering which involves getting the items and painting them
   */
  async renderHeavy(treeTab) {
    // await this.itemLinkTreeItem.refresh();
    // Add the list to the tab
    const treeTabHtml = $(await this._renderLeafsList());
    treeTab.append(treeTabHtml);

    // Activate Listeners for this ui.
    treeTabHtml.on("click", ".item-name", this._handleItemClick.bind(this));
    treeTabHtml.on("click", ".item-delete", this._handleItemDeleteClick.bind(this));
    treeTabHtml.on("click", ".item-destroy", this._handleItemDestroyClick.bind(this));
    treeTabHtml.on("click", ".configure-overrides", this._handleItemEditClick.bind(this));

    // Register a DragDrop handler for adding new items to this item
    const dragDrop = {
      dragSelector: ".item",
      dropSelector: ".item-link-tree-tab",
      permissions: { drop: () => this.app.isEditable && !this.item.isOwned },
      callbacks: { drop: this._dragEnd },
    };
    this.app.element[0]
      .querySelector(dragDrop.dropSelector)
      .addEventListener("drop", dragDrop.callbacks.drop.bind(this));
  }
}

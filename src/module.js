import { ItemLinkTreeItemSheet } from "./scripts/classes/item-sheet.js";
import { _registerSettings } from "./scripts/classes/settings.js";

export class ItemLinkTree {
  static API = {};

  static MODULE_ID = "item-link-tree";

  static SETTINGS = {};

  static FLAGS = {
    itemLeafs: "item-leafs",
    // parentItem: "parent-item",
  };

  static TEMPLATES = {
    treeTab: `modules/${this.MODULE_ID}/templates/item-link-tree-tab.hbs`,
    overrides: `modules/${this.MODULE_ID}/templates/item-link-tree-overrides-form.hbs`,
  };

  /**
   * A console.log wrapper which checks if we are debugging before logging
   */
  static log(force, ...args) {
    try {
      const shouldLog = force || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.MODULE_ID, "boolean");

      if (shouldLog) {
        console.log(this.MODULE_ID, "|", ...args);
      }
    } catch (e) {
      console.error(e.message);
    }
  }

  static preloadTemplates() {
    loadTemplates(Object.values(flattenObject(this.TEMPLATES)));
  }
}

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(ItemLinkTree.MODULE_ID);
});

Hooks.once("init", () => {
  ItemLinkTree.log(true, "Initialized");

  ItemLinkTree.preloadTemplates();

  // ItemLinkTreeActorSheet.init();
});

Hooks.once("setup", _registerSettings);

ItemLinkTreeItemSheet.init();
// ItemLinkTreeActor.init();

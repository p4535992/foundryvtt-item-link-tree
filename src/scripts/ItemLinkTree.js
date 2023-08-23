import CONSTANTS from "./constants/constants";

export class ItemLinkTree {
  static API = {};

  static MODULE_ID = CONSTANTS.MODULE_ID;

  static SETTINGS = {};

  static FLAGS = {
    itemLeafs: CONSTANTS.FLAGS.itemLeafs,
    // parentItem: CONSTANTS.FLAGS.parentItem,
  };

  static TEMPLATES = {
    treeTab: `modules/${this.MODULE_ID}/templates/item-link-tree-tab.hbs`,
    // overrides: `modules/${this.MODULE_ID}/templates/item-link-tree-overrides-form.hbs`,
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

  static ItemSheetLeafFeatureInitialize() {
    // Register  Item Sheet and do not make default
    Items.registerSheet("dnd5e", ItemSheetLeafFeature, {
      makeDefault: false,
      label: "ItemSheetLeafFeature",
      types: ["tool"],
    });
  }
}

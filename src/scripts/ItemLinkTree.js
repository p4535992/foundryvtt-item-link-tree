import CONSTANTS from "./constants/constants.js";
import { ItemLinkTreeHelpers } from "./lib/item-link-tree.js";
import { warn } from "./lib/lib.js";
import { ItemSheetLeafFeature } from "./systems/dnd5e/sheets/ItemSheetLeafFeature.js";

export class ItemLinkTree {
  // static API = {};

  // static MODULE_ID = CONSTANTS.MODULE_ID;

  // static SETTINGS = {};

  // static FLAGS = {
  //   itemLeafs: CONSTANTS.FLAGS.itemLeafs,
  //   // parentItem: CONSTANTS.FLAGS.parentItem,
  // };

  static TEMPLATES = {
    treeTab: `modules/${CONSTANTS.MODULE_ID}/templates/item-link-tree-tab.hbs`,
    // overrides: `modules/${this.MODULE_ID}/templates/item-link-tree-overrides-form.hbs`,
  };

  static preloadTemplates() {
    loadTemplates(Object.values(flattenObject(this.TEMPLATES)));
  }

  static ItemSheetLeafFeatureInitialize() {
    ItemLinkTreeHelpers.registerSheet();
  }
}

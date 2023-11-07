import CONSTANTS from "./constants/constants.js";
import { warn } from "./lib/lib.js";
import { ItemSheetLeafFeature } from "./systems/dnd5e/sheets/ItemSheetLeafFeature.js";

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

  static preloadTemplates() {
    loadTemplates(Object.values(flattenObject(this.TEMPLATES)));
  }

  static ItemSheetLeafFeatureInitialize() {
    if (game.system.id === "dnd5e") {
      // Register  Item Sheet and do not make default
      Items.registerSheet("dnd5e", ItemSheetLeafFeature, {
        makeDefault: false,
        label: "ItemSheetLeafFeature",
        types: ["tool"],
      });
    } else {
      warn(
        `No sheet is been prepared for this system please contacts the developer on the git project issues page`,
        true
      );
    }
  }
}

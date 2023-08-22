import { ItemLinkTree } from "../../module.js";
import { applyLocksItemSheet } from "./app/tidy5e-lockers.js";
import { debug } from "./app/tidy5e-logger-util.js";
import { tidy5eShowItemArt } from "./app/tidy5e-show-item-art.js";
import { applySpellClassFilterItemSheet } from "./app/tidy5e-spellClassFilter.js";

export class ItemSheetLeafFeature extends dnd5e.applications.item.ItemSheet5e {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["item-link-tree", "leaf", "sheet", "item"],
    });
  }

  /** @inheritdoc */
  get template() {
    return `modules/${ItemLinkTree.MODULE_ID}/templates/leaf.hbs`;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const item = context.item;
    const source = item.toObject();

    // TODO to localize
    let customTypeTypes = {
      effect: "Effect",
      bonus: "Bonus",
      effectAndBonus: "Effect and Bonus",
    };

    // Item rendering data
    foundry.utils.mergeObject(context, {
      customTypeTypes: customTypeTypes,
    });
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    let item = this.item;
  }
}

// async function addEditorHeadline(app, html, data) {
//     html
//       .find(".tab[data-tab=description] .editor")
//       .prepend(`<h2 class="details-headline">${game.i18n.localize("TIDY5E.ItemDetailsHeadline")}</h2>`);
// }

/* -------------------------------------------- */

// export function ItemSheetLeafFeatureInitialize() {
//   // Register  Item Sheet and make default
//   Items.registerSheet("dnd5e", ItemSheetLeafFeature, { makeDefault: false, label: "ItemSheetLeafFeature" });
// }

// Hooks.on("renderItemSheetLeafFeature", (app, html, data) => {
//     addEditorHeadline(app, html, data);
// });

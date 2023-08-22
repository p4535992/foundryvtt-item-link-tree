import { ItemLinkTree } from "../../module.js";

export class ItemSheetLeafFeature extends dnd5e.applications.item.ItemSheet5e {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["item-link-tree", "leaf", "dnd5e", "sheet", "item"],
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
      none: "",
      effect: "Effect",
      bonus: "Bonus",
      effectAndBonus: "Effect and Bonus",
    };

    // Item rendering data
    foundry.utils.mergeObject(context, {
      customTypeTypes: customTypeTypes,
      flags: item.flags,
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

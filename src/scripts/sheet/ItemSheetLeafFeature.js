import CONSTANTS from "../constants/constants.js";

export class ItemSheetLeafFeature extends dnd5e.applications.item.ItemSheet5e {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["item-link-tree", "leaf", "dnd5e", "sheet", "item"],
    });
  }

  /** @inheritdoc */
  get template() {
    return `modules/${CONSTANTS.MODULE_ID}/templates/item-sheet-leaf.hbs`;
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    const item = context.item;
    const source = item.toObject();

    let subTypeTypes = {
      none: "",
      gem: "Gem",
    };

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
      subTypeTypes: subTypeTypes,
      flags: item.flags,
      isNotGM: !game.user.isGM,
      isGM: game.user.isGM,
    });
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    let item = this.item;
  }
}

import CONSTANTS from "../constants/constants.js";
import { i18n } from "../lib/lib.js";

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
      gem: i18n(`item-link-tree.gem.label`),
      leaf: i18n(`item-link-tree.leaf.label`),
    };

    // TODO to localize
    let customTypeTypes = {
      none: "",
      effect: "Effect",
      bonus: "Bonus",
      effectAndBonus: "Effect and Bonus",
    };

    let subType = item.getFlag(`item-link-tree`, `subType`) ?? "";
    if (Array.isArray(subType)) {
      subType = "";
      setProperty(item.flags, `item-link-tree.subType`, subType);
    }
    let subTypeSymbol = "";
    if (subType) {
      let symbol = "";
      if (subType === "gem") {
        symbol = CONSTANTS.SYMBOLS.GEM;
      } else if (subType === "leaf") {
        symbol = CONSTANTS.SYMBOLS.LEAF;
      } else if (subType === "none") {
        symbol = CONSTANTS.SYMBOLS.NONE;
      } else {
        symbol = "";
      }

      subTypeSymbol = symbol;

      let currentName = item.name
        .replaceAll(symbol, "")
        .replaceAll(CONSTANTS.SYMBOLS.GEM, "")
        .replaceAll(CONSTANTS.SYMBOLS.LEAF, "")
        .replaceAll(CONSTANTS.SYMBOLS.NONE, "")
        .trim();
      currentName = currentName + " ";
      currentName += symbol.repeat(1);
      currentName = currentName.trim();
      setProperty(context.item, `name`, currentName);
    }

    // Item rendering data
    foundry.utils.mergeObject(context, {
      customTypeTypes: customTypeTypes,
      subTypeTypes: subTypeTypes,
      flags: item.flags,
      isNotGM: !game.user.isGM,
      isGM: game.user.isGM,
      subTypeSymbol: subTypeSymbol,
    });
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    let item = this.item;
  }
}

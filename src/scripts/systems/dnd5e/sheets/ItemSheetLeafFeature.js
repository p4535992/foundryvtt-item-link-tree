import CONSTANTS from "../../../constants/constants.js";
import Logger from "../../../lib/Logger.js";
import { parseAsArray } from "../../../lib/lib.js";

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

    const subtypesSettings = parseAsArray(game.settings.get(CONSTANTS.MODULE_ID, "selectableSubtypes") ?? []);
    let subTypeTypes = {};
    subTypeTypes["none"] = "";
    for (const typeOpt of subtypesSettings) {
      const opt = parseAsArray(typeOpt, "|");
      const value = opt[0];
      const label = Logger.i18n(opt[1]);
      subTypeTypes[value] = label;
    }
    // let subTypeTypes = {
    //   none: "",
    //   gem: Logger.i18n(`item-link-tree.gem.label`),
    //   leaf: Logger.i18n(`item-link-tree.leaf.label`),
    // };

    // TODO to localize
    let customTypeTypes = {
      none: "",
      effect: "Effect",
      bonus: "Bonus",
      effectAndBonus: "Effect and Bonus",
      upgrade: "Upgrade",
    };

    let subType = item.getFlag(`item-link-tree`, `subType`) ?? "";
    if (Array.isArray(subType)) {
      subType = "";
      setProperty(item.flags, `item-link-tree.subType`, subType);
    }
    let subTypeSymbol = "";
    if (subType) {
      // let symbol = "";
      // if (subType === "gem") {
      //   symbol = CONSTANTS.SYMBOLS.GEM;
      // } else if (subType === "leaf") {
      //   symbol = CONSTANTS.SYMBOLS.LEAF;
      // } else if (subType === "none") {
      //   symbol = CONSTANTS.SYMBOLS.NONE;
      // } else {
      //   symbol = "";
      // }
      // subTypeSymbol = symbol;
      // let currentName = ItemLinkTreeManager._cleanName(item.name);
      // currentName = currentName + " ";
      // currentName += symbol.repeat(1);
      // currentName = currentName.trim();
      // setProperty(context.item, `name`, currentName);
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

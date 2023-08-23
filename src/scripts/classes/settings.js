import CONSTANTS from "../constants/constants.js";

// the item types that can NEVER have items in them.
export const EXCLUDED_TYPES = ["class", "subclass", "background", "race", "spell", "loot"];

export function _registerSettings() {
  const TYPES = Item.TYPES.filter((t) => !EXCLUDED_TYPES.includes(t));

  for (const type of TYPES) {
    game.settings.register(CONSTANTS.MODULE_ID, `includeItemType${type.titleCase()}`, {
      scope: "world",
      config: false,
      type: Boolean,
      default: true,
      requiresReload: true,
    });
  }

  game.settings.register(CONSTANTS.MODULE_ID, "sortOrder", {
    name: "item-link-tree.SETTINGS.SORT_ORDER.NAME",
    hint: "item-link-tree.SETTINGS.SORT_ORDER.HINT",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "gmOnly", {
    name: "item-link-tree.SETTINGS.GM_ONLY.NAME",
    hint: "item-link-tree.SETTINGS.GM_ONLY.HINT",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: false,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "playerCanOnlyView", {
    name: "item-link-tree.SETTINGS.PLAYER_CAN_ONLY_VIEW.NAME",
    hint: "item-link-tree.SETTINGS.PLAYER_CAN_ONLY_VIEW.HINT",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: false,
  });

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "itemTypeExclusion", {
    name: "item-link-tree.SETTINGS.ITEM_EXCLUSION.NAME",
    hint: "item-link-tree.SETTINGS.ITEM_EXCLUSION.HINT",
    scope: "world",
    config: true,
    type: ItemLinkTree_TypeSettings,
    label: "item-link-tree.SETTINGS.ITEM_EXCLUSION.NAME",
    restricted: true,
  });
}

class ItemLinkTree_TypeSettings extends FormApplication {
  get id() {
    return `${CONSTANTS.MODULE_ID}-item-type-exclusion-menu`;
  }

  get title() {
    return game.i18n.localize("item-link-tree.SETTINGS.ITEM_EXCLUSION.TITLE");
  }

  get template() {
    return `modules/${CONSTANTS.MODULE_ID}/templates/settingsMenu.hbs`;
  }

  async getData() {
    const TYPES = Item.TYPES.filter((t) => !EXCLUDED_TYPES.includes(t));
    const data = await super.getData();
    data.types = [];
    for (const type of TYPES) {
      const label = type.titleCase();
      data.types.push({
        checked: game.settings.get(CONSTANTS.MODULE_ID, `includeItemType${label}`),
        value: type,
        label,
      });
    }
    return data;
  }

  async _updateObject(event, formData) {
    Object.entries(formData).forEach(([type, bool]) => {
      game.settings.set(CONSTANTS.MODULE_ID, `includeItemType${type.titleCase()}`, bool);
    });
  }
}

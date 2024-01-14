const CONSTANTS = {
  MODULE_ID: "item-link-tree",
  PATH: `modules/item-link-tree/`,
  FLAGS: {
    itemLeafs: "item-leafs",
    // parentItem: "parent-item",
    isLeaf: "isLeaf",
    customType: "customType",
    shortDescription: "shortDescription",
    subType: "subType",
    filterItemType: "filterItemType",
    showImageIcon: "showImageIcon",
  },
  // https://www.vertex42.com/ExcelTips/unicode-symbols.html
  SYMBOLS: {
    NONE: "",
    LEAF: "🍃",
    GEM: "💎",
    // UPGRADE: "💎", // NOT USED
    CRYSTAL: "💠",
  },
  IMAGES: {
    IS_BEAVER_CRAFTED: "modules/item-link-tree/assets/images/placeholders/beaver_crafted.png",
    IS_BROKEN_LINK: "modules/item-link-tree/assets/images/placeholders/broken_link.png",
    IS_LINKED: "modules/item-link-tree/assets/images/placeholders/linked.png",
    IS_UPGRADED_WITH_SUCCESS: "modules/item-link-tree/assets/images/placeholders/upgrade_chat_image_success.png",
  },
};

CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;

export default CONSTANTS;

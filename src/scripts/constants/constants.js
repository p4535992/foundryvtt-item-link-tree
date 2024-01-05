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
};

CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;

export default CONSTANTS;

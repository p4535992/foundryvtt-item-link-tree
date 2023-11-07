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
  },
  // SYMBOLS: {
  //   NONE: "",
  //   LEAF: "🍃",
  //   GEM: "💎",
  // },
  FLAGS: {
    itemLeafs: CONSTANTS.FLAGS.itemLeafs,
    // parentItem: CONSTANTS.FLAGS.parentItem,
  },
};

CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;

export default CONSTANTS;

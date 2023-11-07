import CONSTANTS from "../constants/constants.js";
import { error, getItemSync, parseAsArray } from "../lib/lib.js";

const API = {
  getCollection(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw error("getCollection | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw error("getCollection | inAttributes must be of type object");
    }

    const item = getItemSync(inAttributes.item);
    return item.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs);
  },

  getCollectionEffectAndBonus(item) {
    const options = {
      item: item,
    };
    const leafs = this.getCollection(options);
    if (leafs?.length <= 0) {
      return [];
    }
    const leafsFilter = leafs.filter((leaf) => {
      return leaf.customLink === "bonus" || leaf.customLink === "effect" || leaf.customLink === "effectAndBonus";
    });
    return leafsFilter;
  },

  isItemLeaf(itemToCheck) {
    const isLeaf = itemToCheck.getFlag("item-link-tree", "isLeaf");
    if (isLeaf) {
      return true;
    }
    return false;
  },

  isFilterByItemTypeOk(itemToCheck, itemType) {
    const filterItemType = itemToCheck.getFlag("item-link-tree", "filterItemType");
    if (filterItemType && itemType) {
      const filterItemTypeArr = parseAsArray(filterItemType);
      if (filterItemTypeArr.length > 0 && filterItemTypeArr.includes(itemType)) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  },

  hasSubtype(item, subtype) {
    const options = {
      item: item,
    };
    const leafs = this.getCollection(options);
    if (leafs?.length <= 0) {
      return false;
    }

    const leafsFilter = leafs.find((leaf) => {
      return leaf.subType === subtype;
    });
    return !!leafsFilter;
  },

  // isShowImageIconEnabled(item) {
  //   const options = {
  //     item: item,
  //   };
  //   const leafs = this.getCollection(options);
  //   if (leafs?.length <= 0) {
  //     return false;
  //   }

  //   const leafsFilter = leafs.find((leaf) => {
  //     return leaf.showImageIcon;
  //   });
  //   return !!leafsFilter;
  // },
};

export default API;

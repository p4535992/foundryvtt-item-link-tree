import CONSTANTS from "../constants/constants.js";
import { error, getItem } from "../lib/lib.js";

const API = {
  getCollection: function (item) {
    item = getItem(item);
    return item.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.itemLeafs);
  },
};

export default API;

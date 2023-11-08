import API from "./scripts/API/api.js";
import { ItemLinkTree } from "./scripts/ItemLinkTree.js";
import { ItemLinkTreeItemSheet } from "./scripts/classes/ItemLinkTreeItemSheet.js";
import { _registerSettings } from "./scripts/classes/settings.js";
import CONSTANTS from "./scripts/constants/constants.js";
import { ItemLinkTreeHelpers } from "./scripts/lib/item-link-tree-helpers.js";

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});

Hooks.once("init", () => {
  ItemLinkTree.preloadTemplates();
  ItemLinkTree.ItemSheetLeafFeatureInitialize();
});

Hooks.once("setup", () => {
  _registerSettings();
  setApi(API);
});

Hooks.once("ready", () => {
  ItemLinkTreeItemSheet.init();
});

// Add any additional hooks if necessary

Hooks.on("renderActorSheet", (app, html, data) => {
  ItemLinkTreeHelpers.applyImagesOnInventory(app, html, data);
});

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api) {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  data.api = api;
}

/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi() {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  return data.api;
}

/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket) {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  data.socket = socket;
}

/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  return data.socket;
}

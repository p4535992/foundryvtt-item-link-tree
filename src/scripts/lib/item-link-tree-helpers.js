import API from "../API/api";
import CONSTANTS from "../constants/constants";
import { ItemSheetLeafFeature } from "../systems/dnd5e/sheets/ItemSheetLeafFeature";
import Logger from "./Logger";
import { BeaverCraftingHelpers } from "./beavers-crafting-helpers";
import { ItemLinkingHelpers } from "./item-linking-helper";
import { getItemAsync, getItemSync } from "./lib.js";
import { PoppersJsHelpers } from "./poppers-js-helpers";

export class ItemLinkTreeHelpers {
  static registerSheet() {
    // =================================
    // DnD5e
    // =================================
    if (game.system.id === "dnd5e") {
      // Register  Item Sheet and do not make default
      Items.registerSheet("dnd5e", ItemSheetLeafFeature, {
        makeDefault: false,
        label: "ItemSheetLeafFeature",
        types: ["tool"], // TODO Can't use tool...
      });
    } else {
      Logger.warn(
        `No sheet is been prepared for this system please contacts the developer on the git project issues page`,
        true
      );
    }
  }

  static async applyImagesOnInventory(app, html, data) {
    if (!app) {
      return;
    }
    const actor = app.object;

    // =================================
    // DnD5e
    // =================================
    if (game.system.id === "dnd5e") {
      let items = [];
      const isTidySheetKgar = actor.sheet.id.startsWith("Tidy5eCharacterSheet");
      if (isTidySheetKgar) {
        // items = html.find($(".item-table .item-table-row"));
        items = $(html)[0].querySelectorAll(`[data-tab-contents-for="inventory"] [data-tidy-item-table-row]`);
      } else {
        items = html.find($(".item-list .item"));
      }

      for (let itemElement of items) {
        let htmlId = itemElement.outerHTML.match(/data-item-id="(.*?)"/);
        if (!htmlId) {
          continue;
        }
        let id = htmlId[1];
        let item = actor.items.get(id);
        if (!item) {
          continue;
        }
        let title = null;
        if (isTidySheetKgar) {
          title = itemElement.querySelector(".item-name");
        } else {
          title = itemElement.querySelector("h4");
        }
        title.style.display = "contents";

        if (isTidySheetKgar) {
          //
        } else {
          const leafs = API.getCollection({ item: item });
          if (leafs) {
            for (const leaf of leafs) {
              if (await ItemLinkTreeHelpers.isApplyImagesActive(leaf)) {
                const leafTmp = await ItemLinkTreeHelpers.retrieveLeafDataAsync(leaf);
                // if (leafTmp.showImageIcon) {
                const icon = leafTmp.img;
                const tooltipText = leafTmp.shortDescriptionLink
                  ? leafTmp.shortDescriptionLink
                  : leafTmp.shortDescription
                  ? leafTmp.shortDescription
                  : leafTmp.subType;
                const img = document.createElement("img");
                img.src = icon;
                // img.classList.add("item-image");
                img.style.border = "none";
                img.style.marginRight = "5px";
                img.style.marginLeft = "5px";
                img.style.height = "20px";
                img.style.width = "20px";
                if (tooltipText) {
                  img.dataset.tooltip = tooltipText;
                  img.dataset.tooltipDirection = "UP";
                }
                title.prepend(img);
              }
            }
          }
        }
      }
    }
  }

  static async transferFlagsFromItemToItem(itemWherePutTheFlags, itemWithTheFlags) {
    itemWherePutTheFlags = await getItemAsync(itemWherePutTheFlags);
    itemWithTheFlags = await getItemAsync(itemWithTheFlags);
    const currentFlags = getProperty(itemWherePutTheFlags, `flags.${CONSTANTS.MODULE_ID}`) ?? {};
    const newFlags = getProperty(itemWithTheFlags, `flags.${CONSTANTS.MODULE_ID}`) ?? {};
    const updatedFlags = mergeObject(currentFlags, newFlags);
    await itemWherePutTheFlags.update(
      {
        flags: {
          [CONSTANTS.MODULE_ID]: {
            updatedFlags,
          },
        },
      },
      { render: false }
    );
  }

  static async isApplyImagesActive(leaf) {
    let itemTmp = await getItemAsync(leaf);
    if (ItemLinkingHelpers.isItemLinked(itemTmp)) {
      itemTmp = ItemLinkingHelpers.retrieveLinkedItem(itemTmp);
      const isApplyImagesActive = getProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.showImageIcon}`);
      return isApplyImagesActive;
    } else {
      if (itemTmp?.flags) {
        const isApplyImagesActive = getProperty(
          itemTmp,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.showImageIcon}`
        );
        return isApplyImagesActive;
      } else {
        return leaf.showImageIcon;
      }
    }
  }

  static async retrieveLeafDataAsync(leaf) {
    let itemTmp = await getItemAsync(leaf);
    if (ItemLinkingHelpers.isItemLinked(itemTmp)) {
      itemTmp = ItemLinkingHelpers.retrieveLinkedItem(itemTmp);
      let data = getProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`);
      data = mergeObject(leaf, data);
      return data;
    } else {
      if (itemTmp?.flags) {
        let data = getProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`);
        data = mergeObject(leaf, data);
        return data;
      } else {
        return leaf;
      }
    }
  }
}

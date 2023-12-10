import API from "../API/api";
import { ItemLinkTreeItem } from "../classes/ItemLinkTreeItem";
import CONSTANTS from "../constants/constants";
import { ItemLinkTreeManager } from "../item-link-tree-manager";
import { BabonusHelpers } from "./babonus-helpers";
import { BeaverCraftingHelpers } from "./beavers-crafting-helpers";
import { DaeHelpers } from "./dae-helpers";
import { ItemLinkTreeHelpers } from "./item-link-tree-helpers";
import { ItemLinkingHelpers } from "./item-linking-helper";
import { error, findAsync, getItemAsync, getItemSync, log } from "./lib";

export class UpgradeItemHelpers {
  // // Insert here the list of compendiums names for every macro "type"
  // const COMPENDIUM = {
  //     armor: ["ArmaturePG"],
  //     weapon: ["ArmiPG"],
  //   };

  static async _retrieveItemTreeUpgrade(COMPENDIUM) {
    const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  /**
   * @param {Record<string,string[]>} COMPENDIUM
   * @param {string} type e.g 'armor' | 'weapon'
   * @param {number} target_bonus  e.g. 0
   * @returns
   */
  static async _retrieveItemTreeUpgradeByBonus(COMPENDIUM, type, target_bonus) {
    if (!(type in COMPENDIUM)) {
      return error(`The macro was called with an invalid argument "type": ${type}`, true);
    }

    if (!(target_bonus > 0)) {
      return error(`The macro was called with an invalid argument "target_bonus": ${target_bonus}`, true);
    }

    const base_bonus = target_bonus - 1;

    // ------------------------------------ //
    const compendiums = COMPENDIUM[type].map((pack) => game.packs.contents.find((p) => p.metadata.label === pack));

    // Asserting every compendium exists
    if (compendiums.some((c) => c === undefined)) {
      const name = COMPENDIUM[type][compendiums.indexOf(undefined)];
      return error(`Compendium not found: ${name}`, true);
    }

    // ------------------------------------ //
    const promisesDocuments = compendiums.map((c) => c.getDocuments());
    const compendiumItems = (await Promise.all(promisesDocuments)).flat();

    const rgx = new RegExp(`(.+) \\+${target_bonus}`);
    const itemsList = compendiumItems
      .map((i) => {
        const match = i.name.match(rgx);
        if (!match) return;
        return [match[1] + (base_bonus === 0 ? "" : ` +${base_bonus}`), i];
      })
      .filter(Boolean);
    const mappedItems = Object.fromEntries(itemsList);
    // const itemKeys = Object.keys(mappedItems);
    // const targetItem = mappedItems[item.name];
  }
}

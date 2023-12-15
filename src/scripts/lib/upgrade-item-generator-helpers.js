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

export class UpgradeItemGeneratorHelpers {
  // // Insert here the list of compendiums names for every macro "type"
  // const COMPENDIUM = {
  //     armor: ["ArmaturePG"],
  //     weapon: ["ArmiPG"],
  //   };

  // static async _retrieveItemTreeUpgrade(COMPENDIUM) {
  //   const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // }

  static generateItemUpgradeCompendiums(compendiumsRecords) {
    for (const [key, values] of Object.entries(compendiumsRecords)) {
      UpgradeItemGeneratorHelpers._retrieveItemTreeUpgradeByBonus(values, key, undefined);
    }
  }

  /**
   * @param {Record<string,string[]>} compendiumsToCheck
   * @param {string} type e.g 'armor' | 'weapon'
   * @param {number} target_bonus  e.g. 0
   * @returns
   */
  static async _retrieveItemTreeUpgradeByBonus(compendiumsToCheck, type, target_bonus) {
    // if (!(type in compendiumsToCheck)) {
    //   throw error(`The macro was called with an invalid argument "type": ${type}`, true);
    // }

    // if (!(target_bonus > 0)) {
    //   throw  error(`The macro was called with an invalid argument "target_bonus": ${target_bonus}`, true);
    // }

    // const base_bonus = target_bonus - 1;

    // ------------------------------------ //
    const compendiums = compendiumsToCheck.map((pack) => game.packs.contents.find((p) => p.metadata.label === pack));
    // let allCompendiums = [game.packs.get("harvester.harvest")];
    let itemTypes = await game.documentTypes.Item.sort();
    if (!itemTypes.includes(type)) {
      throw error(`The macro was called with an invalid argument "type": ${type}`, true);
    }

    // Asserting every compendium exists
    if (compendiums.some((c) => c === undefined)) {
      const name = compendiums.indexOf(undefined);
      throw error(`Compendium not found: ${name}`, true);
    }

    // ------------------------------------ //
    const promisesDocuments = compendiums.map((c) => c.getDocuments());
    const compendiumItems = (await Promise.all(promisesDocuments)).flat();

    const rgx = new RegExp(`(.+) \\+\\d+`);
    const itemsListBaseToCheck = compendiumItems
      .map((i) => {
        const match = i.name.match(rgx);
        if (!match) {
          return i;
        }
      })
      .filter((item) => !!item);
    // const mappedItems = Object.fromEntries(itemsList);
    // const itemKeys = Object.keys(mappedItems);
    // const targetItem = mappedItems[item.name];
    const mappedItems = itemsListBaseToCheck;

    for (const mappedItem of mappedItems) {
      const currentName = mappedItem.name.trim();
      const currentImage = mappedItem.img;
      const currentItemType = mappedItem.type;

      const itemsListByNamePrefix =
        compendiumItems
          .map((i) => {
            const match = currentName.startsWith(i.name.trim());
            if (match) {
              return i;
            }
          })
          .filter((item) => !!item) ?? [];

      const rgx2 = new RegExp(`(.+) \\+\\d+`);
      const itemsListBaseToCheck = compendiumItems
        .map((i) => {
          const match = i.name.match(rgx2);
          if (!match) {
            return i;
          }
        })
        .filter((item) => !!item);

      const options = {};
      const document = await Item.create(
        {
          name: "Crystal " + currentName + " ",
          img:
            UpgradeItemGeneratorHelpers.crystalMap[currentItemType] || UpgradeItemGeneratorHelpers.crystalMap["none"],
          type: currentItemType,
          system: {
            description: `A crystal for upgrade some item`,
            price: {
              value: 5,
              denomination: "gp",
            },
            quantity: 1,
            weight: 0.5,
            rarity: "uncommon",
          },
        },
        options
      );
      for (const itemTmp of itemsListByNamePrefix) {
        const leafOptions = {
          name: itemTmp.name,
          img: itemTmp.img,
          uuid: itemTmp.uuid,
          id: itemTmp.id ? itemTmp.id : itemTmp._id, // Strange use case for compendium
          customLink: currentName === itemTmp.name.trim() ? "source" : null,
          shortDescriptionLink: currentName === itemTmp.name.trim() ? "" : currentName,
          subType: null,
          showImageIcon: false,
        };
        API.addLeaf(document, itemTmp, leafOptions);
      }
      break;
    }
  }

  static crystalMap = new Map([
    ["none", "icons/commodities/gems/gem-faceted-rough-blue.webp"],
    ["weapon", "icons/commodities/gems/gem-faceted-rough-red.webp"],
    ["armor", "icons/commodities/gems/gem-faceted-rough-purple.webp"],
  ]);
}

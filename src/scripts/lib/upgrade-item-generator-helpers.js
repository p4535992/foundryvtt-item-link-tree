import API from "../API/api";
import { ItemLinkTreeItem } from "../classes/ItemLinkTreeItem";
import CONSTANTS from "../constants/constants";
import { ItemLinkTreeManager } from "../item-link-tree-manager";
import Logger from "./Logger";
import { BabonusHelpers } from "./babonus-helpers";
import { BeaverCraftingHelpers } from "./beavers-crafting-helpers";
import { DaeHelpers } from "./dae-helpers";
import { ItemLinkTreeHelpers } from "./item-link-tree-helpers";
import { ItemLinkingHelpers } from "./item-linking-helper";

export class UpgradeItemGeneratorHelpers {
  // // Insert here the list of compendiums names for every macro "type"
  // const COMPENDIUM = {
  //     armor: ["ArmaturePG"],
  //     weapon: ["ArmiPG"],
  //   };

  // static async _retrieveItemTreeUpgrade(COMPENDIUM) {
  //   const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // }

  static _compareByName(a, b) {
    const propertyKey = "name";
    if (getProperty(a, propertyKey) < getProperty(b, propertyKey)) {
      return -1;
    }
    if (getProperty(a, propertyKey) > getProperty(b, propertyKey)) {
      return 1;
    }
    return 0;
  }

  static async generateItemUpgradeCompendiums(compendiumsRecords) {
    for (const [key, values] of Object.entries(compendiumsRecords)) {
      await UpgradeItemGeneratorHelpers._retrieveItemTreeUpgradeByBonus(values, key, undefined);
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
    //   throw Logger.error(`The macro was called with an invalid argument "type": ${type}`, true);
    // }

    // if (!(target_bonus > 0)) {
    //   throw  Logger.error(`The macro was called with an invalid argument "target_bonus": ${target_bonus}`, true);
    // }

    // const base_bonus = target_bonus - 1;

    // ------------------------------------ //
    const compendiums = compendiumsToCheck.map((pack) => game.packs.contents.find((p) => p.metadata.label === pack));
    // let allCompendiums = [game.packs.get("harvester.harvest")];
    let itemTypes = await game.documentTypes.Item.sort();
    if (!itemTypes.includes(type)) {
      throw Logger.error(`The macro was called with an invalid argument "type": ${type}`, true);
    }

    // Asserting every compendium exists
    if (compendiums.some((c) => c === undefined)) {
      const name = compendiums.indexOf(undefined);
      throw Logger.error(`Compendium not found: ${name}`, true);
    }

    // ------------------------------------ //
    const promisesDocuments = compendiums.map((c) => c.getDocuments());
    const compendiumItems = (await Promise.all(promisesDocuments)).flat();

    const rgx = new RegExp(`(.+) \\+\\d+`);
    const itemsListBaseToCheck =
      compendiumItems
        .map((i) => {
          const match = i.name?.match(rgx);
          if (!match) {
            return i;
          }
        })
        .filter((item) => !!item)
        .sort(UpgradeItemGeneratorHelpers._compareByName) ?? [];
    // const mappedItems = Object.fromEntries(itemsList);
    // const itemKeys = Object.keys(mappedItems);
    // const targetItem = mappedItems[item.name];

    for (const mappedItem of itemsListBaseToCheck) {
      const currentName = mappedItem.name?.trim();
      const currentImage = mappedItem.img;
      const currentItemType = mappedItem.type;

      const itemsListByNamePrefix =
        compendiumItems
          .map((i) => {
            const match = i.name?.trim().startsWith(currentName.trim());
            if (match) {
              return i;
            }
          })
          .filter((item) => !!item)
          .sort(UpgradeItemGeneratorHelpers._compareByName) ?? [];

      const rgx2 = new RegExp(`(.+) \\+\\d+`);
      const itemsListOptionByName =
        compendiumItems
          .map((i) => {
            const match = i.name?.match(rgx2) && i.name?.trim().startsWith(currentName.trim());
            if (match) {
              return i.name;
            }
          })
          .filter((item) => !!item)
          .sort(UpgradeItemGeneratorHelpers._compareByName) ?? [];

      const options = {};
      const document = await Item.create(
        {
          name: "Crystal " + currentName + " " + CONSTANTS.SYMBOLS.CRYSTAL,
          img:
            UpgradeItemGeneratorHelpers.crystalMap.get(currentItemType) ||
            UpgradeItemGeneratorHelpers.crystalMap.get("none"),
          type: "tool",
          system: {
            description: `A crystal for upgrade some item based on '${currentName}'`,
            price: {
              value: 5,
              denomination: "gp",
            },
            quantity: 1,
            weight: 0.5,
            rarity: "uncommon",
          },
          flags: {
            [`${CONSTANTS.MODULE_ID}`]: {
              [`${CONSTANTS.FLAGS.customType}`]: "upgrade",
              [`${CONSTANTS.FLAGS.filterItemType}`]: currentItemType,
              [`${CONSTANTS.FLAGS.isLeaf}`]: true,
              [`${CONSTANTS.FLAGS.shortDescription}`]: null,
              [`${CONSTANTS.FLAGS.showImageIcon}`]: false,
              [`${CONSTANTS.FLAGS.subType}`]: "crystal",
            },
          },
        },
        options
      );

      for (const itemTmp of itemsListByNamePrefix) {
        if (currentName.trim() === itemTmp.name?.trim()) {
          const leafOptions = {
            name: itemTmp.name.trim(),
            img: itemTmp.img,
            uuid: itemTmp.uuid,
            id: itemTmp.id ? itemTmp.id : itemTmp._id, // Strange use case for compendium
            customLink: "source",
            shortDescriptionLink: currentName === itemTmp.name?.trim() ? null : currentName,
            subType: null,
            showImageIcon: false,
          };
          await API.addLeafLight(document, itemTmp, leafOptions);
        } else if (itemsListOptionByName.includes(itemTmp.name.trim())) {
          const bonuses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          let currentBonus = 0;
          for (const bonus of bonuses) {
            if (itemTmp.name?.trim() === String(currentName + " +" + bonus).trim()) {
              currentBonus = bonus;
              break;
            }
          }
          const leafOptions = {
            name: itemTmp.name.trim(),
            img: itemTmp.img,
            uuid: itemTmp.uuid,
            id: itemTmp.id ? itemTmp.id : itemTmp._id, // Strange use case for compendium
            customLink: "source",
            shortDescriptionLink:
              currentBonus == 1 ? currentName.trim() : String(currentName + " +" + (currentBonus - 1)).trim(),
            subType: null,
            showImageIcon: false,
          };
          await API.addLeafLight(document, itemTmp, leafOptions);
        } else {
          const leafOptions = {
            name: itemTmp.name.trim(),
            img: itemTmp.img,
            uuid: itemTmp.uuid,
            id: itemTmp.id ? itemTmp.id : itemTmp._id, // Strange use case for compendium
            customLink: "source",
            shortDescriptionLink: currentName === itemTmp.name?.trim() ? null : currentName,
            subType: null,
            showImageIcon: false,
          };
          await API.addLeafLight(document, itemTmp, leafOptions);
        }
      }
    }
  }

  static crystalMap = new Map([
    ["none", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["background", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["backpack", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["base", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["class", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["consumable", "icons/commodities/gems/gem-faceted-rough-green.webp"],
    ["equipment", "icons/commodities/gems/gem-faceted-rough-purple.webp"],
    ["feat", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["loot", "icons/commodities/gems/gem-faceted-rough-yellow.webp"],
    ["spell", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["subclass", "icons/commodities/gems/gem-cluster-blue-white.webp"],
    ["tool", "icons/commodities/gems/gem-faceted-rough-blue.webp"],
    ["weapon", "icons/commodities/gems/gem-faceted-rough-red.webp"],
  ]);
}

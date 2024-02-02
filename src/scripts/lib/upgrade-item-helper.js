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
import { getItemAsync, getItemSync, isRealNumber } from "./lib";

export class UpgradeItemHelpers {
  /**
   * @href https://stackoverflow.com/questions/55601062/using-an-async-function-in-array-find
   * @param {*} arr
   * @param {*} asyncCallback
   * @returns
   */
  static async _findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex((result) => result);
    return arr[index];
  }

  // // Insert here the list of compendiums names for every macro "type"
  // const COMPENDIUM = {
  //     armor: ["ArmaturePG"],
  //     weapon: ["ArmiPG"],
  //   };

  static removeItem = async (item) => {
    // TODO add a multisystem integration
    // const modify = item.system.quantity > 1;
    // if (modify) {
    //   await item.update({ "system.quantity": item.system.quantity - 1 });
    // } else {
    await item.delete();
    // }
  };

  static addItem = async (actor, item, currentName, currentImage) => {
    // TODO add a multisystem integration
    // const oldItem = actor.items.contents.find((i) => {
    //   // MOD 4535992
    //   // return i.name === item.name && i.getFlag("beavers-crafting", "isCrafted");
    //   // return i.name === currentName && BeaverCraftingHelpers.isItemBeaverCrafted(i);
    //   return ItemLinkTreeManager._cleanName(i.name) === ItemLinkTreeManager._cleanName(currentName); // && BeaverCraftingHelpers.isItemBeaverCrafted(i);
    // });
    // if (oldItem) {
    //   await oldItem.update({ "system.quantity": oldItem.system.quantity + 1 });
    //   return oldItem;
    // } else {
    const data = item.toObject();
    data.flags["beavers-crafting"] = { isCrafted: true };
    // MOD 4535992
    data.name = currentName;
    data.img = currentImage;

    const items = await actor.createEmbeddedDocuments("Item", [data]);
    return items[0];
    // }
  };

  // ------------------------------------ //
  // Arguments of the macro
  // actor: Actor
  // gem: Item
  // type: 'armor' | 'weapon'
  // target_bonus: number

  static async retrieveSuperiorItemAndReplaceOnActor(
    originalItem,
    originalCrystal
    // type,
    // target_bonus,
    // itemNewName,
    // itemNewImage,
    // itemNewPrefix,
    // itemNewSuffix
  ) {
    originalItem = await getItemAsync(originalItem);

    // TODO MAKE MULTISYSTEM
    if (originalItem.system.quantity !== 1) {
      throw Logger.error(`Could not find ${originalItem.name} for doing the upgrade`, true);
    }
    let baseLinkedItem = originalItem;
    if (ItemLinkingHelpers.isItemLinked(baseLinkedItem)) {
      baseLinkedItem = ItemLinkingHelpers.retrieveLinkedItem(baseLinkedItem);
      baseLinkedItem = await getItemAsync(baseLinkedItem);
    }

    const actorA = originalItem.actor;
    if (!actorA) {
      throw Logger.error(`${game.user.name} please at least select a actor`, true);
    }
    // Type checking
    if (!(actorA instanceof CONFIG.Actor.documentClass)) {
      throw Logger.error(`Invalid actor`, true);
    }

    const itemsLeafsOriginalBase = [];
    const leafsOriginalOnItem = API.getCollectionByFeature({
      item: originalItem,
      features: ["", "bonus", "effect", "effectAndBonus"],
    });
    for (const up of leafsOriginalOnItem) {
      try {
        let itemUp = await getItemAsync(up);
        if (itemUp) {
          // itemUp = await ItemLinkingHelpers.setLinkedItem(itemUp, itemUp);
          itemsLeafsOriginalBase.push(itemUp);
        }
      } catch (e) {
        throw Logger.error(e);
      }
    }

    originalCrystal = await getItemAsync(originalCrystal);

    // TODO MAKE MULTISYSTEM
    if (originalCrystal.system.quantity !== 1) {
      throw Logger.error(`Could not find ${originalCrystal.name} for doing the upgrade`, true);
    }
    let baseLinkedCrystal = originalCrystal;
    if (ItemLinkingHelpers.isItemLinked(baseLinkedCrystal)) {
      baseLinkedCrystal = ItemLinkingHelpers.retrieveLinkedItem(baseLinkedCrystal);
      baseLinkedCrystal = await getItemAsync(baseLinkedCrystal);
    }

    const upgradeSources =
      API.getCollectionByFeature({
        item: baseLinkedCrystal,
        features: ["source"],
      }) ?? [];
    const isCurrentItemASource = await UpgradeItemHelpers._findAsync(upgradeSources, async (i) => {
      //await upgradeSources.find(async (i) => {
      let iTmp = await getItemAsync(i);
      if (ItemLinkingHelpers.isItemLinked(iTmp)) {
        iTmp = ItemLinkingHelpers.retrieveLinkedItem(iTmp);
        iTmp = await getItemAsync(iTmp);
      }
      // let iTmp2 = await getItemAsync(originalItem);
      // if (ItemLinkingHelpers.isItemLinked(originalItem)) {
      //   iTmp2 = ItemLinkingHelpers.retrieveLinkedItem(originalItem);
      //   iTmp2 = await getItemAsync(iTmp2);
      // }
      // TODO control by name is enough ??
      return ItemLinkTreeManager._cleanName(iTmp.name) === ItemLinkTreeManager._cleanName(baseLinkedItem.name);
    });
    if (!isCurrentItemASource) {
      throw Logger.error(`The item '${originalItem.name}' cannot be upgraded because is not set as a source`);
    }

    const actorB = originalCrystal.actor;
    if (!actorB) {
      throw Logger.error(`${game.user.name} please at least select a actor`, true);
    }
    // Type checking
    if (!(actorB instanceof CONFIG.Actor.documentClass)) {
      throw Logger.error(`Invalid actor`, true);
    }

    if (actorA.id !== actorB.id) {
      throw Logger.error(`Invalid actor source and actor target`, true);
    }

    const customType = getProperty(baseLinkedCrystal, `flags.item-link-tree.customType`) ?? "";
    if (customType !== "upgrade") {
      throw Logger.error(`Invalid leaf customType for the upgrade of the item ${customType}`, true);
    }

    const upgradeableItemsBase = [];
    // let upgradeableItemsOnLeaf = API.getCollectionByFeature({
    //   item: baseLinkedCrystal,
    //   excludes: ["source"],
    // });
    let upgradeableItemsOnLeaf = API.getCollectionUpgradableItems({
      item: baseLinkedCrystal,
      name: baseLinkedItem.name,
      excludes: [],
    });
    for (const up of upgradeableItemsOnLeaf) {
      try {
        let itemUp = await getItemAsync(up);
        if (ItemLinkingHelpers.isItemLinked(itemUp)) {
          itemUp = ItemLinkingHelpers.retrieveLinkedItem(itemUp);
          itemUp = await getItemAsync(itemUp);
        }
        if (itemUp) {
          upgradeableItemsBase.push(itemUp);
        }
      } catch (e) {
        throw Logger.error(e);
      }
    }

    // Type checking
    if (!(baseLinkedCrystal instanceof CONFIG.Item.documentClass)) {
      throw Logger.error(`Invalid leaf for the upgrade of the item`, true);
    }

    const actor = originalItem.actor;
    if (!actor) {
      throw Logger.error(`${game.user.name} please at least select a actor`, true);
    }

    // Type checking
    if (!(actor instanceof CONFIG.Actor.documentClass)) {
      throw Logger.error(`Invalid actor`, true);
    }

    // if (!(type in COMPENDIUM)) {
    //   throw Logger.error(`The macro was called with an invalid argument "type": ${type}`, true);
    // }

    // if (!(target_bonus > 0)) {
    //   throw Logger.error(`The macro was called with an invalid argument "target_bonus": ${target_bonus}`, true);
    // }

    if (!upgradeableItemsBase || upgradeableItemsBase?.length === 0) {
      //throw Logger.error(`The macro was called with an invalid argument "itemUpgraded": ${upgradeableItemsBase}`, true);
      throw Logger.error(`No upgradable item is been found for the item '${originalItem.name}'`, true);
    }

    // const base_bonus = target_bonus - 1;

    // // ------------------------------------ //
    // const compendiums = COMPENDIUM[type]?.map((pack) => {
    //   return game.packs.contents.find((p) => p.metadata.label === pack);
    // });

    // // Asserting every compendium exists
    // if (compendiums.some((c) => c === undefined)) {
    //   const name = COMPENDIUM[type][compendiums.indexOf(undefined)];
    //   throw Logger.error(`Compendium not found: ${name}`, true);
    // }

    // // ------------------------------------ //
    // const promisesDocuments = compendiums.map((c) => c.getDocuments());
    // const compendiumItems = (await Promise.all(promisesDocuments)).flat();

    // const rgx = new RegExp(`(.+) \\+${target_bonus}`);
    // const itemsList = compendiumItems
    //   .map((i) => {
    //     // MOD 4535992
    //     //const match = i.name.match(rgx);
    //     if (!ItemLinkingHelpers.isItemLinked(i)) {
    //       // Logger.warn(`The item ${i.name}|${i.uuid} is not linked`);
    //       return false;
    //     }
    //     const baseItem = ItemLinkingHelpers.retrieveLinkedItem(i);
    //     if (!baseItem) {
    //       // Logger.warn(`The item ${i.name}|${i.uuid} is linked but not item is founded`);
    //       return false;
    //     }
    //     const match = baseItem.name.match(rgx);
    //     if (!match) {
    //       return;
    //     }
    //     return [match[1] + (base_bonus === 0 ? "" : ` +${base_bonus}`), i];
    //   })
    //   .filter(Boolean);
    // const mappedItems = Object.fromEntries(itemsList);
    // const itemKeys = Object.keys(mappedItems);

    // ------------------------------------ //
    // const upgradeableItems = actor.items.contents.filter((i) => {
    //   // MOD 4535992
    //   //return itemKeys.includes(i.name) && i.getFlag("beavers-crafting", "isCrafted")
    //   if (!ItemLinkingHelpers.isItemLinked(i)) {
    //     // Logger.warn(`The item ${i.name}|${i.uuid} is not linked`);
    //     return false;
    //   }
    //   const baseItem = ItemLinkingHelpers.retrieveLinkedItem(i);
    //   if (!baseItem) {
    //     // Logger.warn(`The item ${i.name}|${i.uuid} is linked but not item is founded`);
    //     return false;
    //   }
    //   return itemKeys.includes(baseItem.name);
    // });
    const upgradeableItems = upgradeableItemsBase; //[item];

    if (upgradeableItems.length === 0) {
      throw Logger.error(`${actor.name} does not have any upgradeable`, true);
    }

    // ------------------------------------ //

    // ------------------------------------ //
    const content = /*html*/ `
          <form autocomplete="off">
              <div>
                  Select the upgraded item to generate.
              </div>
              <hr/>
              <div class="form-group">
                  <label>Item to Upgrade</label>
                  <span>1 ${originalItem.name}</span>
              </div>
              <div class="form-group">
                  <label>Item Upgraded</label>
                  <select id="item" name="item">
                  <option selected=selected value="">Select a upgrade</option>
                  {{#each upgradeableItems}}
                      <option value="{{_id}}">{{name}}</option>
                  {{/each}}
                  </select>
              </div>
              <div class="form-group">
                  <label>Item used:</label>
                  <span>1 ${baseLinkedCrystal.name}</span>
              </div>
          </form>
      `;

    new Dialog({
      title: `Use '${baseLinkedCrystal.name}' and upgraded '${originalItem.name}'`,
      content: Handlebars.compile(content)({
        upgradeableItems,
      }),
      buttons: {
        yes: {
          icon: `<i class="fas fa-hand-holding-medical"></i>`,
          label: "Are you sure to perform the upgrade ? <b>It is a not turning back action for the item.</b>",
          callback: async (html) => {
            let targetItemId = html.find("#item")[0].value;

            let targetItem = upgradeableItems.find((i) => i.id === targetItemId);

            if (!targetItem) {
              throw Logger.error(
                `Could not find the item to upgrade, you must select at least a item for the upgrade`,
                true
              );
            }

            // const targetItem = mappedItems[item.name];

            let additionalCost = 0;
            let optionsAdditionalCost = {};
            Hooks.call(
              "item-link-tree.preUpgradeAdditionalCost",
              actor,
              originalItem,
              targetItem,
              optionsAdditionalCost
            );
            let additionalCostFromHook = optionsAdditionalCost.additionalCost;
            if (isRealNumber(additionalCostFromHook) && additionalCostFromHook > 0) {
              additionalCost = additionalCostFromHook;
            }
            new Dialog({
              title: `There is a additional cost for this:`,
              content: `
                  <div class="form-group">
                  <label>Additional cost :</label>
                  <span>${additionalCost}</span>
              </div>`,
              buttons: {
                yes: {
                  icon: `<i class="fas fa-hand-holding-medical"></i>`,
                  label: "Are you sure to perform the upgrade ? <b>It is a not turning back action for the item.</b>",
                  callback: async (html) => {
                    let optionsAdditionalCost = {};
                    optionsAdditionalCost.additionalCost = additionalCost;
                    optionsAdditionalCost.originalCrystal = originalCrystal;

                    if (
                      Hooks.call(
                        "item-link-tree.preUpgrade",
                        actor,
                        originalItem,
                        targetItem,
                        optionsAdditionalCost
                      ) === false
                    ) {
                      Logger.log(
                        `The upgrade of the item completion was prevented by the 'item-link-tree.preUpgrade' hook.`
                      );
                      return;
                    }

                    // TODO ADD SOME CUSTOMIZATION FOR NAME AND NAME ???
                    let currentName = targetItem.name; //manageNewName(weaponMain.name, itemNewName, itemNewPrefix, itemNewSuffix);
                    let currentImage = targetItem.img;
                    // if (itemNewImage) {
                    //   currentImage = itemNewImage;
                    // }
                    targetItem = await UpgradeItemHelpers.addItem(actor, targetItem, currentName, currentImage);
                    // const options = {
                    //   checkForItemLinking:
                    //     ItemLinkingHelpers.isItemLinkingModuleActive() &&
                    //     game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemLinked"),
                    //   checkForBeaverCrafting:
                    //     BeaverCraftingHelpers.isBeaverCraftingModuleActive() &&
                    //     game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemCrafted"),
                    // };

                    // for (const l of itemsLeafsOriginalBase) {
                    //   await API.addLeaf(targetItem, l) ?? [];
                    // }

                    const arrItemLeafsFinal = [];
                    for (const l of itemsLeafsOriginalBase) {
                      const arrItemLeafs = (await API.addLeafLight(targetItem, l)) ?? [];
                      if (arrItemLeafs?.length > 0) {
                        arrItemLeafsFinal.push(...arrItemLeafs);
                      }
                    }

                    // await ItemLinkTreeHelpers.transferFlagsFromItemToItem(targetItem, item);
                    await BabonusHelpers.transferBonusFromItemToItem(targetItem, originalItem);
                    await DaeHelpers.transferEffectsFromItemToItem(targetItem, originalItem);
                    // await ItemLinkTreeHelpers.transferFlagsFromItemToItem(targetItem, item);
                    // TODO not sure about this
                    targetItem = await ItemLinkingHelpers.setLinkedItem(targetItem, targetItem);

                    /*
                    const itemLinkTree = new ItemLinkTreeItem(targetItem);

                    const itemLeafs = [
                      ...itemLinkTree.itemTreeList, // Only for the prepare action
                      ...arrItemLeafsFinal,
                    ];

                    //this update should not re-render the item sheet because we need to wait until we refresh to do so
                    const property = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.itemLeafs}`;
                    await itemLinkTree.item.update({ [property]: itemLeafs }, { render: false });

                    await itemLinkTree.refresh();

                    // now re-render the item and actor sheets
                    await itemLinkTree.item.render();
                    if (itemLinkTree.item.actor) await itemLinkTree.item.actor.render();
                    */

                    await UpgradeItemHelpers.removeItem(originalItem);
                    await UpgradeItemHelpers.removeItem(originalCrystal);

                    // await DaeHelpers.fixTransferEffect(actorA, targetItem);

                    Logger.log(`Item upgraded with success! ${originalItem.name} -> ${targetItem.name}`);
                    Logger.info(`Oggetto migliorato con successo! ${originalItem.name} -> ${targetItem.name}`, true);
                    ChatMessage.create({
                      content: `<div style="text-align: center;">
                <img src="${CONSTANTS.IMAGES.IS_UPGRADED_WITH_SUCCESS}" alt="Image" style="max-width: 100%;">
                <p><strong>${actor.name}</strong> ha inserito una <strong>${originalCrystal.name}</strong> e ha migliorato 1 <strong>${originalItem.name}</strong> in una <strong>${targetItem.name}</strong></p>
              </div>`,
                    });

                    Hooks.call("item-link-tree.postUpgrade", actor, originalItem, targetItem, optionsAdditionalCost);
                  },
                },
              },
              default: "yes",
            }).render(true);
          },
        },
      },
      default: "yes",
    }).render(true);
  }
}

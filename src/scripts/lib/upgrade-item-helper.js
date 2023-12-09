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
    //   // return i.name === item.name && i.getFlag("beavers-crafting", "status");
    //   // return i.name === currentName && BeaverCraftingHelpers.isItemBeaverCrafted(i);
    //   return ItemLinkTreeManager._cleanName(i.name) === ItemLinkTreeManager._cleanName(currentName); // && BeaverCraftingHelpers.isItemBeaverCrafted(i);
    // });
    // if (oldItem) {
    //   await oldItem.update({ "system.quantity": oldItem.system.quantity + 1 });
    //   return oldItem;
    // } else {
    const data = item.toObject();
    data.flags["beavers-crafting"] = { status: "updated" };
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
    item,
    originalCrystal
    // type,
    // target_bonus,
    // itemNewName,
    // itemNewImage,
    // itemNewPrefix,
    // itemNewSuffix
  ) {
    item = await getItemAsync(item);

    if (item.system.quantity !== 1) {
      throw error(`Could not find ${item.name} for doing the upgrade`, true);
    }

    const actorA = item.actor;
    if (!actorA) {
      throw error(`${game.user.name} please at least select a actor`, true);
    }
    // Type checking
    if (!(actorA instanceof CONFIG.Actor.documentClass)) {
      throw error(`Invalid actor`, true);
    }

    const itemsLeafsOriginalBase = [];
    const leafsOriginalOnItem = API.getCollectionByFeature({
      item: item,
      features: ["", "bonus", "effect", "effectAndBonus"],
    });
    for (const up of leafsOriginalOnItem) {
      try {
        const itemUp = await getItemAsync(up.uuid);
        if (itemUp) {
          itemsLeafsOriginalBase.push(itemUp);
        }
      } catch (e) {}
    }

    originalCrystal = await getItemAsync(originalCrystal);

    if (originalCrystal.system.quantity !== 1) {
      throw error(`Could not find ${originalCrystal.name} for doing the upgrade`, true);
    }
    let crystal = originalCrystal;
    if (ItemLinkingHelpers.isItemLinked(crystal)) {
      crystal = ItemLinkingHelpers.retrieveLinkedItem(crystal);
      crystal = await getItemAsync(crystal);
    }

    const upgradeSources =
      API.getCollectionByFeature({
        item: crystal,
        features: ["source"],
      }) ?? [];
    const isCurrentItemASource = await findAsync(upgradeSources, async (i) => {
      //await upgradeSources.find(async (i) => {
      let iTmp = await getItemAsync(i.uuid);
      if (ItemLinkingHelpers.isItemLinked(iTmp)) {
        iTmp = ItemLinkingHelpers.retrieveLinkedItem(iTmp);
        iTmp = await getItemAsync(iTmp.uuid);
      }
      let iTmp2 = await getItemAsync(item);
      if (ItemLinkingHelpers.isItemLinked(item)) {
        iTmp2 = ItemLinkingHelpers.retrieveLinkedItem(item);
        iTmp2 = await getItemAsync(iTmp2.uuid);
      }
      // TODO control by name is enough ??
      return ItemLinkTreeManager._cleanName(iTmp.name) === ItemLinkTreeManager._cleanName(iTmp2.name);
    });
    if (!isCurrentItemASource) {
      throw error(`The item '${item.name}' cannot be upgraded because is not set as a source`);
    }

    const actorB = originalCrystal.actor;
    if (!actorB) {
      throw error(`${game.user.name} please at least select a actor`, true);
    }
    // Type checking
    if (!(actorB instanceof CONFIG.Actor.documentClass)) {
      throw error(`Invalid actor`, true);
    }

    if (actorA.id !== actorB.id) {
      throw error(`Invalid actor source and actor target`, true);
    }

    const customType = getProperty(crystal, `flags.item-link-tree.customType`) ?? "";
    if (customType !== "upgrade") {
      throw error(`Invalid leaf customType for the upgrade of the item ${customType}`, true);
    }

    const upgradeableItemsBase = [];
    const upgradeableItemsOnLeaf = API.getCollectionByFeature({
      item: crystal,
      excludes: ["source"],
    });
    for (const up of upgradeableItemsOnLeaf) {
      try {
        const itemUp = await getItemAsync(up.uuid);
        if (itemUp) {
          upgradeableItemsBase.push(itemUp);
        }
      } catch (e) {}
    }

    // Type checking
    if (!(crystal instanceof CONFIG.Item.documentClass)) {
      throw error(`Invalid leaf for the upgrade of the item`, true);
    }

    const actor = item.actor;
    if (!actor) {
      throw error(`${game.user.name} please at least select a actor`, true);
    }

    // Type checking
    if (!(actor instanceof CONFIG.Actor.documentClass)) {
      throw error(`Invalid actor`, true);
    }

    // if (!(type in COMPENDIUM)) {
    //   throw error(`The macro was called with an invalid argument "type": ${type}`, true);
    // }

    // if (!(target_bonus > 0)) {
    //   throw error(`The macro was called with an invalid argument "target_bonus": ${target_bonus}`, true);
    // }

    if (!upgradeableItemsBase || upgradeableItemsBase?.length === 0) {
      throw error(`The macro was called with an invalid argument "itemUpgraded": ${upgradeableItemsBase}`, true);
    }

    // const base_bonus = target_bonus - 1;

    // // ------------------------------------ //
    // const compendiums = COMPENDIUM[type]?.map((pack) => {
    //   return game.packs.contents.find((p) => p.metadata.label === pack);
    // });

    // // Asserting every compendium exists
    // if (compendiums.some((c) => c === undefined)) {
    //   const name = COMPENDIUM[type][compendiums.indexOf(undefined)];
    //   throw error(`Compendium not found: ${name}`, true);
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
    //       // warn(`The item ${i.name}|${i.uuid} is not linked`);
    //       return false;
    //     }
    //     const baseItem = ItemLinkingHelpers.retrieveLinkedItem(i);
    //     if (!baseItem) {
    //       // warn(`The item ${i.name}|${i.uuid} is linked but not item is founded`);
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
    //   //return itemKeys.includes(i.name) && i.getFlag("beavers-crafting", "status")
    //   if (!ItemLinkingHelpers.isItemLinked(i)) {
    //     // warn(`The item ${i.name}|${i.uuid} is not linked`);
    //     return false;
    //   }
    //   const baseItem = ItemLinkingHelpers.retrieveLinkedItem(i);
    //   if (!baseItem) {
    //     // warn(`The item ${i.name}|${i.uuid} is linked but not item is founded`);
    //     return false;
    //   }
    //   return itemKeys.includes(baseItem.name);
    // });
    const upgradeableItems = upgradeableItemsBase; //[item];

    if (upgradeableItems.length === 0) {
      throw error(`${actor.name} does not have any upgradeable`, true);
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
                  <span>1 ${item.name}</span>
              </div>
              <div class="form-group">
                  <label>Item Upgraded</label>
                  <select id="item" name="item">
                  {{#each upgradeableItems}}
                      <option value="{{_id}}">{{name}}</option>
                  {{/each}}
                  </select>
              </div>
              <div class="form-group">
                  <label>Cost</label>
                  <span>1 ${crystal.name}</span>
              </div>
          </form>
      `;

    new Dialog({
      title: `Use '${crystal.name}' and upgraded '${item.name}'`,
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
              throw error(`Could not find the item to upgrade`, true);
            }

            // const targetItem = mappedItems[item.name];

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
            //     game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemCrafted"),
            //   checkForBeaverCrafting:
            //     BeaverCraftingHelpers.isBeaverCraftingModuleActive() &&
            //     game.settings.get(CONSTANTS.MODULE_ID, "canAddLeafOnlyIfItemLinked"),
            // };

            // for (const l of itemsLeafsOriginalBase) {
            //   await API.addLeaf(targetItem, l) ?? [];
            // }

            const arrItemLeafsFinal = [];
            for (const l of itemsLeafsOriginalBase) {
              const arrItemLeafs = (await API.prepareItemsLeafsFromAddLeaf(targetItem, l)) ?? [];
              if (arrItemLeafs?.length > 0) {
                arrItemLeafsFinal.push(...arrItemLeafs);
              }
            }

            // await ItemLinkTreeHelpers.transferFlagsFromItemToItem(targetItem, item);
            await BabonusHelpers.transferBonusFromItemToItem(targetItem, item);
            await DaeHelpers.transferEffectsFromItemToItem(targetItem, item);
            // await ItemLinkTreeHelpers.transferFlagsFromItemToItem(targetItem, item);

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

            await UpgradeItemHelpers.removeItem(item);
            await UpgradeItemHelpers.removeItem(originalCrystal);

            await DaeHelpers.fixTransferEffect(actorA, targetItem);

            log(`Item upgraded with success! ${item.name} -> ${targetItem.name}`);
            ChatMessage.create({
              content: `<b>${actor.name}</b> inserted a <b>${crystal.name}</b> and upgraded 1 <b>${item.name}</b> into a <b>${targetItem.name}</b>`,
            });
          },
        },
      },
      default: "yes",
    }).render(true);
  }
}

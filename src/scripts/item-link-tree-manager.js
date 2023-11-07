import CONSTANTS from "./constants/constants.js";
import { BeaverCraftingHelpers } from "./lib/beavers-crafting-helpers.js";
import { ItemPriceHelpers } from "./lib/item-price-helpers.js";
import { API } from "./API/api.js";
import { ItemLinkingHelpers } from "./lib/item-linking-helper.js";
import { log, warn } from "./lib/lib.js";

export class ItemLinkTreeManager {
  static _cleanLeafAndGem(name) {
    return name
      .replaceAll(CONSTANTS.SYMBOL_UPGRADE, "")
      .replaceAll(CONSTANTS.SYMBOL_GEM, "")
      .replaceAll(CONSTANTS.SYMBOL_LEAF, "")
      .trim();
  }

  static managePreAddLeafToItem(item, itemAdded, { checkForItemLinking = false, checkForBeaverCrafting = false }) {
    if (checkForBeaverCrafting) {
      const isCrafted = BeaverCraftingHelpers.isItemBeaverCrafted(item);
      if (!isCrafted) {
        warn(`Non puoi aggiungere l'item perche' l'oggetto di destinazione non e' craftato`, true);
        return false;
      }
    }
    const quantityItem = item.system.quantity;
    if (quantityItem !== 1) {
      warn(
        `Non puoi aggiungere la gemma/foglia perche' l'oggetto di destinazione a una quantita' superiore a 1 o uguale a 0`,
        true
      );
      return false;
    }
    if (checkForItemLinking) {
      const isItemLinked = ItemLinkingHelpers.isItemLinked(item);
      if (!isItemLinked) {
        warn(`Non puoi aggiungere la gemma/foglia perche' l'oggetto di destinazione non e' linkato`, true);
        return false;
      }
    }
    const isItemLeaf = API.isItemLeaf(item);
    if (isItemLeaf) {
      warn(`Non puoi aggiungere la gemma/foglia perche' l'oggetto di destinazione e' una gemma/foglia`, true);
      return false;
    }

    const isFilterByItemTypeOk = API.isFilterByItemTypeOk(itemAdded, item.type);
    if (!isFilterByItemTypeOk) {
      warn(
        `Non puoi aggiungere la gemma/foglia perche' l'oggetto di destinazione e' un tipo non supportato '${item.type}'`,
        true
      );
      return false;
    }

    const leafs = API.getCollectionEffectAndBonus(item) ?? [];
    for (const leaf of leafs) {
      const itemLeaf = fromUuidSync(leaf.uuid);
      if (itemLeaf && itemLeaf.name === itemAdded.name) {
        warn(
          `Non puoi aggiungere la gemma/foglia perche' l'oggetto di destinazione ha gia' una gemma/foglia di quel tipo`,
          true
        );
        return false;
      }
    }

    if (!game.user.isGM) {
      const isItemAddedLinked = ItemLinkingHelpers.isItemLinked(itemAdded);
      if (!isItemAddedLinked) {
        warn(`Non puoi aggiungere la gemma/foglia perche' non e' linkata`, true);
        return false;
      }
      const quantityItemAdded = itemAdded.system.quantity;
      if (quantityItemAdded < 1) {
        warn(`Non puoi aggiungere la gemma/foglia perche' la quantita' e' <= 1`, true);
        return false;
      }
    }

    /*
    const isGemCanBeAdded = ItemLinkTreeManager.checkIfYouCanAddMoreGemsToItem(item);
    if (!isGemCanBeAdded) {
      warn(
        `Non puoi aggiungere la gemma/foglia perche' l'oggetto di destinazione non puo' contenere altre gemme/foglie!`,
        true
      );
      warn(`Hai raggiunto il numero massimo di gemme per l'arma '${item.name}'`, true);
      return false;
    }
    */

    return true;
  }

  static async managePreRemoveLeafFromItem(item, itemRemoved) {
    // NOTHING FOR NOW
  }

  static async managePostAddLeafToItem(item, itemAdded) {
    const actor = item.actor;
    if (!actor) {
      return;
    }
    const customType = getProperty(itemAdded, `flags.item-link-tree.customType`) ?? "";
    // const prefix = getProperty(itemAdded, `flags.item-link-tree.prefix`) ?? "";
    // const suffix = getProperty(itemAdded, `flags.item-link-tree.suffix`) ?? "";

    if (customType === "bonus" || customType === "effectAndBonus") {
      const bonuses = game.modules.get("babonus").api.getCollection(item) ?? [];
      const bonusesToAdd = game.modules.get("babonus").api.getCollection(itemAdded) ?? [];
      if (bonusesToAdd.size > 0) {
        for (const bonusToAdd of bonusesToAdd) {
          let foundedBonus = false;
          for (const bonus of bonuses) {
            if (bonus.name === bonusToAdd.name) {
              foundedBonus = true;
              break;
            }
          }
          if (!foundedBonus) {
            log(`Added bonus '${bonusToAdd.name}'`, true);
            await game.modules.get("babonus").api.embedBabonus(item, bonusToAdd);
          }
        }
      }
    }
    if (customType === "effect" || customType === "effectAndBonus") {
      const itemEffects = item.effects ?? [];
      const actorEffects = actor.effects ?? [];
      const effectsToAdd = itemAdded.effects ?? [];
      if (effectsToAdd.size > 0) {
        const effectDatas = [];
        for (const effectToAdd of effectsToAdd) {
          let foundedEffect = false;
          for (const effect of itemEffects) {
            if (effect.name === effectToAdd.name) {
              foundedEffect = true;
              break;
            }
          }
          if (!foundedEffect) {
            log(`Added effect '${effectToAdd.name}'`, true);
            const effectData = effectToAdd.toObject();
            setProperty(effectData, `origin`, item.uuid);
            setProperty(effectData, `flags.core.sourceId`, item.uuid);
            setProperty(effectData, `name`, itemAdded.name);
            effectDatas.push(effectData);
            //await item.createEmbeddedDocuments("ActiveEffect", [effectData]);
          }
        }
        if (effectDatas.length > 0) {
          await item.createEmbeddedDocuments("ActiveEffect", effectDatas);
        }
      }
    }

    const leafs = API.getCollectionEffectAndBonus(item);

    let currentName = item.name.replaceAll(CONSTANTS.SYMBOL_UPGRADE, "").trim();
    currentName = currentName.replaceAll(CONSTANTS.SYMBOL_UPGRADE_OLD, "").trim();
    currentName = currentName + " ";
    currentName += CONSTANTS.SYMBOL_UPGRADE.repeat(leafs.length);
    currentName = currentName.trim();

    let currentValuePrice = getProperty(item, `system.price.value`) ?? 0;
    let currentDenomPrice = getProperty(item, `system.price.denomination`) ?? "gp";
    let currentValuePriceGp = ItemPriceHelpers.convertToGold(currentValuePrice, currentDenomPrice);

    let priceValueToAdd = getProperty(itemAdded, `system.price.value`) ?? 0;
    let priceDenomToAdd = getProperty(itemAdded, `system.price.denomination`) ?? "gp";
    let priceValueToAddGp = ItemPriceHelpers.convertToGold(priceValueToAdd, priceDenomToAdd);

    let newCurrentValuePriceGp = currentValuePriceGp + priceValueToAddGp;
    if (newCurrentValuePriceGp < 0) {
      newCurrentValuePriceGp = 0;
    }
    await item.update({
      name: currentName,
      "system.price.value": newCurrentValuePriceGp,
      "system.price.denomination": "gp",
    });

    if (itemAdded.actor instanceof CONFIG.Actor.documentClass) {
      if (itemAdded.system.quantity > 1) {
        log(`Update quantity item '${itemAdded.name}|${itemAdded.id}'`);
        await itemAdded.update({ "system.quantity": itemAdded.system.quantity - 1 });
      } else {
        log(`Delete item '${itemAdded.name}|${itemAdded.id}'`);
        await actor.deleteEmbeddedDocuments("Item", [itemAdded.id]);
      }
    }

    //if (game.settings.get(CONSTANTS.MODULE_ID, "patchDAE")) {
    if (DAE && actor) {
      const itemEffects = item.effects ?? [];
      const actorEffects = actor.effects ?? [];
      const idsEffectActorToRemove = [];
      for (const effectToRemove of itemEffects) {
        for (const effect of actorEffects) {
          if (
            ItemLinkTreeManager._cleanLeafAndGem(effect.name) ===
              ItemLinkTreeManager._cleanLeafAndGem(effectToRemove.name) &&
            effect.origin === item.uuid
          ) {
            log(`Removed effect from actor '${effect.name}'`, true);
            idsEffectActorToRemove.push(effect.id);
          }
        }
      }
      if (idsEffectActorToRemove.length > 0) {
        await actor.deleteEmbeddedDocuments("ActiveEffect", idsEffectActorToRemove);
      }
      await DAE.fixTransferEffect(actor, item);
      const idsEffectActorToRemove2 = [];
      const actorEffects2 = actor.effects ?? [];
      for (const effectToRemove of actorEffects2) {
        if (
          effectToRemove.flags?.core?.sourceId &&
          effectToRemove.flags?.core?.sourceId.startsWith("Compendium") &&
          ItemLinkTreeManager._cleanLeafAndGem(effectToRemove.name) ===
            ItemLinkTreeManager._cleanLeafAndGem(effectToRemove.name)
        ) {
          log(`Removed effect from actor '${effectToRemove.name}'`, true);
          idsEffectActorToRemove2.push(effectToRemove.id);
        }
      }
      if (idsEffectActorToRemove2.length > 0) {
        await actor.deleteEmbeddedDocuments("ActiveEffect", idsEffectActorToRemove2);
      }
    }
    //}
  }

  static async managePostRemoveLeafFromItem(item, itemRemoved) {
    const actor = item.actor;
    if (!actor) {
      return;
    }
    const customType = getProperty(itemRemoved, `flags.item-link-tree.customType`) ?? "";
    // const prefix = getProperty(itemRemoved, `flags.item-link-tree.prefix`) ?? "";
    // const suffix = getProperty(itemRemoved, `flags.item-link-tree.suffix`) ?? "";

    if (customType === "bonus" || customType === "effectAndBonus") {
      const bonuses = game.modules.get("babonus").api.getCollection(item) ?? [];
      const bonusesToRemove = game.modules.get("babonus").api.getCollection(itemRemoved) ?? [];
      if (bonusesToRemove.size > 0) {
        for (const bonusToRemove of bonusesToRemove) {
          for (const bonus of bonuses) {
            if (bonus.name === bonusToRemove.name) {
              log(`Removed bonus '${bonus.name}'`, true);
              await game.modules.get("babonus").api.deleteBonus(item, bonus.id);
            }
          }
        }
      }
    }
    if (customType === "effect" || customType === "effectAndBonus") {
      const itemEffects = item.effects ?? [];
      const actorEffects = actor.effects ?? [];
      const effectsToRemove = itemRemoved.effects ?? [];
      if (effectsToRemove.size > 0) {
        // TODO miglorare questo pezzo di codice
        // if (DAE) {
        //   for (const effectToRemove of effectsToRemove) {
        //     for (const effect of effects) {
        //       if (ItemLinkTreeManager._cleanLeafAndGem(effect.name) === ItemLinkTreeManager._cleanLeafAndGem(effectToRemove.name)) {
        //         log(`Rimosso effect '${effect.name}'`, true);
        //         let uuidItem = item.uuid;
        //         let origin = effect.origin;
        //         let ignore = [];
        //         let deleteEffects = [];
        //         let removeSequencer = true;
        //         await DAE.deleteActiveEffect(uuidItem, origin, ignore, deleteEffects, removeSequencer);
        //       }
        //     }
        //   }
        // } else {
        const idsEffectItemToRemove = [];
        for (const effectToRemove of effectsToRemove) {
          for (const effect of itemEffects) {
            if (
              ItemLinkTreeManager._cleanLeafAndGem(effect.name) ===
              ItemLinkTreeManager._cleanLeafAndGem(effectToRemove.name)
            ) {
              // Non funziona  && effect.origin === itemRemoved.uuid
              log(`Removed effect from item '${effect.name}'`, true);
              idsEffectItemToRemove.push(effect.id);
            }
          }
        }
        if (idsEffectItemToRemove.length > 0) {
          await item.deleteEmbeddedDocuments("ActiveEffect", idsEffectItemToRemove);
        }

        const idsEffectActorToRemove = [];
        for (const effectToRemove of effectsToRemove) {
          for (const effect of actorEffects) {
            if (
              ItemLinkTreeManager._cleanLeafAndGem(effect.name) ===
                ItemLinkTreeManager._cleanLeafAndGem(effectToRemove.name) &&
              effect.origin === item.uuid
            ) {
              log(`Removed effect from actor '${effect.name}'`, true);
              idsEffectActorToRemove.push(effect.id);
            }
          }
        }
        if (idsEffectActorToRemove.length > 0) {
          await actor.deleteEmbeddedDocuments("ActiveEffect", idsEffectActorToRemove);
        }

        // }
      }
    }

    const leafs = API.getCollectionEffectAndBonus(item);

    let currentName = item.name.replaceAll(CONSTANTS.SYMBOL_UPGRADE, "").trim();
    currentName = currentName.replaceAll(CONSTANTS.SYMBOL_UPGRADE_OLD, "").trim();
    currentName = currentName + " ";
    currentName += CONSTANTS.SYMBOL_UPGRADE.repeat(leafs.length);
    currentName = currentName.trim();

    let currentValuePrice = getProperty(item, `system.price.value`) ?? 0;
    let currentDenomPrice = getProperty(item, `system.price.denomination`) ?? "gp";
    let currentValuePriceGp = ItemPriceHelpers.convertToGold(currentValuePrice, currentDenomPrice);

    let priceValueToRemove = getProperty(itemRemoved, `system.price.value`) ?? 0;
    let priceDenomToRemove = getProperty(itemRemoved, `system.price.denomination`) ?? "gp";
    let priceValueToRemoveGp = ItemPriceHelpers.convertToGold(priceValueToRemove, priceDenomToRemove);

    let newCurrentValuePriceGp = currentValuePriceGp - priceValueToRemoveGp;
    if (newCurrentValuePriceGp < 0) {
      newCurrentValuePriceGp = 0;
    }
    await item.update({
      name: currentName,
      "system.price.value": newCurrentValuePriceGp,
      "system.price.denomination": "gp",
    });
  }

  //   static checkIfYouCanAddMoreGemsToItem(item) {
  //     const leafs = API.getCollectionEffectAndBonus(item);
  //     const quantityOfGem = leafs.length ?? 0;
  //     const rarity = item.system.rarity ?? "";
  //     let canAddGem = false;
  //     switch (rarity) {
  //       case "common": {
  //         if (quantityOfGem < 1) {
  //           canAddGem = true;
  //         }
  //         break;
  //       }
  //       case "uncommon": {
  //         if (quantityOfGem < 1) {
  //           canAddGem = true;
  //         }
  //         break;
  //       }
  //       case "rare": {
  //         if (quantityOfGem < 2) {
  //           canAddGem = true;
  //         }
  //         break;
  //       }
  //       case "veryRare":
  //       case "veryrare": {
  //         if (quantityOfGem < 2) {
  //           canAddGem = true;
  //         }
  //         break;
  //       }
  //       case "legendary": {
  //         if (quantityOfGem < 3) {
  //           canAddGem = true;
  //         }
  //         break;
  //       }
  //       case "artifact": {
  //         if (quantityOfGem < 3) {
  //           canAddGem = true;
  //         }
  //         break;
  //       }
  //       default: {
  //         if (rarity) {
  //           warn(`No quantity of gems is check for rarity '${rarity}'`);
  //         }
  //         canAddGem = false;
  //         break;
  //       }
  //     }
  //     return canAddGem;
  //   }
}

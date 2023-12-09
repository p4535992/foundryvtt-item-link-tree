import { getItemSync, log } from "./lib";

export class BabonusHelpers {
  static isBabonusModuleActive() {
    return game.modules.get("babonus")?.active;
  }

  static retrieveBonusesFromItem(baseItem) {
    // returns a Collection of bonuses on the object.
    let bonusesInitial = game.modules.get("babonus").api.getCollection(baseItem);
    return bonusesInitial;
  }

  static retrieveBonusFromCollection(collection, id) {
    // returns a Collection of bonuses on the object.
    let bonusesInitial = collection.get(id);
    return bonusesInitial;
  }

  static async applyBonusToItem(item, bonus) {
    // returns a Collection of bonuses on the object.
    const itemWithBonus = await game.modules.get("babonus").api.embedBabonus(item, bonus, true);
    return itemWithBonus;
  }

  static async deleteAllBonusFromItem(itemToCheck) {
    itemToCheck = getItemSync(itemToCheck);
    const collection = retrieveBonusesFromItem(itemToCheck);
    for (const bonus of collection) {
      await game.modules.get("babonus").api.deleteBonus(itemToCheck, bonus.id);
    }
  }

  static async transferBonusFromItemToItem(itemWherePutTheBonus, itemWithTheBonus) {
    if (BabonusHelpers.isBabonusModuleActive()) {
      const bonuses = game.modules.get("babonus").api.getCollection(itemWherePutTheBonus) ?? [];
      const bonusesToAdd = game.modules.get("babonus").api.getCollection(itemWithTheBonus) ?? [];
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
            //log(`Added bonus '${bonusToAdd.name}'`, true);
            // await game.modules.get("babonus").api.embedBabonus(item, bonusToAdd);
            await game.modules.get("babonus").api.copyBonus(itemWithTheBonus, itemWherePutTheBonus, bonusToAdd.id);
          }
        }
      }
    }
  }
}

import { ItemLinkTree } from "../../module.js";

/**
 * The form to control Item Spell overrides (e.g. for consumption logic)
 */
export class ItemLinkTreeItemSpellOverrides extends FormApplication {
  constructor(itemLinkTreeItem, itemBaseId) {
    const itemSpellFlagData = itemLinkTreeItem.itemTreeFlagMap.get(itemBaseId);
    ItemLinkTree.log(false, { itemSpellFlagData });
    // set the `object` of this FormApplication as the itemSpell data from the parent item's flags
    super(itemSpellFlagData?.changes ?? {});

    // the current item we are editing
    this.itemBaseId = itemBaseId;

    // the ItemLinkTreeItem instance to use
    this.itemLinkTreeItem = itemLinkTreeItem;

    // the parent item
    this.item = itemLinkTreeItem.item;

    // the fake or real base item
    this.itemBaseItem = fromUuidSync(itemSpellFlagData.uuid); // MOD 4535992 itemLinkTreeItem.itemBaseItemMap.get(itemBaseId);
  }

  get id() {
    return `${ItemLinkTree.MODULE_ID}-${this.item.id}-${this.itemBaseItem.id}`;
  }

  get title() {
    return `${this.item.name} - ${this.itemBaseItem.name}`;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "item"],
      template: ItemLinkTree.TEMPLATES.overrides,
      width: 560,
      closeOnSubmit: false,
      submitOnChange: true,
      height: "auto",
    });
  }

  getData() {
    const ret = {
      spellLevelToDisplay: this.object?.system?.level ?? this.itemBaseItem?.system?.level,
      save: this.itemBaseItem.system.save,
      overrides: this.object,
      config: {
        limitedUsePeriods: CONFIG.DND5E.limitedUsePeriods,
        abilities: CONFIG.DND5E.abilities,
        spellLevels: CONFIG.DND5E.spellLevels,
      },
      isFlatDC: this.object?.system?.save?.scaling === "flat",
      parentItem: {
        id: this.item.id,
        name: this.item.name,
        isOwned: this.item.isOwned,
      },
    };

    ItemLinkTree.log(false, "getData", ret);

    return ret;
  }

  async _updateObject(event, formData) {
    ItemLinkTree.log(false, "_updateObject", event, formData);

    const formDataExpanded = foundry.utils.expandObject(formData);

    await this.itemLinkTreeItem.updateItemSpellOverrides(this.itemBaseId, formDataExpanded.overrides);

    this.object = formDataExpanded.overrides;

    if (this.item.isOwned) {
      ui.notifications.warn("The existing items on the parent actor will not be modified to reflect this change.");
    }

    // close if this is a submit (button press or `enter` key)
    if (event instanceof SubmitEvent) {
      this.close();
    } else {
      this.render();
    }
  }
}

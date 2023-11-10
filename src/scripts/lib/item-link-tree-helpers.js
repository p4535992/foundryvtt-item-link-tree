import API from "../API/api";
import { ItemSheetLeafFeature } from "../systems/dnd5e/sheets/ItemSheetLeafFeature";
import { warn } from "./lib";

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
      warn(
        `No sheet is been prepared for this system please contacts the developer on the git project issues page`,
        true
      );
    }
  }

  static applyImagesOnInventory(app, html, data) {
    if (!app) {
      return;
    }
    const actor = app.object;

    // =================================
    // DnD5e
    // =================================
    if (game.system.id === "dnd5e") {
      let items = html.find($(".item-list .item"));
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
        const title = itemElement.querySelector("h4");
        title.style.display = "contents";

        const leafs = API.getCollection({ item: item });
        if (leafs) {
          for (const leaf of API.getCollection({ item: item })) {
            if (leaf.showImageIcon) {
              const icon = leaf.img;
              const tooltipText = leaf.shortDescriptionLink ? leaf.shortDescriptionLink : leaf.subType;
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

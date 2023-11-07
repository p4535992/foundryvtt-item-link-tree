import API from "../API/api";
import { warn } from "./lib";

export class ItemLinkTreeHelpers {
  static applyImagesOnInventory(app, html, data) {
    if (!app) {
      return;
    }
    const actor = app.object;

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
              const itemLeaf = fromUuidSync(leaf.uuid);
              const icon = itemLeaf.img;
              const img = document.createElement("img");
              img.src = icon;
              // img.classList.add("item-image");
              img.style.border = "none";
              img.style.marginRight = "5px";
              img.style.marginLeft = "5px";
              img.style.height = "20px";
              img.style.width = "20px";
              img.dataset.tooltip = leaf.subType;
              img.dataset.tooltipDirection = "UP";
              title.prepend(img);
            }
          }
        }
      }
    }
  }
}

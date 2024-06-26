import API from "./scripts/API/api.js";
import { ItemLinkTree } from "./scripts/ItemLinkTree.js";
import { ItemLinkTreeItemSheet } from "./scripts/classes/ItemLinkTreeItemSheet.js";
import { _registerSettings } from "./scripts/classes/settings.js";
import CONSTANTS from "./scripts/constants/constants.js";
import { BeaverCraftingHelpers } from "./scripts/lib/beavers-crafting-helpers.js";
import { ItemLinkTreeHelpers } from "./scripts/lib/item-link-tree-helpers.js";
import { ItemLinkingHelpers } from "./scripts/lib/item-linking-helper.js";
import { ItemTagsHelpers } from "./scripts/lib/item-tags-helpers.js";
import { PoppersJsHelpers } from "./scripts/lib/poppers-js-helpers.js";

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});

Hooks.once("init", () => {
  ItemLinkTree.preloadTemplates();
  ItemLinkTree.ItemSheetLeafFeatureInitialize();
});

Hooks.once("setup", () => {
  _registerSettings();
  // set api
  game.modules.get(CONSTANTS.MODULE_ID).api = API;
});

Hooks.once("ready", () => {
  ItemLinkTreeItemSheet.init();
});

// Add any additional hooks if necessary

Hooks.on("renderActorSheet", (app, html, data) => {
  ItemLinkTreeHelpers.applyImagesOnInventory(app, html, data);
});

Hooks.on("tidy5e-sheet.renderActorSheet", (app, html, data) => {
  async function main() {
    // items = $(html)[0].querySelectorAll(`[data-tab-contents-for="inventory"] [data-tidy-item-table-row]`);
    const items = html.querySelectorAll(`[data-tab-contents-for="inventory"] [data-tidy-item-table-row]`);
    for (let row of items) {
      const itemId = row.getAttribute("data-item-id");
      const item = data.actor.items.get(itemId);

      // let htmlItemTags = "";
      // let htmlItemLinking = "";
      // let htmlBeaverCrafting = "";

      // if (ItemTagsHelpers.isItemTagsModuleActive()) {
      //   const itemTags = item.flags?.["item-tags"]?.tags;
      //   if (itemTags && itemTags.length > 0) {
      //     if (ItemTags.Check(item, itemTags, "includeOR")) {
      //       const tagToHTML = {
      //         adamant: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Adamant" style="background-color: purple;">AD</span>`,
      //         steel: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Steel" style="background-color: steelblue;">ST</span>`,
      //         gold: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Gold" style="background-color: gold;">AU</span>`,
      //         silver: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Silver" style="background-color: silver;">AG</span>`,
      //         darksteel: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Darksteel" style="background-color: black;">DS</span>`,
      //         firesteel: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Firesteel" style="background-color: orange;">FS</span>`,
      //         icesteel: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Icesteel" style="background-color: lightblue;">IS</span>`,
      //         mithril: `<span class="item-link-tree-material-badge" data-tidy-render-scheme="handlebars" title="Mithril" style="background-color: mauve;">MT</span>`,
      //       };

      //       for (const tag of itemTags) {
      //         if (tagToHTML[tag]) {
      //           htmlItemTags += tagToHTML[tag];
      //         }
      //       }
      //     }
      //   }
      // }
      //down
      const itemLeafs = API.getCollection(item);
      if (itemLeafs && itemLeafs.length > 0) {
        // Create a green badge with a '+' symbol
        const leafBadgeHtml = `<span class="item-link-tree-material-badge2" data-tidy-render-scheme="handlebars">+</span>`;
        const primaryCell = row.querySelector(".item-table-cell.primary");
        primaryCell.insertAdjacentHTML("beforeend", leafBadgeHtml);

        // Find the newly added .item-link-tree-material-badge2 element
        const leafBadge = primaryCell.querySelector(".item-link-tree-material-badge2");

        // Build the tooltip content
        let tooltipContent = '<div style="text-align: center;">';
        for (const leaf of itemLeafs) {
          if (await ItemLinkTreeHelpers.isApplyImagesActive(leaf)) {
            const leafTmp = await ItemLinkTreeHelpers.retrieveLeafDataAsync(leaf);
            const tooltipText = leafTmp.shortDescriptionLink
              ? leafTmp.shortDescriptionLink
              : leafTmp.shortDescription
              ? leafTmp.shortDescription
              : leafTmp.subType;
            tooltipContent += `
              <div style="margin-bottom: 10px;">
                <img src="${leafTmp.img}" alt="${leafTmp.name}" style="width: 50px; height: 50px;">
                <p><strong>${leafTmp.name}</strong></p>
                <p>${tooltipText}</p>
              </div>`;
          }
        }
        tooltipContent += "</div>";

        // Initialize Tippy.js tooltip for the badge
        PoppersJsHelpers.tippyTooltip(leafBadge, {
          content: tooltipContent,
          interactive: true,
          zIndex: 9999,
          placement: "right",
          allowHTML: true,
        });
      }
      //up
      //   if (BeaverCraftingHelpers.isBeaverCraftingModuleActive()) {
      //     const isCrafted = BeaverCraftingHelpers.isItemBeaverCrafted(item);
      //     if (isCrafted) {
      //       htmlBeaverCrafting = `<img src="${CONSTANTS.IMAGES.IS_BEAVER_CRAFTED}" style="border: none; margin-right: 5px;" data-tidy-render-scheme="handlebars" title="Item Crafted" />`;
      //     }
      //   }

      //   if (htmlItemTags !== "") {
      //     const primaryCell = row.querySelector(".item-table-cell.primary");
      //     primaryCell.insertAdjacentHTML("afterend", htmlItemTags);

      //     const badges = primaryCell.parentNode.querySelectorAll(".item-link-tree-material-badge");
      //     badges.forEach((badge) => {
      //       const materialName = badge.getAttribute("title").toLowerCase(); // Convert title to lowercase for the image filename
      //       const tooltipContent = `
      //         <div style="text-align: center;">
      //           <img src="Tiles/Assets/iconeTS/TSitems/${materialName}.webp" alt="${materialName}" style="width: 150px; height: 150px;">
      //           <p>${badge.getAttribute("title")}</p>
      //         </div>
      //       `;
      //       PoppersJsHelpers.tippyTooltip(badge, {
      //         content: tooltipContent,
      //         interactive: true,
      //         zIndex: 9999,
      //         placement: "right",
      //         allowHTML: true,
      //       });
      //     });
      //   }

      //   if (ItemLinkingHelpers.isItemLinkingModuleActive()) {
      //     const isLinked = ItemLinkingHelpers.isItemLinked(item);
      //     const linkedIcon = isLinked ? CONSTANTS.IMAGES.IS_LINKED : CONSTANTS.IMAGES.IS_BROKEN_LINK;
      //     const tooltipText = isLinked ? "Item Linked" : "Item Not Linked";
      //     htmlItemLinking = `<img src="${linkedIcon}" style="border: none; margin-right: 5px;" data-tidy-render-scheme="handlebars" title="${tooltipText}" />`;
      //   }

      //   // After elements are added to the DOM
      //   if (htmlItemLinking !== "") {
      //     const primaryCell = row.querySelector(".item-table-cell.primary");
      //     primaryCell.insertAdjacentHTML("beforebegin", htmlItemLinking);
      //   }

      //   if (htmlBeaverCrafting !== "") {
      //     const primaryCell = row.querySelector(".item-table-cell.primary");
      //     primaryCell.insertAdjacentHTML("beforeend", htmlBeaverCrafting);
      //     const craftedImage = primaryCell.querySelector("img[src*='${CONSTANTS.IMAGES.IS_BEAVER_CRAFTED}']");
      //     if (craftedImage) {
      //       // Add a Tippy tooltip for the "crafted" image
      //       PoppersJsHelpers.tippyTooltip(craftedImage, {
      //         content: "Item Craftato", // Tooltip text
      //         allowHTML: true,
      //         placement: "right",
      //         zIndex: 9999,
      //         interactive: true,
      //         onShow(instance) {
      //           // Retrieve the crafted by actor's name and image
      //           const craftedBy = BeaverCraftingHelpers.itemBeaverCraftedBy(item);
      //           // const actorImageUrl = findActorImageByName(craftedBy);
      //           const actor = game.actors.contents.find(
      //             (a) => a.name === craftedBy && a.img !== "icons/svg/item-bag.svg"
      //           );
      //           const actorImageUrl = actor ? actor.prototypeToken.texture.src : null;

      //           if (actorImageUrl) {
      //             const craftedByActorImage = `<img src="${actorImageUrl}" style="max-width: 90px; height: auto; display: block; margin: 8px auto;"> Crafted by ${craftedBy}`;

      //             // Set the tooltip content to the craftedByActorImage
      //             instance.setContent(craftedByActorImage);
      //           }
      //         },
      //       });
      //     }
      //   }
    }
  }
  // Ensure Tippy.js is loaded before running the main code
  // PoppersJsHelpers.ensureTippyLoaded(main);
  main();
});

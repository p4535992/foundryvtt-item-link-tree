import API from "./scripts/API/api.js";
import { ItemLinkTree } from "./scripts/ItemLinkTree.js";
import { ItemLinkTreeItemSheet } from "./scripts/classes/ItemLinkTreeItemSheet.js";
import { _registerSettings } from "./scripts/classes/settings.js";
import CONSTANTS from "./scripts/constants/constants.js";
import { BeaverCraftingHelpers } from "./scripts/lib/beavers-crafting-helpers.js";
import { ItemLinkTreeHelpers } from "./scripts/lib/item-link-tree-helpers.js";
import { ItemLinkingHelpers } from "./scripts/lib/item-linking-helper.js";
import { ItemTagsHelpers } from "./scripts/lib/item-tags-helpers.js";
import { PoppersJsHelpers } from "./scripts/lib/poppersjs-helpers.js";

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

Hooks.on("tidy5e-sheet.renderActorSheet", (sheet, element, data) => {
  function main() {
    // items = $(html)[0].querySelectorAll(`[data-tab-contents-for="inventory"] [data-tidy-item-table-row]`);
    const items = element.querySelectorAll(`[data-tab-contents-for="inventory"] [data-tidy-item-table-row]`);
    for (let row of items) {
      const itemId = row.getAttribute("data-item-id");
      const item = data.actor.items.get(itemId);

      let html = "";
      let html2 = "";
      let html3 = "";

      if (ItemTagsHelpers.isItemTagsModuleActive()) {
        const itemTags = item.flags?.["item-tags"]?.tags;
        if (itemTags && itemTags.length > 0) {
          if (ItemTags.Check(item, itemTags, "includeOR")) {
            const tagToHTML = {
              adamant: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Adamant" style="background-color: purple;">AD</span>`,
              steel: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Steel" style="background-color: steelblue;">ST</span>`,
              gold: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Gold" style="background-color: gold;">AU</span>`,
              silver: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Silver" style="background-color: silver;">AG</span>`,
              darksteel: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Darksteel" style="background-color: black;">DS</span>`,
              firesteel: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Firesteel" style="background-color: orange;">FS</span>`,
              icesteel: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Icesteel" style="background-color: lightblue;">IS</span>`,
              mithril: `<span class="material-badge" data-tidy-render-scheme="handlebars" title="Mithril" style="background-color: mauve;">MT</span>`,
            };

            for (const tag of itemTags) {
              if (tagToHTML[tag]) {
                html += tagToHTML[tag];
              }
            }
          }
        }
      }
      //down
      const itemLeafs = API.getCollection(item);
      if (itemLeafs && itemLeafs.length > 0) {
        // Create a green badge with a '+' symbol
        const leafBadgeHtml = `<span class="material-badge2" data-tidy-render-scheme="handlebars">+</span>`;
        const primaryCell = row.querySelector(".item-table-cell.primary");
        primaryCell.insertAdjacentHTML("beforeend", leafBadgeHtml);

        // Find the newly added .material-badge2 element
        const leafBadge = primaryCell.querySelector(".material-badge2");

        // Build the tooltip content
        let tooltipContent = '<div style="text-align: center;">';
        itemLeafs.forEach((leaf) => {
          tooltipContent += `
        <div style="margin-bottom: 10px;">
          <img src="${leaf.img}" alt="${leaf.name}" style="width: 50px; height: 50px;">
          <p><strong>${leaf.name}</strong></p>
          <p>${leaf.shortDescriptionLink}</p>
        </div>
      `;
        });
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
      if (BeaverCraftingHelpers.isBeaverCraftingModuleActive()) {
        const isCrafted = BeaverCraftingHelpers.isItemBeaverCrafted(item);
        if (isCrafted) {
          html3 = `<img src="${CONSTANTS.IMAGES.IS_BEAVER_CRAFTED}" style="border: none; margin-right: 5px;" data-tidy-render-scheme="handlebars" title="Item Crafted" />`;
        }
      }

      if (html !== "") {
        const primaryCell = row.querySelector(".item-table-cell.primary");
        primaryCell.insertAdjacentHTML("afterend", html);

        const badges = primaryCell.parentNode.querySelectorAll(".material-badge");
        badges.forEach((badge) => {
          const materialName = badge.getAttribute("title").toLowerCase(); // Convert title to lowercase for the image filename
          const tooltipContent = `
            <div style="text-align: center;">
              <img src="Tiles/Assets/iconeTS/TSitems/${materialName}.webp" alt="${materialName}" style="width: 150px; height: 150px;">
              <p>${badge.getAttribute("title")}</p>
            </div>
          `;
          PoppersJsHelpers.tippyTooltip(badge, {
            content: tooltipContent,
            interactive: true,
            zIndex: 9999,
            placement: "right",
            allowHTML: true,
          });
        });
      }

      if (ItemLinkingHelpers.isItemLinkingModuleActive()) {
        const isLinked = ItemLinkingHelpers.isItemLinked(item);
        const linkedIcon = isLinked ? CONSTANTS.IMAGES.IS_LINKED : CONSTANTS.IMAGES.IS_BROKEN_LINK;
        const tooltipText = isLinked ? "Item Linked" : "Item Not Linked";
        html2 = `<img src="${linkedIcon}" style="border: none; margin-right: 5px;" data-tidy-render-scheme="handlebars" title="${tooltipText}" />`;
      }

      // After elements are added to the DOM
      if (html2 !== "") {
        const primaryCell = row.querySelector(".item-table-cell.primary");
        primaryCell.insertAdjacentHTML("beforebegin", html2);
      }

      if (html3 !== "") {
        const primaryCell = row.querySelector(".item-table-cell.primary");
        primaryCell.insertAdjacentHTML("beforeend", html3);
        const craftedImage = primaryCell.querySelector("img[src*='cra.png']");
        if (craftedImage) {
          // Add a Tippy tooltip for the "crafted" image
          PoppersJsHelpers.tippyTooltip(craftedImage, {
            content: "Item Craftato", // Tooltip text
            allowHTML: true,
            placement: "right",
            zIndex: 9999,
            interactive: true,
            onShow(instance) {
              // Retrieve the crafted by actor's name and image
              const craftedBy = BeaverCraftingHelpers.itemBeaverCraftedBy(item);
              // const actorImageUrl = findActorImageByName(craftedBy);
              const actor = game.actors.contents.find(
                (a) => a.name === craftedBy && a.img !== "icons/svg/item-bag.svg"
              );
              const actorImageUrl = actor ? actor.prototypeToken.texture.src : null;

              if (actorImageUrl) {
                const craftedByActorImage = `<img src="${actorImageUrl}" style="max-width: 90px; height: auto; display: block; margin: 8px auto;"> Crafted by ${craftedBy}`;

                // Set the tooltip content to the craftedByActorImage
                instance.setContent(craftedByActorImage);
              }
            },
          });
        }
      }
    }
  }
  // Ensure Tippy.js is loaded before running the main code
  PoppersJsHelpers.ensureTippyLoaded(main);
});

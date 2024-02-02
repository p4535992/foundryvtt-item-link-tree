import { error } from "jquery";
import { ItemLinkingHelpers } from "./item-linking-helper";
import Logger from "./Logger";
import { RetrieveHelpers } from "./retrieve-helpers.js";

export class ItemLinkingAutomaticHelpers {
  // let item;
  static async replaceItemWithLinkedItemOnActor(itemUuid, force = false) {
    let itemToCheck = await RetrieveHelpers.getItemAsync(itemUuid);
    // Replace only if there is a base item
    if (ItemLinkingHelpers.isItemLinked(itemToCheck)) {
      const toReplace = await RetrieveHelpers.getItemAsync(itemToCheck.uuid);
      const itemLinked = ItemLinkingHelpers.retrieveLinkedItem(itemToCheck);
      const obj = item.toObject();
      obj.flags["item-linking"] = {
        isLinked: true,
        baseItem: itemLinked,
      };

      const owner = toReplace.actor;
      if (!owner) {
        throw Logger.error(`The item '${itemUuid}' is not on a actor`);
      }
      if (force) {
        await toReplace.delete();
      } else {
        const conf = await toReplace.deleteDialog();
        if (!conf) {
          return false;
        }
      }
      return await owner.createEmbeddedDocuments("Item", [obj]);
    }
  }

  static f_render(html) {
    html[0].querySelector(".drop-location").addEventListener("drop", _onDrop);
  }

  static async _onDrop(event) {
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (data.type !== "Item" || !data.uuid) return;
    item = await fromUuid(data.uuid);
    return _generateContent();
  }

  static async _generateContent() {
    const rows = game.actors.reduce((acc, a) => {
      const items = a.items.filter((i) => {
        return i !== item && i.name === item.name && i.type === item.type;
      });
      if (!items.length) return acc;
      return (
        acc +
        items.reduce((abb, i) => {
          return (
            abb +
            `
        <tr>
            <td>${a.link}</td>
            <td>${i.link}</td>
            <td>
            <a class="replace-button" data-uuid="${i.uuid}">
                <i class="fa-solid fa-recycle"></i>
            </a>
            </td>
        </tr>`
          );
        }, "")
      );
    }, "");

    const style = `
    <style>
    .find-and-replace table tr > :last-child {
        text-align: center;
    </style>`;

    const _content = `
    <table>
        <thead>
        <tr>
            <th>Attore</th>
            <th>Oggetto</th>
            <th>Aggiorna</th>
        </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;

    const DIV = document.createElement("DIV");
    DIV.innerHTML = style + (await TextEditor.enrichHTML(_content, { async: true }));
    d.element[0].querySelector(".drop-location").replaceWith(...DIV.children);
    d.setPosition({ height: "auto" });
    d.setPosition({ width: 600 });
    d.element.find(".replace-button").on("click", async (ev) => {
      const el = ev.currentTarget;
      const uuid = el.dataset.uuid;
      const del = await _replaceItemOnActor(uuid);
      if (del) el.closest("tr").remove();
      if (d.rendered) d.setPosition({ height: "auto" });
    });
  }

  static generateDialog() {
    const d = new Dialog(
      {
        title: "Aggiorna Oggetti",
        content: "<input type='text' placeholder='Droppa Oggetto Qui' class='drop-location'>",
        render: _render,
        buttons: {
          fix: {
            icon: '<i class="fas fa-recycle"></i>',
            label: "Fix all",
            callback: async (html) => {
              const btns = html.find(".replace-button").toArray();
              const type = "Item";
              const confirm = await Dialog.confirm({
                title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${item.name}`,
                content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.format("SIDEBAR.DeleteWarning", {
                  type,
                })}</p>`,
              });
              if (!confirm) return;
              for (const btn of btns) {
                await _replaceItemOnActor(btn.dataset.uuid, true);
              }
            },
          },
          gucci: {
            label: "Done",
            icon: "<i class='fa-solid fa-check'></i>",
          },
        },
      },
      {
        classes: ["dialog", "find-and-replace"],
        dragDrop: [{ dragSelector: null, dropSelector: ".drop-location" }],
      }
    ).render(true);
  }
}

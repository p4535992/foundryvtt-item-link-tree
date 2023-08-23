The api is reachable from the variable `game.modules.get('item-link-tree').api` or from the socket libary `socketLib` on the variable `game.modules.get('item-link-tree').socket` if present and active.

#### getCollection({item: uuid|Item}):void ⇒ <code>Promise&lt;void&gt;</code>

Recupera gli item lef presenti sull'item

**Returns**: <code>Promise&lt;void&gt;</code> - Return nothing

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| item | <code>uuid of the item or item</code> | The uuid of the item or the item object himself | If you use the module 'Item Macro' the variable value is 'item' |


**Example**:

```
game.modules.get('item-link-tree').api.getCollection({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5"
});

```



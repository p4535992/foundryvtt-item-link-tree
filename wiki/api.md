The api is reachable from the variable `game.modules.get('item-link-tree').api` or from the socket libary `socketLib` on the variable `game.modules.get('item-link-tree').socket` if present and active.

### The documentation can be out of sync with the API code checkout the code if you want to dig up [API](../src/scripts/API/api.js)

You can find some javascript examples here **=> [macros](./macros/) <=**

#### getCollection({item: uuid|Item}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item

**Returns**: <code>Leaf[]</code> - Return All the leafs on the item

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| item | <code>uuid of the item or item</code> | The uuid of the item or the item object himself | If you use the module 'Item Macro' the variable value is 'item' |


**Example**:

```
game.modules.get('item-link-tree').api.getCollection({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5"
});

```

#### retrieveLeaf({item: uuid|Item, name: string, uuid:string, id:string}):void ⇒ <code>Leaf</code>

Method to retrieve a specific child item leaf on the the item

**NOTE:** If no filter is been passed the first leaf is been passed as result.

**Returns**: <code>Leaf</code> - Return All the leafs on the item

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| item | <code>uuid of the item or item</code> | The uuid of the item or the item object himself | If you use the module 'Item Macro' the variable value is 'item' |
| name | <code>string</code> | The name of the leaf to retrieve |  |
| uuid | <code>string</code> | The uuid of the leaf to retrieve | |
| id | <code>string</code> | The id of the leaf to retrieve |  |

**Example**:

```
game.modules.get('item-link-tree').api.getCollection({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    name: "Leaf of fire"
});

```



// TODO  DOCUMENTATION

game.modules.get('item-link-tree').api.upgradeItemGeneratorHelpers({
  equipment: ["ArmaturePG"],
  weapon: ["ArmiPG"],
});
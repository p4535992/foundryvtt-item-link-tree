The api is reachable from the variable `game.modules.get('item-link-tree').api` or from the socket libary `socketLib` on the variable `game.modules.get('item-link-tree').socket` if present and active.

### The documentation can be out of sync with the API code checkout the code if you want to dig up [API](../src/scripts/API/api.js)

You can find some javascript examples here **=> [macros](./macros/) <=**

#### getCollection({item: Item|string}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item

**Returns**: <code>Leaf[]</code> - Return All the leafs on the item

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |


**Example**:

```
const arrayLeafs = game.modules.get('item-link-tree').api.getCollection({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5"
});
```

#### retrieveLeafs({item: Item|string, name: string|undefined, uuid:string|undefined, id:string|undefined}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item filtered by name,uuid, id. This is usually a valid and more intuitive method to 'getCollection'

**NOTE:** Is not make very sense using this with only uuid and id

**Returns**: <code>Leaf[]</code> - Return All the leafs on the item

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid/id of the item or the item object himself | |
| name | <code>string</code> | `null` | OPTIONAL: The name of the leaf to retrieve | |
| uuid | <code>string</code> | `null` | OPTIONAL: The uuid of the leaf to retrieve | |
| id | <code>string</code> | `null` | OPTIONAL: The id of the leaf to retrieve |  |

**Example**:

```
const arrayLeafs = game.modules.get('item-link-tree').api.getCollection({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    name: "Leaf of fire"
});

```

#### retrieveLeaf({item: Item|string, name: string|undefined, uuid:string|undefined, id:string|undefined}):void ⇒ <code>Leaf</code>

Method to retrieve a specific child item leaf on the the item

**NOTE:** If no filter is been passed the first leaf is been passed as result.

**Returns**: <code>Leaf</code> - Return a specific Leaf on the item

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| item | <code>Item or string</code> | The uuid of the item or the item object himself | |
| name | <code>string</code> | `null` | OPTIONAL: The name of the leaf to retrieve | |
| uuid | <code>string</code> | `null` | OPTIONAL: The uuid of the leaf to retrieve | |
| id | <code>string</code> | `null` | OPTIONAL: The id of the leaf to retrieve |  |


**Example**:

```
const leaf = game.modules.get('item-link-tree').api.retrieveLeaf({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    name: "Leaf of fire"
});

```


#### getCollectionEffectAndBonus({item: Item|string}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item with subtype or customlink with value `'bonus'` or `'effect'` or `'effectAndBonus'` or `''`.

**Returns**: <code>Leaf[]</code> - Return All the leafs set as effect or bonus on the item.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |


**Example**:

```
const arrayLeafs = game.modules.get('item-link-tree').api.getCollectionEffectAndBonus({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5"
});
```

#### getCollectionByFeature({item: Item|string, features: string[]|undefined, excludes: string[]|undefined}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item filtered by `feature` (alias for the `customLink` property)

**Returns**: <code>Leaf[]</code> - Return All the leafs on the item filtered by specific `feature/customLink/customType`

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| features | <code>string[]</code> | `[]` | OPTIONAL: Pass only the leafs where the `feature/customLink/customType` is contains in this array |
| excludes | <code>string[]</code> | `[]` | OPTIONAL: Pass only the leafs where the `feature/customLink/customType` is not contains in this array |

**Example**:

```
const arrayLeafs = game.modules.get('item-link-tree').api.getCollectionByFeature({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    features: ["source"],
    excludes: []
});
```

#### getCollectionBySubType({item: Item|string, types: string[]|undefined, excludes: string[]|undefined}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item filtered by subtype

**Returns**: <code>Leaf[]</code> - Return All the leafs on the item filtered by specific subtype

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| types | <code>string[]</code> | `[]` | OPTIONAL: Pass only the leafs where the `feature/customLink/customType` is contains in this array |
| excludes | <code>string[]</code> | `[]` | OPTIONAL: Pass only the leafs where the `feature/customLink/customType` is not contains in this array |

**Example**:

```
const arrayLeafs = game.modules.get('item-link-tree').api.getCollectionBySubType({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    types: ["gem", "leaf"],
    excludes: []
});
```

#### getCollectionUpgradableItems({item: Item|string, name: string, excludes: string[]|undefined}):void ⇒ <code>Leaf[]</code>

Method to retrieve all the child item leafs on the the item valid and present on the property `shortDescriptionLink` for the item with the specific name given. This is a utility method for the upgrade behaviour.

**Returns**: <code>Leaf[]</code> - Return All the leafs on the item filtered as valid for the upgrade of hte item with a specific name.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| name | <code>string</code> | | The name of the item to upgrade. |
| excludes | <code>string[]</code> | `[]` | OPTIONAL: Pass only the leafs where the `shortDescriptionLink`  contains this |

**Example**:

```
const arrayLeafs = game.modules.get('item-link-tree').api.getCollectionUpgradableItems({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    types: ["Light Sword"],
    excludes: []
});
```

#### isItemLeaf(item: Item|string):void ⇒ <code>boolean</code>

Method to check if the item is categorized as 'Leaf'

**Returns**: <code>boolean</code> - Return The flag if is a 'Leaf' or no.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |

**Example**:

```
const isItemLeaf = game.modules.get('item-link-tree').api.isItemLeaf("Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5");
```


#### isItemLeafBySubType(item: Item|string, subtype: string):void ⇒ <code>boolean</code>

Method to check if the item is categorized as 'Leaf' and with the specific 'subtype'

**Returns**: <code>boolean</code> - Return The flag if is a 'Leaf' and with the specific 'subType' or no.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| subtype | <code>string</code> | | The subtype reference to check e.g.'gem' or 'crystal' | |

**Example**:

```
const isItemLeafBySubType = game.modules.get('item-link-tree').api.isItemLeafBySubType(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "gem"
);
```

#### isItemLeafByFeature(item: Item|string, feature: string):void ⇒ <code>boolean</code>

Method to check if the item is categorized as 'Leaf' and with the specific `feature/customLink/customType`

**Returns**: <code>boolean</code> - Return The flag if is a 'Leaf' and with the specific `feature/customLink/customType` or no.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| subtype | <code>string</code> | | The subtype reference to check e.g.'upgrade' or 'effect' | |

**Example**:

```
const isItemLeafByFeature = game.modules.get('item-link-tree').api.isItemLeafByFeature(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "gem"
);
```

#### isFilterByItemTypeOk(item: Item|string, itemType: string):void ⇒ <code>boolean</code>

 Method to check if the item is with the specific item type

**Returns**: <code>boolean</code> - Return The flag if is a 'Leaf' is with the specific item type or no.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| itemType | <code>string</code> | | The item type reference to check e.g.'gem' or 'crystal' | |

**Example**:

```
const isFilterByItemTypeOk = game.modules.get('item-link-tree').api.isFilterByItemTypeOk(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "gem"
);
```


#### hasSubtype(item: Item|string, subType: string):void ⇒ <code>boolean</code>

Method to verify if at least one child leaf has the passed subType on the current item.

**Returns**: <code>boolean</code> - Return The flag if is a 'Leaf' is with the specific item type or no.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid of the item or the item object himself. | |
| subType | <code>string</code> | | The subtype reference to check e.g.'gem' or 'crystal' | |

**Example**:

```
const hasSubtype = game.modules.get('item-link-tree').api.hasSubtype(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "gem"
);
```

#### upgradeItem(item: Item|string, leaf: Item|string):void ⇒ <code>Promise&lt;void&gt;</code>

Method to upgrade a item with the passed leaf

**NOTE:** The leaf must be a valid one set as upgrade and with all the options for the upgrade, major information on the upgrade behavior paragraph at the bottom of the document.

**Returns**: <code>Promise&lt;void&gt;</code> - Return No response.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid/id of the item or the item object himself to upgrade. | |
| leaf | <code>Item or string</code> | | The uuid/id of the item leaf with all the details about the upgrade. | |

**Example**:

```
await game.modules.get('item-link-tree').api.upgradeItem(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "Actor.7bm6EK8jnopnGRS4.Item.dbuidghorgrhr4qw3"
);
```

#### removeLeaf(item: Item|string, leaf: Item|string):void ⇒ <code>Promise&lt;void&gt;</code>

Method to remove a child item leaf from the item parent

**Returns**: <code>Promise&lt;void&gt;</code> - Return No response.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid/id of the item or the item object himself containing the leaf. | |
| leaf | <code>Item or string</code> | | The uuid/id of the item leaf to remove. | |

**Example**:

```
await game.modules.get('item-link-tree').api.removeLeaf(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "Actor.7bm6EK8jnopnGRS4.Item.dbuidghorgrhr4qw3"
);
```


  /**
   *
   *
   * @param {Item|string} item The uuid/id of the item or the item object himself containing the leaf.
   * @param {Item|string} leaf The uuid/id of the item leaf to add.
   * @param {object} [leafOptions={}] The options object to pass for customize the leaf data by ovverriding the one passed by default on the item leaf
   * @param {string} [leafOptions.subType=null] The `subType` to override on the leaf data
   * @param {boolean} [leafOptions.showImageIcon=false] The `showImageIcon` to override on the leaf data
   * @param {Item|string} [leafOptions.customType=null] The `customType` to override on the leaf data
   * @param {Item|string} [leafOptions.shortDescriptionLink =null] The `shortDescriptionLink` to override on the leaf data
   * @param {Item|string} [leafOptions.customLink=null] The `customLink` to override on the leaf data
   * @returns {Promise<void>} No response.
   */

#### addLeaf(item: Item|string, leaf: Item|string, leafOptions:Object|undefined):void ⇒ <code>Promise&lt;void&gt;</code>

Method to add a child item leaf from the item parent.

**NOTE:** If both the property `customLink` and `customType` are passed `customLink` is the one used.

**Returns**: <code>Promise&lt;void&gt;</code> - Return No response.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid/id of the item or the item object himself containing the leaf. | |
| leaf | <code>Item or string</code> | | The uuid/id of the item leaf to remove. | |
| leafOptions | | <code>Object</code> | `{}` | OPTIONAL: The options object to pass for customize the leaf data by ovverriding the one passed by default on the item leaf | |
| [leafOptions.subType] | | <code>string</code> | `null` | The `subType` to override on the leaf data  | |
| [leafOptions.showImageIcon] | | <code>boolean|null</code> | `null` | The `showImageIcon` to override on the leaf data  | |
| [leafOptions.customType] | | <code>string</code> | `null` |  The `customType` to override on the leaf data  | |
| [leafOptions.shortDescriptionLink] | | <code>string</code> | `null` | The `shortDescriptionLink` to override on the leaf data  | |
| [leafOptions.customLink]  | | <code>string</code> | `null` | The `customLink` to override on the leaf data  | |

**Example**:

```
await game.modules.get('item-link-tree').api.addLeaf(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "Actor.7bm6EK8jnopnGRS4.Item.dbuidghorgrhr4qw3",
    {
        showImageIcon: true
    }
);
```


#### prepareItemsLeafsFromAddLeaf(item: Item|string, leaf: Item|string, leafOptions:Object|undefined):void ⇒ <code>Promise&lt;void&gt;</code>

Method to add a child item leaf from the item parent, just like the method 'addLeaf' but for a 'bulk' opertions on multiple items.

**NOTE:** If both the property `customLink` and `customType` are passed `customLink` is the one used.

**Returns**: <code>Promise&lt;void&gt;</code> - Return No response.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Item or string</code> | | The uuid/id of the item or the item object himself containing the leaf. | |
| leaf | <code>Item or string</code> | | The uuid/id of the item leaf to remove. | |
| leafOptions | | <code>Object</code> | `{}` | OPTIONAL: The options object to pass for customize the leaf data by ovverriding the one passed by default on the item leaf | |
| [leafOptions.subType] | | <code>string</code> | `null` | The `subType` to override on the leaf data  | |
| [leafOptions.showImageIcon] | | <code>boolean|null</code> | `null` | The `showImageIcon` to override on the leaf data  | |
| [leafOptions.customType] | | <code>string</code> | `null` |  The `customType` to override on the leaf data  | |
| [leafOptions.shortDescriptionLink] | | <code>string</code> | `null` | The `shortDescriptionLink` to override on the leaf data  | |
| [leafOptions.customLink]  | | <code>string</code> | `null` | The `customLink` to override on the leaf data  | |

**Example**:

```
await game.modules.get('item-link-tree').api.prepareItemsLeafsFromAddLeaf(
    "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    "Actor.7bm6EK8jnopnGRS4.Item.dbuidghorgrhr4qw3",
    {
        showImageIcon: true
    }
);
```


## EXPERIMENTAL API (USE AT YOUR OWN RISK)


#### upgradeItemGeneratorHelpers(compendiumMapLabelsByType:Object.<string, string[]>):void ⇒ <code>Promise&lt;void&gt;</code>

Method for 'try' to automatic generate some upgradable leaf for the chain Dnd5e logic for weapons and armors +1,+2,+3

**Returns**: <code>Promise&lt;void&gt;</code> - Return No response.

| Param | Type | Default | Description | Note |
| ---   | ---  | ---     | ---         | ---  |
| item | <code>Object.<string, string[]></code> | | The record list containing filter for item type and a array  of labels compendiums to check | |

**Example**:

```
game.modules.get('item-link-tree').api.upgradeItemGeneratorHelpers({
  equipment: ["CompendiumLabel1", "CompendiumLabel2"],
  weapon: ["CompendiumLabel3", "CompendiumLabel1"],
});
```

## Feature/CustomLink/CustomType default Behaviour

TODO

#### Default

TODO

#### Effect

TODO

#### Bonus

TODO

#### Effect and Bonus

TODO

#### Upgrade

TODO

### Item Link Tree

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-item-link-tree/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fitem-link-tree&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=item-link-tree)

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-item-link-tree%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-item-link-tree%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fitem-link-tree%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/item-link-tree/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/foundryvtt-item-link-tree/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/item-link-tree/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/item-link-tree/)

A module that allows specific items to be attached to other Items, Features, etc  for Build a tree hierarchy for your items to link together and use the logic you create to do weird things with other modules.

The module allows in a very general, but at the same time simple way to link objects together with custom references.

There is an integration to transfer and cancel effects with [Dae](https://foundryvtt.com/packages/dae) and/or bonuses with [Babonus](https://foundryvtt.com/packages/babonus), allowing for replicating Downgrade and/or Upgrade mechanisms of items.

There is also for those who use it an integration with the [Item Linking](https://foundryvtt.com/packages/item-linking) module.

This module is a personal only use module forked from [Item with spells](https://github.com/krbz999/foundryvtt-item-link-tree) made for a personal use case, which I make available to all with [krbz999 (aka Zhell)](https://github.com/krbz999/) approval and license compatibility.

I strongly urge you to tip him, to his kofi account: [Ko-fi](https://ko-fi.com/zhell)

**NOTE: This module is been tested only on Dnd5e system**

**NOTE: To help to use this module i created as a example a custom item sheet for Tool type items on the Dnd5e system**

#### Example manage a chain of weapons ?

An 'example I have to connect 3 objects Longsword +1 , Longsword +2 and Longsword +3 in mod that are connected by the logical value "upgrade" because one is the superior version of the other.

![](wiki/exampe_superior.gif)

#### Example manage a recipe ?

We connect some ingredients to the final object

![](wiki/example_recipe.gif)

#### Example apply a broken status on the weapon ?

We apply a -5 on the attack of the item because is Broken...

![](wiki/example_broken_condition.gif)

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/foundryvtt-item-link-tree/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

### libWrapper

This module uses the [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) library for wrapping core methods. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.

### DAE

This module uses the [Dae](https://foundryvtt.com/packages/dae) module. It is a optional dependency and it is recommended for the best experience and compatibility with other modules.

### Babonus

This module uses the [Babonus](https://foundryvtt.com/packages/babonus) module. It is a optional  dependency and it is recommended for the best experience and compatibility with other modules.

### Item Linking

This module uses the [Item Linking](https://foundryvtt.com/packages/item-linking) module. It is a optional  dependency and it is recommended for the best experience and compatibility with other modules.


## Known issue

# API

The wiki for the API is [here](wiki/api.md)

# Hooks

### Hooks.call("item-link-tree.preAddLeafToItem", currentItem, itemAdded) => boolean

### Hooks.call("item-link-tree.postAddLeafToItem", currentItem, itemAdded) => Promise<void>


### Hooks.call("item-link-tree.preRemoveLeafFromItem", currentItem, itemRemoved) => boolean

### Hooks.call("item-link-tree.postRemoveLeafFromItem", currentItem, itemRemoved) => Promise<void>


### Hooks.call("item-link-tree.preUpdateLeafFromItem", item, itemToUpdate, oldLeafs) => boolean

### Hooks.call("item-link-tree.postUpdateLeafFromItem", item, itemToUpdate, oldLeafs) => Promise<void>


### Hooks.call("item-link-tree.preUpgradeAdditionalCost", actor, currentItem, itemUpgraded, options) => boolean

### Hooks.call("item-link-tree.preUpgrade", actor, currentItem, itemUpgraded, options) => boolean

### Hooks.call("item-link-tree.postUpgrade", actor, currentItem, itemUpgraded, options) => Promise<void>


# Build

## Install all packages

```bash
npm install
```

### dev

`dev` will let you develop you own code with hot reloading on the browser

```bash
npm run dev
```

## npm build scripts

### build

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### build-watch

`build-watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build-watch
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

## [Changelog](./CHANGELOG.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-item-link-tree/issues), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- [Items with spells 5e](https://github.com/krbz999/foundryvtt-item-link-tree) with [MIT](https://github.com/krbz999/foundryvtt-item-link-tree/blob/master/LICENSE)

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Credit

- Thanks to [krbz999 (aka Zhell)](https://github.com/krbz999/) for the module [Items with spells 5e](https://github.com/krbz999/foundryvtt-item-link-tree)

import CONSTANTS from "../constants/constants.js";
import Logger from "./Logger.js";
import { RetrieveHelpers } from "./retrieve-helpers.js";

// ================================================================================

export function getDocument(target) {
  return RetrieveHelpers.getDocument(target);
}

export function stringIsUuid(inId) {
  return RetrieveHelpers.stringIsUuid(inId);
}

export function getUuid(target) {
  return RetrieveHelpers.getUuid(target);
}

export function getCompendiumCollectionSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getCompendiumCollectionSync(target, ignoreError, ignoreName);
}

export async function getCompendiumCollectionAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getCompendiumCollectionAsync(target, ignoreError, ignoreName);
}

export function getUserSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getUserSync(target, ignoreError, ignoreName);
}

export function getActorSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getActorSync(target, ignoreError, ignoreName);
}

export async function getActorAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getActorAsync(target, ignoreError, ignoreName);
}

export function getJournalSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getJournalSync(target, ignoreError, ignoreName);
}

export async function getJournalAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getJournalAsync(target, ignoreError, ignoreName);
}

export function getMacroSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getMacroSync(target, ignoreError, ignoreName);
}

export async function getMacroAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getMacroAsync(target, ignoreError, ignoreName);
}

export function getSceneSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getSceneSync(target, ignoreError, ignoreName);
}

export async function getSceneAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getSceneAsync(target, ignoreError, ignoreName);
}

export function getItemSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getItemSync(target, ignoreError, ignoreName);
}

export async function getItemAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getItemAsync(target, ignoreError, ignoreName);
}

export function getPlaylistSoundPathSync(target, ignoreError = false, ignoreName = true) {
  return RetrieveHelpers.getPlaylistSoundPathSync(target, ignoreError, ignoreName);
}

export async function getPlaylistSoundPathAsync(target, ignoreError = false, ignoreName = true) {
  return await RetrieveHelpers.getPlaylistSoundPathAsync(target, ignoreError, ignoreName);
}

// =============================================================

export function isEmptyObject(obj) {
  // because Object.keys(new Date()).length === 0;
  // we have to do some additional check
  if (obj === null || obj === undefined) {
    return true;
  }
  const result =
    obj && // null and undefined check
    Object.keys(obj).length === 0; // || Object.getPrototypeOf(obj) === Object.prototype);
  return result;
}

export function parseAsArray(obj, separator = ",") {
  if (!obj) {
    return [];
  }
  let arr = [];
  if (typeof obj === "string" || obj instanceof String) {
    arr = obj.split(separator ?? ",");
  } else if (obj.constructor === Array) {
    arr = obj;
  } else {
    arr = [obj];
  }
  return arr;
}

export function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}

export function isRealBoolean(inBoolean) {
  return String(inBoolean) === "true" || String(inBoolean) === "false";
}

export function isRealBooleanOrElseNull(inBoolean) {
  return isRealBoolean(inBoolean) ? inBoolean : null;
}

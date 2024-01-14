import CONSTANTS from "../constants/constants.js";
import Logger from "./Logger.js";

// =================================
// Logger Utility
// ================================

export function debug(msg, ...args) {
  return Logger.debug(msg, args);
}

export function log(message, ...args) {
  return Logger.log(message, args);
}

export function notify(message, ...args) {
  return Logger.notify(message, args);
}

export function info(info, notify = false, ...args) {
  return Logger.info(info, notify, args);
}

export function warn(warning, notify = false, ...args) {
  return Logger.warn(warning, notify, args);
}

export function error(error, notify = true, ...args) {
  return Logger.error(error, notify, args);
}

export function timelog(message) {
  return Logger.timelog(message);
}

export const i18n = (key) => {
  return Logger.i18n(key);
};

export const i18nFormat = (key, data = {}) => {
  return Logger.i18nFormat(key, data);
};

export function dialogWarning(message, icon = "fas fa-exclamation-triangle") {
  return Logger.dialogWarning(message, icon);
}

// ================================================================================

export function getDocument(target) {
  if (stringIsUuid(target)) {
    target = fromUuidSync(target);
  }
  return target?.document ?? target;
}

export function stringIsUuid(inId) {
  return typeof inId === "string" && (inId.match(/\./g) || []).length && !inId.endsWith(".");
}

export function getUuid(target) {
  if (stringIsUuid(target)) {
    return target;
  }
  const document = getDocument(target);
  return document?.uuid ?? false;
}

export function getItemSync(target, ignoreError = false, ignoreName = true) {
  if (!target) {
    throw error(`Item is undefined`, true, target);
  }
  if (target instanceof Item) {
    return target;
  }
  // This is just a patch for compatibility with others modules
  if (target.document) {
    target = target.document;
  }
  if (target.uuid) {
    target = target.uuid;
  }

  if (target instanceof Item) {
    return target;
  }
  if (stringIsUuid(target)) {
    target = fromUuidSync(target);
  } else {
    target = game.items.get(target);
    if (!target && !ignoreName) {
      target = game.items.getName(target);
    }
  }
  if (!target) {
    if (ignoreError) {
      warn(`Item is not found`, false, target);
      return;
    } else {
      throw error(`Item is not found`, true, target);
    }
  }
  // Type checking
  if (!(target instanceof Item)) {
    if (ignoreError) {
      warn(`Invalid Item`, true, target);
      return;
    } else {
      throw error(`Invalid Item`, true, target);
    }
  }
  return target;
}

export async function getItemAsync(target, ignoreError = false, ignoreName = true) {
  if (!target) {
    throw error(`Item is undefined`, true, target);
  }
  if (target instanceof Item) {
    return target;
  }
  // This is just a patch for compatibility with others modules
  if (target.document) {
    target = target.document;
  }
  if (target.uuid) {
    target = target.uuid;
  }

  if (target instanceof Item) {
    return target;
  }
  if (stringIsUuid(target)) {
    target = await fromUuid(target);
  } else {
    target = game.items.get(target);
    if (!target && !ignoreName) {
      target = game.items.getName(target);
    }
  }
  if (!target) {
    if (ignoreError) {
      warn(`Item is not found`, false, target);
      return;
    } else {
      throw error(`Item is not found`, true, target);
    }
  }
  // Type checking
  if (!(target instanceof Item)) {
    if (ignoreError) {
      warn(`Invalid Item`, true, target);
      return;
    } else {
      throw error(`Invalid Item`, true, target);
    }
  }
  return target;
}

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

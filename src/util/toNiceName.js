/**
 * Converts a camelCase name to a nice name
 * @param {string} name
 * @return {string}
 */
export function toNiceName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function(str) {
      return str.toUpperCase();
    });
}

/**
 * Converts a camelCase name to a nice name
 * @param name - The camelCase string to convert
 * @returns The converted string
 */
export function toNiceName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
}

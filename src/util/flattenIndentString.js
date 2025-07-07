export function flattenIndentedString(str) {
    return str
        .split("\n")
        .map(line => line.replace(/^\s+/, ""))
        .join("\n")
}

export function oneLineString(str) {
    return str
        .split("\n")
        .map(line => line.replace(/^\s+/, ""))
        .join(" ")
}

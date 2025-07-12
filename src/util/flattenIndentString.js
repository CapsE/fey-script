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

export function normalizeIndentation(input) {
    const lines = input.split('\n');

    // Ignore empty lines and get min leading whitespace count
    const minIndent = Math.min(
        ...lines
            .filter(line => line.trim() !== '')
            .map(line => line.match(/^[ \t]*/)?.[0].length || 0)
    );

    // Remove minIndent characters from start of each line
    return lines
        .map(line => line.replace(new RegExp(`^[ \\t]{0,${minIndent}}`), ''))
        .join('\n');
}

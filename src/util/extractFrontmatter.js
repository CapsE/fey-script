import yaml from 'yaml';
import {normalizeIndentation} from "./flattenIndentString.js";

export function extractFrontmatter(mdx) {
    mdx = mdx.replaceAll('\r', '\n');
    console.log(mdx);
    const regex = /^\s*---\n([\s\S]*?)\n\s*---/g
    const match = regex.exec(mdx)
    let frontMatterData = {}

    // Get content after match
    if (match) {
        try {
            frontMatterData = yaml.parse(normalizeIndentation(match[1]))
        } catch (err) {
            console.log(err)
        }

        mdx = mdx.replace(match[0], "")
    }

    return {
        frontMatterData,
        cleanMDX: mdx
    }
}

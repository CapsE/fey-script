import yaml from 'yaml';
import {flattenIndentedString} from "./flattenIndentString.js";

export function extractFrontmatter(mdx) {
    const regex = /^\s*---\n([\s\S]*?)\n\s*---/g
    const match = regex.exec(mdx)
    let frontMatterData = {}

    // Get content after match
    if (match) {
        try {
            frontMatterData = yaml.parse(flattenIndentedString(match[1]))
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

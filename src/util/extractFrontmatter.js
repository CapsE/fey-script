import yaml from 'yaml';

export function extractFrontmatter(mdx) {
    const regex = /^\n*---\n([\s\S]*?)\n---/g
    const match = regex.exec(mdx)
    let frontMatterData = {}

    // Get content after match
    if (match) {
        try {
            frontMatterData = yaml.parse(match[1])
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

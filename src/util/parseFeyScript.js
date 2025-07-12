import {extractFrontmatter} from "./extractFrontmatter.js";
import {flattenIndentedString, oneLineString} from "./flattenIndentString.js";

const maxLoopCount = 100;
async function scanForImports(code, resolveImports, count) {
    const matches = [...code.matchAll(/\{\{>(.*?)\}\}/gm)];

    if (matches.length === 0) return code;

    // Resolve all imports in parallel
    const replacements = await Promise.all(
        matches.map((match) => resolveImports(match[1].trim()))
    );

    // Apply replacements
    for (let i = 0; i < matches.length; i++) {
        const [fullMatch] = matches[i];
        code = code.replace(fullMatch, replacements[i] ? flattenIndentedString(replacements[i]) : "");
    }

    // Recurse if needed
    if (count < maxLoopCount) {
        return scanForImports(code, resolveImports, count + 1);
    }

    return `# Import Chain too deep
Do you have a circular import of multiple files importing each other?`;
}

export async function parseFeyScript(code, resolveImports = async (path) => '') {
    code = code.replaceAll('\r', '\n');
    code = code.replaceAll('&amp;', '&');
    code = await scanForImports(code, resolveImports, 0);

    code = code.replaceAll(/:::if ([^\n]+)\n([\s\S]+?)\n:::/gm, (match, condition, inner) => {
        return `<fey-if expression="${condition}">${inner}</fey-if>`
    })
    code = code.replaceAll(/\{\{(.*?)\}\}/g, (match, inner) => {
        return `<fey-eval expression="${inner}"></fey-eval>`;
    });

    code = code.replaceAll(/i\[(.*?)\]\W/g, (match, inner) => {
            const [name, data] = inner.split("|");

            let obj = {};
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    obj = { ...parsed }
                } catch (e) {
                    console.error(e)
                }
            }

            obj.type = obj.type || "number"
            return oneLineString(`<fey-input
                        type="${obj.type}"
                        key="${name}"
                        label="${obj.label || ''}"
                        value="${obj.value}"
                  ></fey-input>`);
    });

    code = code.replaceAll(/s\[(\S+)\]\[(\n\S+)+\n\]/g, (match, inner) => {
        const [name, json] = inner.split(";")
        let obj = { name, value: "", key: name, type: "select" }

        if (json) {
            try {
                const parsed = JSON.parse(json)
                obj = { ...obj, ...parsed }
            } catch (e) {
                console.error(e)
            }
        }

        const options = match.split("\n");
        options.shift();
        options.pop();
        const out = oneLineString(`<fey-select
                    options="${JSON.stringify(options).replaceAll('"', `'`)}"
                    key="${name}"
                    label="${obj.label || ''}"
                    value="${obj.value}"
                ></fey-select>`);
        return out;
    });

    code = code.replaceAll(/:::grid-(\d(-\d)*)?\n([\s\S]*?)\n:::/g, (match, cols, b, content) => {
        return `\n<fey-grid class="grid" grid="${cols}">\n${content}\n</fey-grid>\n`;
    })

    code = code.replaceAll(/:::row\n([\s\S]*?)\n:::/g, (match, content) => {
        return `\n<fey-container class="row">\n${content}\n</fey-container>\n`;
    })

    code = code.replaceAll(/\[\[\>([\s\S]+?)\]\]/g, (match, inner) => {
        return `\n<fey-card class="card" import="${inner.trim()}"></fey-card>\n`
    });

    code = code.replaceAll(/\[\[([\s\S]+?)\n\]\]/g, (match, inner) => {
        return `\n<fey-container class="card">${inner.replaceAll('\n\n', '<br><br>')}</fey-container>\n`
    });

    code = code.replaceAll(/(\|-- .+? ---[\s\S]*?\|---)/g, (match, inner) => {
        const tabsCode = inner.split(/(?:^|\n)\|-- (.+?) ---/)
        const tabs = []
        for (let i = 1; i < tabsCode.length; i += 2) {
            tabs.push({
                title: tabsCode[i],
                content: tabsCode[i + 1]
                    .replace(/\n\|/g, "\n")
                    .replace(/\n---/g, "")
                    .trim()
            })
        }
        return `\n<fey-tabs class="tab-view">
    <div class="tab-buttons">
        ${tabs.map((tab) => `<button>${tab.title}</button>`).join('')}
    </div>
    <div class="tabs">
        ${tabs.map((tab) => `<div class="tab">${tab.content}</div>`).join('')}
    </div>
</fey-tabs>\n`
    });

    code = code.replaceAll(/(?<![\w\/])((\d+)?d(\d+)(?:k[lh]?\d+)?([+\-*\/]\d+)?[+\-]*)+(?![\w\/])|(?<![\w\/])([+\-]{1,2}\d+)(?![\w\/])/g, (match, inner) => {
        return `<fey-rollable notation="${match}"></fey-rollable>`
    });

    return code;
}

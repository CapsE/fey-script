import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"
import { Input } from "../components/input"
import { Rollable } from "../components/Rollable.jsx"
import { TabView } from "../components/TabView.jsx"
import React from "react"
import remarkGfm from "remark-gfm"
import yaml from "yaml"
import { Select } from "../components/select.jsx"
import { Grid } from "../components/grid.jsx"
import { PopoverLink } from "../components/popoverLink.jsx"
import Columns from "../components/Columns.jsx"
import {Card} from "../components/Card.jsx"

// -- Context --

const DataContext = React.createContext([])

// -- Utility Functions --

function replaceRange(str, x, y, replacement) {
    return str.slice(0, x) + replacement + str.slice(y)
}

export function safeEval(code, context) {
    context.$mod = v =>
        Math.floor((v - 10) / 2) < 0
            ? Math.floor((v - 10) / 2)
            : "+" + Math.floor((v - 10) / 2)
    const keys = Object.keys(context)
    const values = Object.values(context)
    let out;

    try {
        out = Function(...keys, `"use strict"; return (${code})`)(...values)
    } catch (e) {
        console.warn(e.message);
        out = 'x';
    }
    return out;
}

// -- Components Map --

const types = {
    Input,
    Rollable,
    Columns,
    TabView,
    Select,
    Grid,
    HoverLink: PopoverLink,
    Card
}

// -- JSX Data Storage --

const jsxData = {};

function pushData(data) {
    const key = crypto.randomUUID();
    jsxData[key] = data;
    return key;
}

// -- General Replacer Generator --

function makeReplacer({ regex, getReplacement, onMatch }) {
    return async (str) => {
        const matches = []
        let m
        let index = 0

        // Clone regex with same flags and reset lastIndex
        const re = new RegExp(regex.source, regex.flags)

        while ((m = re.exec(str)) !== null) {
            const start = m.index
            const end = start + m[0].length
            const replacement = await getReplacement(m, index)
            if (onMatch) onMatch(m, index)
            matches.push({ match: m, start, end, replacement })
            index++
        }

        for (let i = matches.length - 1; i >= 0; i--) {
            const { start, end, replacement } = matches[i]
            str = replaceRange(str, start, end, replacement)
        }

        return str
    }
}


// -- Replacers --

const inputReplacer = makeReplacer({
    regex: /i\[(.*?)\]\W/g,
    getReplacement: async (match) => {
        const [name, data] = match[1].split("|");
        console.log(name);
        let obj = { name, value: "", key: name }

        if (/\[\d+\/\d+/.test(data)) {
            obj.value = data.split("/")[0].slice(1)
            obj.max = data.split("/")[1]
            obj.type = "checkmarks"
        } else if (/\d+\/\d+/.test(data)) {
            obj.value = data.split("/")[0]
            obj.max = data.split("/")[1]
        } else if (data) {
            try {
                const parsed = JSON.parse(data)
                obj = { ...obj, ...parsed }
            } catch (e) {
                console.error(e)
            }
        }

        obj.type = obj.type || "number"

        const key = pushData(obj);
        return `<Wrapper type="Input" id="${key}" />`
    }
})

const diceReplacer = makeReplacer({
    regex: /(?<![\w\/])((\d+)?d(\d+)(?:k[lh]?\d+)?([+\-*\/]\d+)?[+\-]*)+(?![\w\/])|(?<![\w\/])([+\-]{1,2}\d+)(?![\w\/])/g,
    getReplacement: async (match) => {
        const key = pushData({ value: match[0] });
        return `<Wrapper type="Rollable" id="${key}" />`
    }
})

const columnReplacer = (str, context) =>
    makeReplacer({
        regex: /-\|-\n([\s\S]*?)\n-\|-/g,
        getReplacement: async (match) => {
            const key = pushData({ value: match[1], context });
            return `<Wrapper type="Columns" id="${key}" />`
        }
    })(str)

const gridReplacer = (str, context, resolveImports) =>
    makeReplacer({
        regex: /:::grid-(\d(-\d)*)?\n([\s\S]*?)\n:::/g,
        getReplacement: async (match) => {
            const key = pushData({
                cols: match[1],
                content: match[3],
                context,
                resolveImports
            });
            return `<Wrapper type="Grid" id="${key}" />`
        }
    })(str)

const tabReplacer = str =>
    makeReplacer({
        regex: /(\|-- .+? ---[\s\S]*?\|---)/g,
        getReplacement: async (match) => {
            const tabsCode = match[1].split(/(?:^|\n)\|-- (.+?) ---/)
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
            const key = pushData({ tabs });
            return `<Wrapper type="TabView" id="${key}" />`
        }
    })(str)

const selectReplacer = (str) =>
    makeReplacer({
        regex: /s\[(\S+)\]\[(\n\S+)+\n\]/g,
        getReplacement: async (match) => {
            const [name, json] = match[1].split(";")
            let obj = { name, value: "", key: name, type: "select" }

            if (json) {
                try {
                    const parsed = JSON.parse(json)
                    obj = { ...obj, ...parsed }
                } catch (e) {
                    console.error(e)
                }
            }

            const options = match[0].split("\n")
            options.shift()
            options.pop()
            obj.options = options
            const key = pushData(obj);
            return `<Wrapper type="Select" id="${key}" />`
        }
    })(str)

const popoverLinkReplacer = (str, context, resolveImports) =>
    makeReplacer({
        regex: /(?<!\!)\[([\s\S]+?)\]\(>([^)]+)\)/g,
        getReplacement: async (match) => {
            const path = match[2]

            const markdown = await resolveImports(path.trim())
            const key = pushData({
                markdown: markdown,
                text: match[1]
            });
            return `<Wrapper type="HoverLink" id="${key}" />`
        }
    })(str)

const cardReplacer = (str, context, resolveImports) =>
    makeReplacer({
        regex: /\[\[>(.*?)\]\]/gm,
        getReplacement: async (match) => {
            const path = match[1]

            const markdown = await resolveImports(path.trim());
            const {frontMatterData} = extractFrontmatter(markdown);
            const data = {
                img: frontMatterData.img,
                title: frontMatterData.title,
                description: frontMatterData.description,
                link: path
            }
            if(!data.img) {
                const regex = /!\[.*?\]\((.*?)\)/;
                const match = markdown.match(regex);
                data.img =  match?.[1] || null;
            }
            if(!data.title) {
                const regex = /(#{1,6})\s+(.*)/m;
                const match = markdown.match(regex);
                data.title = match?.[2] || null;
            }
            jsxData.push(data);
            const key = pushData(data);
            return `<Wrapper type="Card" id="${key}" />`
        }
    })(str)

const evalReplacer = (str, context) =>
    makeReplacer({
        regex: /\{\{(.*?)\}\}/g,
        getReplacement: async (match) => {
            try {
                const value = safeEval(match[1], context)
                return value ?? "X"
            } catch (error) {
                console.warn("Error evaluating expression:", error)
                return "X"
            }
        }
    })(str)

// -- Wrapper Component --

const Wrapper = ({ type, id }) => {
    const Component = types[type]
    const data = jsxData[id]
    return <Component {...data} />
}

function flattenIndentedString(str) {
    return str
        .split("\n")
        .map(line => line.replace(/^\s+/, "")) // remove only leading whitespace
        .join("\n") // preserve empty lines
}

function extractFrontmatter(mdx) {
    const regex = /^---\n([\s\S]*?)\n---/g
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
// -- Render Function --
export async function renderMDX(mdx, context, resolveImports) {
    mdx = mdx.replace(/\r\n/g, '\n');
    const {frontMatterData, cleanMDX} = extractFrontmatter(mdx);
    mdx = cleanMDX;

    if (frontMatterData) {
        context = {
            ...frontMatterData,
            ...context
        }
    }

    let loopCount = 0
    const maxLoopCount = 100

    const importRegex = /\{\{>(.*?)\}\}/gm
    const ifRegex = /^:::if ([^\n]+)\n([\s\S]+?)\n:::/gm

    while (importRegex.test(mdx) || ifRegex.test(mdx)) {
        mdx = mdx.replace(ifRegex, (match, varName, content) => {
            const value = safeEval(varName, context)

            return value ? content : ""
        })

        const matches = [...mdx.matchAll(/\{\{>(.*?)\}\}/gm)];

        for (const match of matches) {
            const [fullMatch, path] = match;
            const replaced = await resolveImports(path.trim());
            mdx = mdx.replace(fullMatch, replaced || "");
        }

        loopCount++
        if (loopCount === maxLoopCount) {
            mdx = `# Import Chain to deep
                Do you have a circle import of multiple files importing each other?`
        }
    }

    mdx = flattenIndentedString(mdx)
    mdx = await evalReplacer(mdx, context)
    mdx = await gridReplacer(mdx, context, resolveImports) // Pass resolveImports here
    mdx = await diceReplacer(mdx)
    mdx = await inputReplacer(mdx)
    mdx = await columnReplacer(mdx, context)
    mdx = await tabReplacer(mdx)
    mdx = await selectReplacer(mdx, context)
    mdx = await popoverLinkReplacer(mdx, context, resolveImports)
    mdx = await cardReplacer(mdx, context, resolveImports)

    const { default: MDXContent } = await evaluate(mdx, {
        ...runtime,
        remarkPlugins: [remarkGfm]
    });

    return <DataContext.Provider value={jsxData}>
        {MDXContent({
            components: {
                Wrapper
            }
        })}
    </DataContext.Provider>
}

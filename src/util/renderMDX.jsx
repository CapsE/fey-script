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
    return Function(...keys, `"use strict"; return (${code})`)(...values)
}

// -- Components Map --

const types = {
    Input,
    Rollable,
    Columns,
    TabView,
    Select,
    Grid,
    HoverLink: PopoverLink
}

// -- JSX Data Storage --

const jsxData = []

// -- General Replacer Generator --

function makeReplacer({ regex, getReplacement, onMatch }) {
    return str => {
        const matches = []
        let m
        let index = 0

        while ((m = regex.exec(str)) !== null) {
            const start = m.index
            const end = start + m[0].length
            const replacement = getReplacement(m, index)
            if (onMatch) onMatch(m, index)
            matches.push({ match: m, start, end, replacement })
            index++
        }

        // Replace in reverse to avoid shifting indexes
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
    getReplacement: (_match, _index) =>
        `<Wrapper type="Input" id="${jsxData.length}" />`,
    onMatch: match => {
        const [name, data] = match[1].split("|")
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

        jsxData.push(obj)
    }
})

const diceReplacer = makeReplacer({
    regex: /(?<![\w\/])((\d+)?d(\d+)(?:k[lh]?\d+)?([+\-*\/]\d+)?[+\-]*)+(?![\w\/])|(?<![\w\/])([+\-]{1,2}\d+)(?![\w\/])/g,
    getReplacement: match => {
        jsxData.push({ value: match[0] })
        return `<Wrapper type="Rollable" id="${jsxData.length - 1}" />`
    }
})

const columnReplacer = (str, context) =>
    makeReplacer({
        regex: /-\|-\n([\s\S]*?)\n-\|-/g,
        getReplacement: match => {
            jsxData.push({ value: match[1], context })
            return `<Wrapper type="Columns" id="${jsxData.length - 1}" />`
        }
    })(str)

const gridReplacer = (str, context, resolveImports) =>
    makeReplacer({
        regex: /:::grid-(\d(-\d)*)?\n([\s\S]*?)\n:::/g,
        getReplacement: match => {
            jsxData.push({
                cols: match[1],
                content: match[3],
                context,
                resolveImports
            })
            return `<Wrapper type="Grid" id="${jsxData.length - 1}" />`
        }
    })(str)

const tabReplacer = str =>
    makeReplacer({
        regex: /(\|-- .+? ---[\s\S]*?\|---)/g,
        getReplacement: match => {
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
            jsxData.push({ tabs })
            return `<Wrapper type="TabView" id="${jsxData.length - 1}" />`
        }
    })(str)

const selectReplacer = (str, context) =>
    makeReplacer({
        regex: /s\[(\S+)\]\[(\n\S+)+\n\]/g,
        getReplacement: match => {
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
            jsxData.push(obj)
            return `<Wrapper type="Select" id="${jsxData.length - 1}" />`
        }
    })(str)

const popoverLinkReplacer = (str, context, resolveImports) =>
    makeReplacer({
        regex: /\[([\s\S]+)\]\(>([^)]+)\)/g,
        getReplacement: match => {
            const path = match[2]
            console.log(path)

            const markdown = resolveImports(path.trim())
            jsxData.push({
                markdown: markdown,
                text: match[1]
            })
            return `<Wrapper type="HoverLink" id="${jsxData.length - 1}" />`
        }
    })(str)

const evalReplacer = (str, context) =>
    makeReplacer({
        regex: /\{\{(.*?)\}\}/g,
        getReplacement: match => {
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

function parseIfBlocks(input) {
    const lines = input.split('\n');
    const stack = [];
    const root = { type: 'root', children: [] };
    let current = root;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith(':::if ')) {
            const condition = trimmed.slice(6).trim();
            const node = { type: 'if', condition, children: [] };
            current.children.push(node);
            stack.push(current);
            current = node;
        } else if (trimmed === ':::' && current.type === 'if') {
            current = stack.pop();
        } else {
            current.children.push({ type: 'text', value: line });
        }
    }

    return root;
}

function renderTree(node, context) {
    if (node.type === 'if') {
        let result = null;
        try {
            result = safeEval(node.condition, context);
        } catch (e) {
            console.log(e);
        }

        return result ? node.children.map(child => renderTree(child, context)).join('') : '';
    }

    if (node.type === 'root') {
        return node.children.map(child => renderTree(child, context)).join('');
    }

    if (node.type === 'text') {
        return node.value + '\n';
    }

    return '';
}

// -- Render Function --
export function renderMDX(mdx, context, resolveImports) {
    return new Promise(resolve => {
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

        if (frontMatterData) {
            context = {
                ...frontMatterData,
                ...context
            }
        }

        let loopCount = 0
        const maxLoopCount = 100

        const importRegex = /\{\{>(.*?)\}\}/gm
        while (importRegex.test(mdx)) {
            mdx = mdx.replace(importRegex, (match, path) => {
                const replaced = resolveImports(path.trim())
                return replaced || ""
            })

            loopCount++
            if (loopCount === maxLoopCount) {
                mdx = `# Import Chain to deep
                Do you have a circle import of multiple files importing each other?`
            }
        }

        const tree = parseIfBlocks(mdx);
        console.log(tree);
        mdx = renderTree(tree, context);

        mdx = flattenIndentedString(mdx)
        mdx = evalReplacer(mdx, context)
        mdx = gridReplacer(mdx, context, resolveImports) // Pass resolveImports here
        mdx = diceReplacer(mdx)
        mdx = inputReplacer(mdx)
        mdx = columnReplacer(mdx, context)
        mdx = tabReplacer(mdx)
        mdx = selectReplacer(mdx, context)
        mdx = popoverLinkReplacer(mdx, context, resolveImports)

        evaluate(mdx, {
            ...runtime,
            remarkPlugins: [remarkGfm]
        }).then(({ default: MDXContent }) => {
            resolve(
                <DataContext.Provider value={jsxData}>
                    {MDXContent({
                        components: {
                            Wrapper
                        }
                    })}
                </DataContext.Provider>
            )
        })
    })
}

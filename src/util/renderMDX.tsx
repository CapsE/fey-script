import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Input } from "../components/input";
import { Rollable } from "../components/Rollable.jsx";
import {TabView} from "../components/TabView.jsx";
import React, {ReactNode, useEffect, useState} from "react";
import {Await} from "../components/Await.tsx";
import remarkGfm from "remark-gfm";
import yaml from "yaml";
import {Select} from "../components/select.tsx";
import {Grid} from "../components/grid.tsx";

// -- Types --

type InputProps = {
    name: string;
    value: string;
    key: string;
    type?: string;
    [key: string]: any;
};

type RollableProps = {
    value: string;
};

type WrapperProps = {
    type: keyof typeof types;
    id: number;
};

type ReplacerArgs = {
    regex: RegExp;
    getReplacement: (match: RegExpExecArray, index: number) => string;
    onMatch?: (match: RegExpExecArray, index: number) => void;
};

// -- Context --

const DataContext = React.createContext<(InputProps | RollableProps)[]>([]);

// -- Utility Functions --

function replaceRange(str: string, x: number, y: number, replacement: string): string {
    return str.slice(0, x) + replacement + str.slice(y);
}

export function safeEval(code: string, context: Record<string, any>): any {
    context.$mod = (v) => Math.floor((v - 10) / 2) < 0 ? Math.floor((v - 10) / 2) : '+' + Math.floor((v - 10) / 2);
    const keys = Object.keys(context);
    const values = Object.values(context);
    return Function(...keys, `"use strict"; return (${code})`)(...values);
}

// -- Components Map --

const Columns: React.FC<WrapperProps> = ({ value, context }) => {
    return <div style={{columnCount: 2}}>
        <Await promise={renderMDX(value, context)} />
    </div>
};

const types = {
    Input,
    Rollable,
    Columns,
    TabView,
    Select,
    Grid
};

// -- JSX Data Storage --

const jsxData: (InputProps | RollableProps)[] = [];

// -- General Replacer Generator --

function makeReplacer({ regex, getReplacement, onMatch }: ReplacerArgs): (str: string) => string {
    return (str: string): string => {
        const matches: { match: RegExpExecArray; start: number; end: number; replacement: string }[] = [];
        let m: RegExpExecArray | null;
        let index = 0;

        while ((m = regex.exec(str)) !== null) {
            const start = m.index;
            const end = start + m[0].length;
            const replacement = getReplacement(m, index);
            if (onMatch) onMatch(m, index);
            matches.push({ match: m, start, end, replacement });
            index++;
        }

        // Replace in reverse to avoid shifting indexes
        for (let i = matches.length - 1; i >= 0; i--) {
            const { start, end, replacement } = matches[i];
            str = replaceRange(str, start, end, replacement);
        }

        return str;
    };
}

// -- Replacers --

const inputReplacer = makeReplacer({
    regex: /i\[(.*?)\]\W/g,
    getReplacement: (_match, _index) => `<Wrapper type="Input" id="${jsxData.length}" />`,
    onMatch: (match) => {
        const [name, data] = match[1].split("|");
        let obj: InputProps = { name };

        if (/\[\d+\/\d+/.test(data)) {
            obj.value = data.split('/')[0].slice(1);
            obj.max = data.split('/')[1];
            obj.type = "checkmarks";
        } else if (/\d+\/\d+/.test(data)) {
            obj.value = data.split('/')[0];
            obj.max = data.split('/')[1];
        } else if (data) {
            try {
                const parsed = JSON.parse(json);
                obj = { ...obj, ...parsed };
            } catch (e) {
                console.error(e);
            }
        }

        const start = match.index;
        const end = start + match[0].length;

        obj.key = `${start}-${end}`;
        obj.type = obj.type || "number";

        jsxData.push(obj);
    }
});

const diceReplacer = makeReplacer({
    regex: /((\d+)?d(\d+)(?:k[lh]?\d+)?([+\-*\/]\d+)?[+\-]*)+|([+\-]{1,2}\d+)/g,
    getReplacement: (match) => {
        jsxData.push({ value: match[0] });
        return `<Wrapper type="Rollable" id="${jsxData.length - 1}" />`;
    }
});

const columnReplacer = (str: string, context: Record<string, any>): string =>
    makeReplacer({
        regex:  /-\|-\n([\s\S]*?)\n-\|-/g,
        getReplacement: (match) => {
            jsxData.push({ value: match[1], context });
            return `<Wrapper type="Columns" id="${jsxData.length - 1}" />`;
        }
    })(str);

const gridReplacer = (str: string, context: Record<string, any>): string =>
    makeReplacer({
        regex:  /:::grid-(\d(-\d)*)?\n([\s\S]*?)\n:::/g,
        getReplacement: (match) => {
            jsxData.push({ cols: match[1], content: match[3], context });
            return `<Wrapper type="Grid" id="${jsxData.length - 1}" />`;
        }
    })(str);

const tabReplacer = (str: string): string =>
    makeReplacer({
        regex:  /(\|-- .+? ---[\s\S]*?\|---)/g,
        getReplacement: (match) => {
            const tabsCode = match[1].split(/(?:^|\n)\|-- (.+?) ---/);
            const tabs = [];
            for(let i = 1; i < tabsCode.length; i += 2) {
                tabs.push({
                    title: tabsCode[i],
                    content: tabsCode[i + 1].replace(/\n\|/g, '\n').replace(/\n---/g, '').trim(),
                });
            }
            jsxData.push({ tabs });

            return `<Wrapper type="TabView" id="${jsxData.length - 1}" />`;
        }
    })(str);

const selectReplacer = (str: string, context: Record<string, any>): string =>
    makeReplacer({
        regex: /s\[(\S+)\]\[(\n\S+)+\n\]/g,
        getReplacement: (match) => {
            console.log(match);
            const [name, json] = match[1].split(";");
            let obj: InputProps = { name };

            if (json) {
                try {
                    const parsed = JSON.parse(json);
                    obj = { ...obj, ...parsed };
                } catch (e) {
                    console.error(e);
                }
            }

            const options = match[0].split("\n");
            options.shift();
            options.pop();
            obj.options = options;
            jsxData.push(obj);
            return `<Wrapper type="Select" id="${jsxData.length - 1}" />`;
        }
    })(str);



const evalReplacer = (str: string, context: Record<string, any>): string =>
    makeReplacer({
        regex: /\{\{(.*?)\}\}/g,
        getReplacement: (match) => {
            try {
                const value = safeEval(match[1], context);
                return value ?? "X";
            } catch (error) {
                console.warn("Error evaluating expression:", error);
                return "X";
            }
        }
    })(str);

// -- Wrapper Component --

const Wrapper: React.FC<WrapperProps> = ({ type, id }) => {
    const Component = types[type];
    return <Component {...jsxData[id]} />;
};

function flattenIndentedString(str) {
    return str
        .split('\n')
        .map((line) => line.trim()) // remove leading/trailing spaces from each line
        .filter((line) => line.length > 0) // remove empty lines
        .join('\n'); // join into a single line with spaces
}

// -- Render Function --

export function renderMDX(mdx: string, context: Record<string, any>): Promise<ReactNode> {
    return new Promise((resolve) => {
        const regex = /^---\n([\s\S]*?)\n---/g;
        const match = regex.exec(mdx);
        let frontMatterData = {};

        // Get content after match
        if (match) {
            try {
                frontMatterData = yaml.parse(match[1]);
            } catch (err) {
                console.log(err);
            }

            mdx = mdx.replace(match[0], '');
        }

        if(frontMatterData) {
            context = {
                ...frontMatterData,
                ...context,
            }
        }

        const ifRegex = /^:::if ([^\n]+)\n([\s\S]+?)\n:::/gm;
        mdx = mdx.replace(ifRegex, (match, varName, content) => {
            const value = safeEval(varName, context);

            return value ? content : '';
        });

        mdx = flattenIndentedString(mdx);
        mdx = evalReplacer(mdx, context);
        mdx = gridReplacer(mdx, context);
        mdx = diceReplacer(mdx);
        mdx = inputReplacer(mdx);
        mdx = columnReplacer(mdx, context);
        mdx = tabReplacer(mdx);
        mdx = selectReplacer(mdx, context);

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
            );
        });
    });
}

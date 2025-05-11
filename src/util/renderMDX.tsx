import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Input } from "../components/input";
import { Rollable } from "../components/Rollable.jsx";
import React, {ReactNode, useEffect, useState} from "react";
import {Await} from "../components/Await.tsx";

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
    Columns
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
    regex: /i\[(.*?)\]/g,
    getReplacement: (_match, _index) => `<Wrapper type="Input" id="${jsxData.length}" />`,
    onMatch: (match) => {
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

        const start = match.index;
        const end = start + match[0].length;

        obj.value = `${name}_${start}-${end}`;
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

// -- Render Function --

export function renderMDX(mdx: string, context: Record<string, any>): Promise<ReactNode> {
    return new Promise((resolve) => {
        mdx = evalReplacer(mdx, context);
        mdx = diceReplacer(mdx);
        mdx = inputReplacer(mdx);
        mdx = columnReplacer(mdx, context);

        evaluate(mdx, {
            ...runtime
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

import {evaluate} from "@mdx-js/mdx";
import * as runtime from 'react/jsx-runtime';
import {Input} from '../components/input';
import {Rollable} from '../components/Rollable.jsx';
import React from "react";

const DataContext = React.createContext([]);

function replaceRange(str, x, y, replacement) {
    return str.slice(0, x) + replacement + str.slice(y);
}

/**
 * Evaluate the given code with the given context
 * @param {string} code
 * @param {Object} context
 * @return {*}
 */
export function safeEval(code, context) {
    const keys = Object.keys(context);
    const values = Object.values(context);
    return Function(...keys, `"use strict"; return (${code})`)(...values);
}

const types = {
    Input,
    Rollable
}

const jsxData = [];

function makeReplacer({
                          regex,
                          getReplacement,
                          onMatch
                      }: {
    regex: RegExp,
    getReplacement: (match: RegExpExecArray, index: number) => string,
    onMatch?: (match: RegExpExecArray, index: number) => void
}) {
    return (str: string) => {
        let match;
        let index = 0;

        while ((match = regex.exec(str)) !== null) {
            const start = match.index;
            const matched = match[0];
            const end = start + matched.length;

            const replacement = getReplacement(match, index);

            if (onMatch) onMatch(match, index);

            str = replaceRange(str, start, end, replacement);
            index++;
        }

        return str;
    };
}

// Specific replacers using makeReplacer
const inputReplacer = makeReplacer({
    regex: /i\[(.*?)\]/g,
    getReplacement: (_match, index) => `<Wrapper type="Input" id="${jsxData.length}" />`,
    onMatch: (match) => {
        const [name, json] = match[1].split(';');
        let obj: any = { name };

        if (json) {
            try {
                obj = JSON.parse(json);
            } catch (e) {
                console.error(e);
            }
        }

        obj.value = `${name}_${match.index}-${match.index + match[0].length}`;
        obj.key = `${match.index}-${match.index + match[0].length}`;
        obj.type = obj.type || 'number';

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

const evalReplacer = (str: string, context) =>
    makeReplacer({
        regex: /\{\{(.*?)\}\}/g,
        getReplacement: (match) => {
            try {
                const value = safeEval(match[1], context);
                return value ?? 'X';
            } catch (error) {
                console.warn('Error evaluating expression:', error);
                return 'X';
            }
        }
    })(str);

const Wrapper = ({type, id}) => {
    return React.createElement(types[type], jsxData[id]);
}

export function renderMDX(mdx, context) {
    return new Promise((resolve) => {
        // Input
        mdx = evalReplacer(mdx, context);
        mdx = diceReplacer(mdx);
        mdx = inputReplacer(mdx);

        evaluate(mdx, {
            ...runtime,
        }).then(({default: MDXContent}) => {
            resolve(<DataContext.Provider value={jsxData}>
                {MDXContent({
                    components: {
                        Wrapper
                    }
                })}
            </DataContext.Provider>);
        });
    })
}

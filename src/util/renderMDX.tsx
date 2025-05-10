import {evaluate} from "@mdx-js/mdx";
import * as runtime from 'react/jsx-runtime';
import {Input} from '../components/input';
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
}

const jsxData = [];

const inputReplacer = (str: string) => {
    const regex = /i\[(.*?)\]/g;
    let match = regex.exec(str);

    while (match) {
        const start = match.index;
        const matched = match[0];
        const end = start + matched.length;
        const captured = match[1];

        const [name, json] = captured.split(';');
        let obj = {
            name,
        };
        if (json) {
            try {
                obj = JSON.parse(json);
            } catch (e) {
                console.error(e);
            }
        }
        obj.id = `${name}_${start}-${end}`;
        obj.key = `${start}-${end}`;
        obj.type = obj.type || 'number';

        str = replaceRange(str, start, end, `<Wrapper type="Input" id="${jsxData.length}" />`);
        jsxData.push(obj);

        match = regex.exec(str);
    }

    return str;
};

const evalReplacer = (str: string, context) => {
    const regex =  /\{\{(.*?)\}\}/g;
    let match = regex.exec(str);

    while (match) {
        const start = match.index;
        const matched = match[0];
        const end = start + matched.length;
        const captured = match[1];

        let value = 'X';
        try {
            value = safeEval(captured, context);
            if (!value && value !== 0) {
                value = 'X';
            }
        } catch (error) {
            console.warn('Error evaluating expression:', error);
        }

        // str = replaceRange(str, start, end, `<Wrapper type="Input" id="${jsxData.length}" />`);


        str = replaceRange(str, start, end, value);


        match = regex.exec(str);
    }

    return str;
};

const Wrapper = ({type, id}) => {
    return React.createElement(types[type], jsxData[id]);
}

export function renderMDX(mdx, context) {
    return new Promise((resolve) => {
        // Input
        mdx = evalReplacer(mdx, context);
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

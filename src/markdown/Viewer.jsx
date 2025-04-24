import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import remarkGfm from 'remark-gfm';
import {Cols} from './components/Cols';
import {Grid, Grid3, Grid4} from './components/Grid';
import ReactMarkdown from 'react-markdown';
import {observer} from 'mobx-react';
import {Box} from './components/Box';
import PropTypes from 'prop-types';
import {remarkDicePlugin} from '../remark-plugins/dice-rolls.jsx';
import {remarkInputPlugin} from '../remark-plugins/input.jsx';
import {Row} from './components/Row.jsx';
import {Inventory} from './components/Inventory.jsx';
import {scopeMathPlugin} from '../remark-plugins/math.jsx';
import {ErrorBoundary} from '../ErrorBoundary.jsx';
import remarkLinkTarget from '../remark-plugins/link.jsx';
import {Shareable} from '../Shareable.jsx';
import yaml from 'yaml';
import {Context} from "../Context.js";
import {useEffect, useMemo, useState} from "react";
import {FocusManager} from "../FocusManager.js";

/**
 * Evaluate the given code with the given context
 * @param {string} code
 * @param {Object} context
 * @return {*}
 */
export function safeEval(code, context) {
    try {
        const keys = Object.keys(context);
        const values = Object.values(context);
        return Function(...keys, `"use strict"; return (${code})`)(...values);
    } catch (error) {
        if (error instanceof ReferenceError || error instanceof SyntaxError) {
            return undefined;
        }
        throw error; // Re-throw other unexpected errors
    }
}

export const Viewer = observer(({className, content, data, onChange, onClick}) => {
    const eventTarget = useMemo(() => new FocusManager(), []);

    useEffect(() => {
        if(eventTarget.focusedElement) {
            document.getElementById(eventTarget.focusedElement).focus();
        }
    });

    const regex = /^---\n([\s\S]*?)\n---/g;
    const match = regex.exec(content);
    let frontMatterData = {};

    // Get content after match
    if (match) {
        try {
            frontMatterData = yaml.parse(match[1]);
        } catch (err) {
            console.log(err);
        }

        content = content.replace(match[0], '');
    }

    if(frontMatterData) {
        data = {
            ...frontMatterData,
            ...data,
        }
    }

    const ifRegex = /^:::if ([^\n]+)\n([\s\S]+?)\n:::/gm;
    content = content.replace(ifRegex, (match, varName, content) => {
        const value = safeEval(varName, data);

        return value ? content : '';
    });
    const SourceExtract = ({node, children}) => {
        const source = content.substring(node.position.start.offset, node.position.end.offset);
        return <Shareable toShare={source}>
            {children}
        </Shareable>;
    };

    const plugins = [
        remarkInputPlugin,
        remarkDicePlugin,
        scopeMathPlugin(data),
        remarkDirective,
        remarkDirectiveRehype,
        remarkGfm,
        remarkLinkTarget,
    ];

    return <ErrorBoundary
            key={Date.now()}
            FallbackComponent={() => <div className="center">Invalid Stats</div>}
            onError={(e) => {
                console.log(e);
            }}
        >
        <Context.Provider value={{
            data,
            onChange,
            eventTarget
        }}>
            <div className={className} onClick={onClick}>
                <ReactMarkdown
                    remarkPlugins={plugins}
                    components={{
                        'row': Row,
                        'cols': Cols,
                        'image': Image,
                        'flex': Grid,
                        'grid': Grid,
                        'grid2': Grid,
                        'grid3': Grid3,
                        'grid4': Grid4,
                        'box': Box,
                        'inventory': Inventory,
                        'shareable': SourceExtract,
                    }}
                >{content}</ReactMarkdown>
            </div>
        </Context.Provider>
    </ErrorBoundary>;
});

Viewer.propTypes = {
    content: PropTypes.string,
    className: PropTypes.string,
    main: PropTypes.bool,
    data: PropTypes.object,
};

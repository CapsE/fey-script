import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import remarkGfm from 'remark-gfm';
import {Cols} from './components/Cols';
import {Grid, Grid3, Grid4} from './components/Grid';
import ReactMarkdown from 'react-markdown';
import {Box} from './components/Box';
import PropTypes from 'prop-types';
import {remarkDicePlugin} from '../remark-plugins/dice-rolls.jsx';
import {remarkInputPlugin} from '../remark-plugins/input.jsx';
import {Row} from './components/Row.jsx';
import {Inventory} from './components/Inventory.jsx';
import {scopeMathPlugin} from '../remark-plugins/math.jsx';
import {ErrorBoundary} from '../ErrorBoundary.jsx';
import remarkLinkTarget from '../remark-plugins/link.jsx';
import {Shareable} from '../components/Shareable.jsx';
import yaml from 'yaml';
import {Context} from "../Context.js";
import {useEffect, useMemo} from "react";
import {FocusManager} from "../FocusManager.js";
import styles from './Viewer.module.css';
import {rollDice} from "../Dice.js";
import remarkTabview from "../remark-plugins/tab-view.jsx";
import MDXRenderer from "../MDXRenderer.js";

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

export const Viewer = ({className, content, data, onChange, onClick, onDiceRoll}) => {
    const eventTarget = useMemo(() => new FocusManager(), []);

    useEffect(() => {
        if(eventTarget.focusedElement) {
            document.getElementById(eventTarget.focusedElement).focus();
        }
    });

    const diceRollHandler = (notation) => {
        onDiceRoll && onDiceRoll(rollDice(notation));
    }

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
            eventTarget,
            onDiceRoll: diceRollHandler
        }}>
            <div className={`${className} ${styles.viewer}`} onClick={onClick}>
                <MDXRenderer code={content} context={data} />
            </div>
        </Context.Provider>
    </ErrorBoundary>;
};

Viewer.propTypes = {
    content: PropTypes.string,
    className: PropTypes.string,
    data: PropTypes.object,
    onChange: PropTypes.func,
    onDiceRoll: PropTypes.func,
};

import {useEffect, useRef, useState} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {DebouncedViewer} from '../components/markdown/DebouncedViewer.jsx';
import {useCtrlKeyPress, useKeyPress} from '../hooks/useKeys.js';

const MiniEditor = ({
                        value,
                        children,
                        code,
                        onChange,
                        onStartEditing,
                        editing,
                        onBlur,
                        onArrowKey,
}) => {
    const ref = useRef();
    // const [editing, setEditing] = useState(false);

    useEffect(() => {
        const textarea = ref.current;
        if (editing) {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        }
    }, [editing]);

    useCtrlKeyPress('ArrowUp', () => {
        if (!editing) return;
        onChange(ref.current.value);
        onArrowKey(-1);
    }, ref.current);

    useCtrlKeyPress('ArrowDown', () => {
        if (!editing) return;
        onChange(ref.current.value);
        onArrowKey(1);
    }, ref.current);

    // useKeyPress('Enter', () => {
    //     if (!editing) return;
    //     onBlur();
    // }, ref.current, true);

    if (editing) {
        return <TextareaAutosize
            ref={ref}
            onBlur={(e) => {
                onChange(e.target.value);
                onBlur();
            }}
            defaultValue={code.trim()}/>;
    } else {
        return <DebouncedViewer content={code} onClick={() => onStartEditing()} />;
    }
};

/**
 * Replaces lines in string found by using position with replacement
 * @param {string} string
 * @param {object} position
 * @param {string} replacement
 * @return {string}
 */
function replaceTextByPosition(string, position, replacement) {
    const lines = string.split('\n'); // Split the string into lines

    // Extract the start and end positions
    const {start, end} = position;

    // Replace all lines from start to end with the replacement
    const before = lines.slice(0, start.line - 1); // Lines before the start
    const after = lines.slice(end.line); // Lines after the end

    // Combine the parts with the replacement
    return [...before, replacement, ...after].join('\n');
}

/**
 * Gets lines from string using position
 * @param {string} string
 * @param {object} position
 * @return {string}
 */
function getLinesByPosition(string, position) {
    const lines = string.split('\n');
    const {start, end} = position;
    let out = '';
    for (let i = start.line - 1; i <= end.line - 1; i++) {
        out += lines[i] + '\n';
    }
    return out;
}

/**
 * Returns a RemarkEditorPlugin with some context
 * @param {object} context
 * @return {function(): function(*): void}
 */
export function scopedEditorPlugin(context) {

    /**
     * Remark Plugin
     * @return {(function(*): void)|*}
     */
    function remarkEditorPlugin() {
        return (tree) => {
            const one = (node, index, parent) => {
                const newNodes = [];
                if (!context.lastIndex) {
                    context.lastIndex = index;
                } else if (context.lastIndex < index) {
                    context.lastIndex = index;
                }
                newNodes.push({
                    type: 'editor',
                    value: <MiniEditor
                        code={getLinesByPosition(context.value, node.position)}
                        value={node.value}
                        editing={context.editingNode === index}
                        onStartEditing={() => context.onStartEditing(index)}
                        onBlur={() => context.onStartEditing()}
                        onChange={(value) => {
                            const result = replaceTextByPosition(context.value, node.position, value);
                            context.onChange(result);
                        }}
                        onArrowKey={(direction) => {
                            console.log("Index", index);
                            console.log("direction", direction);
                            context.onStartEditing(index + direction);
                        }}
                    >{node.children}</MiniEditor>,
                });

                // replace the original node with the new nodes
                parent.children.splice(index, 1, ...newNodes);
            };

            const all = (parent) => {
                let index = -1;
                while (++index < parent.children.length) {
                    const child = parent.children[index];
                    one(child, index, parent);
                }
            };

            all(tree);
        };
    }

    return remarkEditorPlugin;
}

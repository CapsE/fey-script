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

/**
 * Custom plugin to replace text with links
 * @return {(function(*): void)|*}
 */
export function scopeMathPlugin(context) {
    function remarkMathPlugin() {
        return (tree) => {
            const one = (node, index, parent) => {
                const regex = /\{\{(.*?)\}\}/g;

                if (node.type === 'text') {
                    const newText = node.value.replace(regex, (matched, captured) => {
                        let value = 'X';
                        try {
                            value = safeEval(captured, context);
                            if (!value && value !== 0) {
                                value = 'X';
                            }
                        } catch (error) {
                            console.warn('Error evaluating expression:', error);
                        }
                        return value;
                    });

                    // replace the original node with the new node
                    parent.children.splice(index, 1, {type: 'text', value: newText});
                } else if (node.children) {
                    // recursively check the children of this node
                    return all(node);
                }
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

    return remarkMathPlugin;
}


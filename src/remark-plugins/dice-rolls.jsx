import Rollable from '../Rollable';

/**
 * Custom plugin to replace text with links
 * @return {(function(*): void)|*}
 */
export function remarkDicePlugin() {
    return (tree) => {
        const one = (node, index, parent) => {
            const regex = /((\d+)?d(\d+)(?:k[lh]?\d+)?([+\-*\/]\d+)?[+\-]*)+|([+\-]{1,2}\d+)/g;
            let match = regex.exec(node.value);
            if (node.type === 'text' && match) {
                const newNodes = [];
                let remaining = node.value;

                while (match) {
                    const start = match.index;
                    const matched = match[0];
                    const end = start + matched.length;

                    // add the text before the match, if any
                    if (start > 0) {
                        newNodes.push({type: 'text', position: node.position, value: remaining.slice(0, start)});
                    }

                    // replace the matched text with a link
                    newNodes.push({
                        type: 'rollable',
                        value: <Rollable value={matched}/>,
                        position: node.position,
                    });

                    remaining = remaining.slice(end);
                    match = regex.exec(remaining);
                }

                // add the text after the last match, if any
                if (remaining.length > 0) {
                    newNodes.push({type: 'text', value: remaining, position: node.position});
                }

                // replace the original node with the new nodes
                parent.children.splice(index, 1, ...newNodes);
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

// parse the markdown and print the result
// unified()
//     .use(markdown)
//     .use(remarkDicePlugin)
//     .process('_Hello, +5 world! 2d4+2_', function(err, file) {
//         if (err) throw err;
//         console.log(String(file));
//     });

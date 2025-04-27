import { visit } from 'unist-util-visit';
import {TabView} from "../markdown/components/TabView.jsx";

const paragraphIsTabView = (node) =>  node.type === 'paragraph' &&
    node.children &&
    node.children[0].type === 'text' &&
    typeof node.children[0].value === 'string' &&
    node.children[0].value.match(/^\|-- (.+?) ---/)

export default function remarkTabview() {
    return (tree) => {
        visit(tree, 'root', (node) => {
            const newChildren = [];

            for (const child of node.children) { // Force end with thematic break
                const tabs = [];
                if (paragraphIsTabView(child)) {
                    child.children.forEach((childNode) => {
                        console.log(childNode);
                        if (childNode.type === 'text') {
                            const tabsCode = childNode.value.split(/(?:^|\n)\|-- (.+?) ---/);
                            console.log(tabsCode);
                            for(let i = 1; i < tabsCode.length; i += 2) {
                                tabs.push({
                                    title: tabsCode[i],
                                    content: tabsCode[i + 1].replace(/\n\|/g, '\n').replace(/\n---/g, '').trim(),
                                });
                            }
                        }
                    });
                    console.log(tabs);
                    newChildren.push({
                        type: 'TabView',
                        name: 'TabView',
                        value: <TabView key={`tabView-${node.position.start}-${node.position.end}`} tabs={tabs} />,
                    })
                } else {
                    newChildren.push(child);
                }
            }
            node.children = newChildren;
        });
    };
}

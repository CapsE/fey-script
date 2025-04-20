import {visit} from 'unist-util-visit';

export default function remarkLinkTarget() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties.target = '_blank';
    });
  };
}

import {toNiceName} from '../util/toNiceName.js';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {useContext, useEffect, useState} from 'react';
import {Context} from "../Context.js";


const Input = observer(({name, label, type, value, id, ...other}) => {
    const {data, onChange, eventTarget} = useContext(Context);
    let innerValueInitial = '';

    if (data[name]) {
        innerValueInitial = data[name];
    } else if (value) {
        innerValueInitial = value;
    }
    const [innerValue, setInnerValue] = useState(innerValueInitial);

    useEffect(() => {
        data[name] = data[name] || innerValue;
    }, []);

    const changeHandler = (e) => {
        if (type === 'number') {
            const v = parseInt(e.target.value);
            if (isNaN(v)) {
                setInnerValue('');
            } else {
                setInnerValue(v);
            }
        } else {
            setInnerValue(e.target.value);
        }
    };

    const blurHandler = (e) => {
        eventTarget.focusedElement = null;
        setTimeout(() => {
            onChange({
                ...data,
                [name]: innerValue
            });
        }, 0);
    }

    return <div>
        <label>{label ? label : toNiceName(name)}</label>
        <input
            id={name + '_' + id}
            onChange={changeHandler}
            onBlur={blurHandler}
            onFocus={() => eventTarget.focusedElement = name + '_' + id}
            type={type ? type : 'text'}
            value={innerValue}
            {...other}
        />
    </div>;
});

Input.propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
};

/**
 * Custom plugin to replace text with links
 * @return {(function(*): void)|*}
 */
export function remarkInputPlugin(context) {
    return (tree) => {
        const one = (node, index, parent) => {
            const regex = /i\[(.*?)\]/g;
            let match = regex.exec(node.value);
            if (node.type === 'text' && match) {
                const newNodes = [];
                let remaining = node.value;
                while (match) {
                    const start = match.index;
                    const matched = match[0];
                    const end = start + matched.length;
                    const captured = match[1];

                    // add the text before the match, if any
                    if (start > 0) {
                        newNodes.push({type: 'text', value: remaining.slice(0, start)});
                    }

                    const [name, json] = captured.split(';');
                    let obj = {};
                    if (json) {
                        try {
                            obj = JSON.parse(json);
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    const {value, label, type, ...other} = obj;

                    // replace the matched text with a link
                    newNodes.push({
                        type: 'input',
                        value: <Input
                            key={`${name}_${start}-${end}`}
                            id={`${start}-${end}`}
                            name={name}
                            type={type || 'number'}
                            label={label}
                            value={value || ''}
                            {...other}
                        />,
                    });

                    remaining = remaining.slice(end);
                    match = regex.exec(remaining);
                }

                // add the text after the last match, if any
                if (remaining.length > 0) {
                    newNodes.push({type: 'text', value: remaining});
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

import './App.css';
import './Forms.css';
import styles from './Dungeon-Script.module.css';
import {useRef, useState} from 'react';
import {Viewer} from './markdown/Viewer.jsx';
import SplitPane, {Pane} from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import 'react-tabs/style/react-tabs.css';

const Editor = ({value, onChange}) => {
    const ref = useRef();

    return <textarea
        className={styles.editor}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
    />;
};

export const FileEditor = ({initialValue, onChange}) => {
    const [sizes, setSizes] = useState(['50%', '50%']);
    const [code, setCode] = useState(initialValue || '');

    return  <SplitPane
        split='vertical'
        sizes={sizes}
        onChange={setSizes}
    >
        <Pane minSize={200}>
            <Editor value={code} onChange={setCode} />
        </Pane>
        <Pane minSize={200}>
            <div className={styles.preview}>
                <Viewer
                    content={code}
                    data={{}}
                    onChange={(v) => setCode(v)}
                />
            </div>

        </Pane>
    </SplitPane>
}

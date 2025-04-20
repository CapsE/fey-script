import CodeEditor from '@uiw/react-textarea-code-editor';
import {useDebounce} from '../../hooks/useDebounce';
import {markdown} from './Editor';
import {observer} from 'mobx-react';
import {NpcPopup} from '../popups/NpcPopup';
import {useState} from 'react';
import {insertAtCursor} from '../../util/insertAtCursor';
import styles from './DebouncedEditor.module.css';
import {StoryStorage, storyStore} from './components/StoryStore';

export const DebouncedEditor = observer(({popupLayer}) => {
    const [context, setContext] = useState(null);

    const [selection, setSelection] = useState({
        start: 0,
        end: 0,
    });
    markdown.debounced = useDebounce(
        () => storyStore.stories[markdown.active].content,
        [storyStore.stories[markdown.active].content],
        500,
    );

    const getContext = (e) => {
        const start = e.target.selectionStart;

        const result = [...storyStore.stories[markdown.active].content.matchAll(/:+(\S+)[\[{](\S+)[\]}]/g)];
        if (!result.length) return;

        for (let i = 0, l = result.length; i < l; i++) {
            const res = result[i];
            const matchStart = res.index;
            const matchEnd = res.index + res[0].length -1;
            if (start >= matchStart && start <= matchEnd) {
                let v = res[2];
                if (v.indexOf('id=') !== -1) {
                    v = v.split('id=')[1].split(/[ ;]/)[0];
                }
                setContext({
                    key: res[1],
                    value: v,
                });
                setSelection({
                    start: matchStart,
                    end: matchEnd + 1,
                });
                return;
            } else {
                setContext(null);
            }
        }
    };

    const insertText = (value) => {
        storyStore.stories[markdown.active].content = insertAtCursor({
            ...selection,
            value,
            string: storyStore.stories[markdown.active].content,
        });
    };

    const imageSelectHandler = (key) => {
       insertText(`:image[${key}]`);
    };

    const storySelectHandler = (id, name) => {
        insertText(`:story[${name}]{id=${id}}`);
    };

    const newNpcHandler = (npc, id) => {
        insertText(`::npc{id=${id}}`);
    };

    const blurHandler = (e) => {
        if (context) return;

        setSelection({
            start: e.target.selectionStart,
            end: e.target.selectionEnd,
        });
    };

    return <>
        <CodeEditor
            onBlur={blurHandler}
            value={storyStore.stories[markdown.active].content}
            language="markdown"
            placeholder="Write here..."
            onChange={(e) => storyStore.stories[markdown.active].content = e.target.value}
            onClick={getContext}
            onKeyUp={getContext}
            padding={15}
            style={{
                fontSize: 12,
                backgroundColor: '#f5f5f5',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
        />
        <div className={styles.toolbar}>
            {!context && <>
                <ImageStorage
                    onSelect={imageSelectHandler}
                    popupOverlay={popupLayer}
                />
                <NpcPopup onSelect={newNpcHandler} popupLayer={popupLayer} />
                <StoryStorage
                    onSelect={storySelectHandler}
                    popupOverlay={popupLayer}
                    label="Story-Link"
                />
            </>}
            {context && context.key === 'npc' && <NpcPopup
                onSelect={newNpcHandler}
                popupLayer={popupLayer}
                initialEditing={context.value}
                label="Edit NPC"
            />}
            {context && context.key === 'image' && <ImageStorage
                onSelect={imageSelectHandler}
                popupLayer={popupLayer}
                label="Edit Image"
            />}
            {context && context.key === 'story-link' && <StoryStorage
                onSelect={storySelectHandler}
                popupLayer={popupLayer}
                label="Change Story"
            />}
        </div>
    </>;
});

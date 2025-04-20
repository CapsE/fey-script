import {useContext, useRef, useState} from 'react';
import styles from './Editor.module.css';
import {ErrorBoundary} from '../ErrorBoundary';
import {useCtrlKeyPress, useKeyHandlers} from '../../hooks/useKeys';
import {loadFile, saveFile} from '../../util/file';
import toast, {Toaster} from 'react-hot-toast';
import {PopupContext} from '../../context/PopupContext';
import {observable} from 'mobx';
import {DebouncedViewer} from './DebouncedViewer';
import {DebouncedEditor} from './DebouncedEditor';
import {npcStore} from '../popups/NpcPopup';
import {StoryStorage, storyStore} from './components/StoryStore';
import {Button} from '../Button';
import {observer} from 'mobx-react';
import classNames from 'classnames';
import {OutPortal} from '../portal/Portal';

export const markdown = observable({
    current: '',
    debounced: '',
    tabs: [0],
    active: 0,
});

export const MarkdownEditor = observer(() => {
    const popup = useContext(PopupContext);
    const [layout, setLayout] = useState('edit');
    const [fileHandle, setFileHandle] = useState();


    useKeyHandlers(popup);
    const ref = useRef();

    const saveHandler = async (e) => {
        if (!popup.document.hasFocus()) return;
        e.preventDefault();
        const fh = await saveFile(JSON.stringify({
            imageStore,
            npcStore,
            storyStore,
        }), fileHandle, popup);
        setFileHandle(fh);
        toast.success('Story saved successfully');
    };

    const openHandler = async (e) => {
        if (!popup.document.hasFocus()) return;
        e.preventDefault();

        const data = await loadFile(popup);
        setFileHandle(data.fileHandle);
        const json = JSON.parse(data.content);

        imageStore.images = json.imageStore?.images || {};
        npcStore.npcs = json.npcStore?.npcs || [];
        storyStore.stories = json.storyStore?.stories || [];

        // Legacy support
        if (json.markdown) {
            storyStore.stories.unshift(
                {title: 'Untitled', content: json.markdown},
            );
        }

        tabHandler(0);
    };

    const tabHandler = (i) => {
        markdown.active = i;
        markdown.debounced = storyStore.stories[markdown.active].content;
    };

    const subStorySelectHandler = (i) => {
        markdown.active = i;
        markdown.debounced = storyStore.stories[markdown.active].content;
        if (markdown.tabs.indexOf(i) !== -1) return;
        markdown.tabs = [...markdown.tabs, markdown.active];
    };

    const layoutHandler = () => {
        setLayout(layout === 'edit' ? 'view' : 'edit');
    };

    useCtrlKeyPress('s', saveHandler, popup);

    useCtrlKeyPress('o', openHandler, popup);

    return <>
        <nav className={`${styles.navigation} bg-dark-big`}>
            <div className={styles.mainNav}>
                <input
                    className={styles.input}
                    placeholder="name"
                    value={storyStore.stories[markdown.active].name}
                    onChange={(e) => storyStore.stories[markdown.active].name = e.target.value}
                />
                <Button title="Save (Ctrl + S)" onClick={saveHandler}>Save</Button>
                <Button title="Open (Ctrl + O)" onClick={openHandler}>Open</Button>
                <StoryStorage label="Open Sub-Story" onSelect={subStorySelectHandler}/>
                <Button title="Switch Layout" onClick={layoutHandler}>
                    {layout === 'edit' ? 'View' : 'Edit'}
                </Button>
            </div>

            <div className={styles.tabs}>
                {markdown.tabs.map(( i) => <Button
                    key={i}
                    className={`${styles.tab} ${markdown.active === i ? styles.active : ''}`}
                    onClick={() => tabHandler(i)}
                >
                    {storyStore.stories[i]?.name || 'Unnamed'}
                </Button>)}
            </div>
        </nav>
        <Toaster/>
        <div className={classNames({
            [styles.wrapper]: true,
            [styles.wrapperView]: layout !== 'edit',
        })}>

            {layout === 'edit' && <div className={styles.editor}>
                <DebouncedEditor popupLayer={ref.current} />
            </div>}

            <div className={styles.preview}>
                <ErrorBoundary
                    key={markdown.current.length}
                >
                    <DebouncedViewer main={true} />
                </ErrorBoundary>
            </div>
            <OutPortal name="storyPopupLayer" />
        </div>
    </>;
});

import PropTypes from 'prop-types';
import {usePopup} from '../../../hooks/usePopup';
import {Button} from '../../Button';
import {Popup} from '../../Popup';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import styles from './StoryStore.module.css';
import {markdown} from '../Editor';

export const storyStore = observable({
    stories: [{
        name: 'Unnamed',
        content: '',
    }],
});


export const StoryStorage = observer(({children, onSelect, popupOverlay, label='Stories'}) => {
    const {isOpen, open, close} = usePopup();

    const handleSelect = (story) => {
        onSelect(story, storyStore.stories[story].name);
        close();
    };

    return <>
        {children ? <div onClick={open}>
            {children}
        </div>: <Button onClick={open}>{label}</Button>}
        <Popup title="Stories" open={isOpen} onClose={close} target="storyPopupLayer">
            <div className="popup">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                    {storyStore.stories.map((story, i) => {
                        return <tr className={styles.story} key={i} onClick={()=> handleSelect(i)}>
                            <td>{i}</td>
                            <td>{story.name}</td>
                        </tr>;
                    })}
                    </tbody>
                </table>
                <Button onClick={() => {
                    storyStore.stories.push({name: 'Unnamed', text: ''});
                    onSelect(storyStore.stories.length - 1);
                    close();
                }}>+ Create new</Button>
            </div>
        </Popup>
    </>;
});

StoryStorage.propTypes = {
    onSelect: PropTypes.func,
    onEdit: PropTypes.func,
    popupOverlay: PropTypes.any,
    children: PropTypes.node,
    label: PropTypes.string,
};

export const StoryLink = ({id, children}) => {
    const clickHandler = (e) => {
        e.preventDefault();
        if (markdown.tabs.indexOf(id) === -1) {
            markdown.tabs.push(id);
        }
        markdown.active = id;
        markdown.debounced = storyStore.stories[id].content;
    };

    return <a href="#" onClick={clickHandler}>
        {children}
    </a>;
};

StoryLink.propTypes = {
    id: PropTypes.number,
    children: PropTypes.string,
};

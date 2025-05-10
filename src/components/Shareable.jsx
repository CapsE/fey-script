import styles from '../Shareable.module.css';
import ChatIcon from '../icons/talk.svg';
import {useRef} from 'react';

export const Shareable = ({children, toShare}) => {
    const ref = useRef();

    // const share = () => {
    //     let event;
    //     if (toShare) {
    //         event = new CustomEvent('log', {detail: {
    //                 title: `${network.playerName}`,
    //                 type: 'TextEntry',
    //                 text: toShare,
    //             }});
    //     } else {
    //         event = new CustomEvent('log', {detail: {
    //             title: `${network.playerName}`,
    //             type: 'HTMLEntry',
    //             html: ref.current.innerHTML,
    //         }});
    //     }
    //     window.dispatchEvent(event);
    // };

    return <div className={styles.wrapper}>
        <ChatIcon className={styles.icon} title="Share in chat" />
        <div ref={ref}>
            {children}
        </div>
    </div>;
};

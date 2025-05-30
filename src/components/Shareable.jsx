import styles from './Shareable.module.css';
import ChatIcon from '../icons/talk.svg';
import {useRef} from 'react';

export const Shareable = ({children, toShare}) => {
    const ref = useRef();

    return <div className={styles.wrapper}>
        <ChatIcon className={styles.icon} title="Share in chat" />
        <div ref={ref}>
            {children}
        </div>
    </div>;
};

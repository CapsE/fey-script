import { FC } from 'react';

export interface ViewerProps {
    content: string;
    className?: string;
    data: object;
    onClick?: () => void;
    onChange?: (value: object) => void;

}

export const Viewer: FC<ViewerProps>;

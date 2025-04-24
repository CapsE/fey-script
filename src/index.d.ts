import { FC } from 'react';
import {ObservableSet} from "mobx";

export interface ViewerProps {
    content: string;
    className?: string;
    data: object;
    onClick?: () => void;
    onChange?: (value: object) => void;

}

export const Viewer: FC<ViewerProps>;
export declare function getObservable(): ObservableSet;

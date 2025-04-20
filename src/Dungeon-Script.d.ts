import { FC } from 'react';

export interface FileEditorProps {
    initialValue?: string;
    onChange?: (value: object) => void;

}

export const FileEditor: FC<FileEditorProps>;

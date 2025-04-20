import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FileEditor } from './Dungeon-Script.jsx'

const rootElement: HTMLElement|null = document.getElementById('root');

if(rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <FileEditor />
        </StrictMode>,
    )
}


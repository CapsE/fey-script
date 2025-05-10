import {StrictMode, useState} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Viewer} from "./index";

const rootElement: HTMLElement|null = document.getElementById('root');

const code = `# Hello World 
i[hp]
{{hp + 5}}
i[mp]
`;

const Main = ({code}) => {
    const [data, setData] = useState({});

    return <Viewer
        content={code}
        data={data}
        onChange={(d) => setData(d)}
    />;
};

if(rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <Main code={code} />
        </StrictMode>,
    )
}


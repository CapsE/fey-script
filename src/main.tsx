import {StrictMode, useState} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Viewer} from "./index";

const rootElement: HTMLElement|null = document.getElementById('root');

const code = `# Hello World 
Roll +5 or maybe 2d6+4

i[modifier]

You might want to roll +{{modifier}}
`;

const Main = ({code}) => {
    const [data, setData] = useState({});

    return <Viewer
        content={code}
        data={data}
        onChange={(d) => setData(d)}
        onDiceRoll={(d) => alert(d.result.output)}
    />;
};

if(rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <Main code={code} />
        </StrictMode>,
    )
}


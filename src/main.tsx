import {StrictMode, useState} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Viewer} from "./index";

const rootElement: HTMLElement|null = document.getElementById('root');

const code = `# Hello World 
Roll +5 or maybe 2d6+4

i[modifier]

You might want to roll +{{modifier}}

## Now for some longer text
-|-
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
exercitationem iure laboriosam, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!

#### Small Headline
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
exercitationem iure laboriosam, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
exercitationem iure laboriosam, magni nobis 2d6+2 placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi

exercitationem iure __laboriosam__, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
exercitationem iure laboriosam, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
-|-
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


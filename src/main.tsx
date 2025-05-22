import {StrictMode, useState} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {Viewer} from "./index";

const rootElement: HTMLElement | null = document.getElementById('root');

const code = `---
str: 10
dex: 12
con: 15
int: 8
wis: 6
cha: 17
---
# Hello World 
Roll +5 or maybe 2d6+4

:::grid-5

i[modifier]

You might want to roll +{{modifier}}
:::
:::grid-3-2

i[modifier]

You might want to roll +{{modifier}}
:::

Select your class
s[className][
Warrior
Rogue
Mage
]

:::if className === "Mage"
## Mage
Mages are very powerful spell casters
:::
:::if className === "Rogue"
## Rogue
Rogues are very sneaky
:::
:::if className === "Warrior"
## Warrior
Warriors are very strong
:::
## Now for some longer text
-|-
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
    exercitationem iure laboriosam, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
    
    #### DnD Stats
    |                |     |     |     |     |     |
    |----------------|--------|--------|--------|--------|--------|
    | i[str]         | i[dex] | i[con] | i[int] | i[wis] | i[cha] |
    | {{$mod(str)}}  | {{$mod(dex)}} | {{$mod(con)}} | {{$mod(int)}} | {{$mod(wis)}} | {{$mod(cha)}} |
    |                |        |        |        |        |        |

:::if str >= 10
    #### Small Headline
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
    exercitationem iure laboriosam, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
    exercitationem iure laboriosam, magni nobis 2d6+2 placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
    
    exercitationem iure __laboriosam__, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at aut commodi dicta eaque eos eum excepturi
    exercitationem iure laboriosam, magni nobis placeat quaerat qui repudiandae, sapiente tempore veniam. Nam!
:::
    ## Tabs should work too
    |-- Tab One ---
    |
    | This should be the content of the __first tab__.
    |
    |-- Tab Two ---
    |
    | And this is the content of the __second tab__.
    |
    |---
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

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <Main code={code}/>
        </StrictMode>,
    )
}


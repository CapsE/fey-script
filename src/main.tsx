import {StrictMode, useState} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {DiceRollResult, Viewer} from "./index";
import code from './test-data.md?raw';

const rootElement: HTMLElement | null = document.getElementById('root');

const importables: { [key: string]: string } = {
    'spells/magehand': `
        #### Mage Hand

        *Conjuration cantrip*
        
        **Casting Time:** 1 action
        
        **Range:** 30 feet
        
        **Components:** V, S
        
        **Duration:** 1 minute
        
        A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.
        
        You can use your action to control the hand. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it.
        
        The hand can’t attack, activate magic items, or carry more than 10 pounds.

    `,
    'spells/fireball': `
        #### Fireball

        *3rd-level evocation*
        
        **Casting Time:** 1 action
        
        **Range:** 150 feet
        
        **Components:** V, S, M (a tiny ball of bat guano and sulfur)
        
        **Duration:** Instantaneous
        
        A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.
        
        The fire spreads around corners. It ignites flammable objects in the area that aren’t being worn or carried.
        
        ***At Higher Levels.*** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.
    `
}

type Props = {
    code: string;
};

const Main: React.FC<Props> = ({code}) => {
    const [data, setData] = useState({});

    return <Viewer
        content={code}
        data={data}
        onChange={(d) => setData(d)}
        onDiceRoll={(d:DiceRollResult) => alert(d.result.output)}
        resolveImport={(path) => importables[path] }
    />;
};

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <Main code={code}/>
        </StrictMode>,
    )
}


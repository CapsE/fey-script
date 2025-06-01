---
    str: 10
    dex: 12
    con: 15
    int: 8
    wis: 6
    cha: 17
---
# Fey-Script
As always Fey-Script allows you to roll +5 or maybe 2d6+4.

## Inputs
Inputs come in new shapes now:

:::grid-5
    i[text|{"type":"text", "value": "Hello World"}]
    i[numbers|{"value": 42}]
    i[numbersWithMaxValue|25/33]
    i[numberOfCheckboxes|[3/6]]
    s[selects][
        Warrior
        Rogue
        Mage
    ]
:::

And you can use their values in your document: {{numbers}} {{numbersWithMaxValue}} {{numberOfCheckboxes}} {{selects}}

## Conditional Rendering
Depending on set inputs values parts of your document can be hidden or shown

:::if selects === "Mage"
    ## Mage
    Mages are very powerful spell casters

    :::if numbers > 20
        ## Numbers
        The number is greater than 20

    :::
:::
:::if selects === "Rogue"
    ## Rogue
    Rogues are very sneaky
:::
:::if selects === "Warrior"
    ## Warrior
    Warriors are very strong
:::


## Textflow
-|-
    It's possible to let parts of your document flow in two columns. This works not only for text but for all elements.
    As you can see tables are supported too. There is also a helper function making it easier to calculate DnD5e's modifiers
-|-

#### DnD Stats
|                |        |        |        |        |        |
|----------------|--------|--------|--------|--------|--------|
| i[str]         | i[dex]        | i[con]        | i[int]        | i[wis]        | i[cha]        |
| {{$mod(str)}}  | {{$mod(dex)}} | {{$mod(con)}} | {{$mod(int)}} | {{$mod(wis)}} | {{$mod(cha)}} |


## Tabs
This new addition allows it to group and filter information on the fly. This will likely be used to
replace the current tab management in Fey-Gate to make content easier copy+pasteable
|-- Tab One ---
|
| This should be the content of the __first tab__.
|
|-- Tab Two ---
|
| And this is the content of the __second tab__.
|
|---


## Grids
Grids are back too and more flexible than ever! And you can use actual HTML now.
:::grid-1-2-3-4-5
    <div className="green">A</div>
    <div className="green">B</div>
    <div className="green">C</div>
    <div className="green">D</div>
    <div className="green">E</div>
:::

## Imports
Import things either directly into your code:
{{> spells/magehand}}

Or as link with a popup. [Fireball](> spells/fireball)

Links do work too. Click [here](https://raw.githubusercontent.com/BTMorton/dnd-5e-srd/refs/heads/master/markdown/08%20spellcasting.md)
Will -5 still work?

How about a nice image?

![image](https://picsum.photos/200/300)

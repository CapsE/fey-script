import {DiceRoll, exportFormats} from '@dice-roller/rpg-dice-roller';

/**
 * Gets the dice types from the roll string
 * @param {string} rollString
 * @return {[string]}
 */
function extractDiceTypes(rollString: string) {
    const diceTypes = rollString.match(/d[\dF]+/g);
    return diceTypes;
}

/**
 * Gets the dice rolls from the roll string
 * @param {[object]} rolls
 * @return {[[number]]}
 */
function extractDiceRolls(rolls) {
    return rolls.map((roll) => roll.rolls?.map((r) => r.calculationValue));
}

export function rollDice(notation: string, defaultDice: string = '1d20') {
    if (notation.startsWith('+') || notation.startsWith('-')) {
        notation = defaultDice + notation;
    }
    const roll = new DiceRoll(notation);
    const result = roll.export(exportFormats.OBJECT);

    const diceTypes = extractDiceTypes(notation);
    const results = extractDiceRolls(result.rolls);

    return {
        notation,
        result,
        results,
        diceTypes,
    }
}

import type { CommandInteraction, SlashCommandStringOption } from "discord.js";

export const filenameRegex = /^[A-Za-z_-]+\.msav/;

export async function splitReply(interaction: CommandInteraction, message: string) {
    const maxInitialLength = 2000;
    message = message.replace(/^\n+/, '');
    const lines = message.split('\n');
    const initialLine = lines.shift() || '';
    const messages = [initialLine];
    let currentMessage = '';
    lines.forEach(line => {
        if ((currentMessage + line).length > maxInitialLength) {
            messages.push(currentMessage.trim());
            currentMessage = line + '\n';
        } else {
            currentMessage += line + '\n';
        }
    });
    if (currentMessage.length > 0) {
        messages.push(currentMessage.trim());
    }
    if (messages.length > 0) {
        await interaction.reply(messages[0]);
    }
    for (let i = 1; i < messages.length; i++) {
        await interaction.followUp(messages[i]);
    }
}

export class Fail extends Error {
    name = "FailError";
}

export function fail(message:string):never {
    throw new Fail(message);
}
export function crash(message:string):never {
    throw new Error(message);
}

export function capitalize(message:string){
    return message[0].toUpperCase() + message.slice(1);
}

export const gamemodes = ["attack", "survival", "pvp", "hexed"] as const;
export type Gamemode = (typeof gamemodes)[number];
export function Gamemode(input:string):Gamemode {
    input = input.toLowerCase();
    if(gamemodes.includes(input)) return input;
    fail(`"${input}" is not a valid gamemode`);
}

/**
 * @unsafe object must not have any extra properties.
 **/
export function getProp<T extends Record<PropertyKey, unknown>>(object:T, key:PropertyKey):T[keyof T] | undefined {
    return object[key] as never;
}

export function runFunction(interaction:CommandInteraction, callback:() => Promise<unknown>, successMessage:string){
    return callback()
        .then(() => interaction.reply(successMessage))
        .catch(err => {
            if(err instanceof Fail){
                return interaction.reply(`Error: ${err.message}`);
            } else {
                console.error(err);
                return interaction.reply(`__Bot crashed!:__ ${err.toString()}`);
            }
        })
}

export const gamemodeChoices = [
    { name: "Attack", value: "attack" },
    { name: "Survival", value: "survival" },
    { name: "PVP", value: "pvp" },
    { name: "Hexed", value: "hexed" },
];

export function gamemodeOption(option:SlashCommandStringOption, description = 'Gamemode of the map to be modified'){
    return option.setName('gamemode').setDescription(description).setChoices(gamemodeChoices).setRequired(true);
}

import { CommandInteraction } from "discord.js";

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

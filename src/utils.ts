import type { CommandInteraction, SlashCommandStringOption } from "discord.js";
import * as zlib from "node:zlib";
import { promisify } from "node:util";

export const filenameRegex = /^[A-Za-z0-9_-]+\.msav$/;
export const msavHeaderBytes = "MSAV".split("").map(c => c.charCodeAt(0));
const inflate = promisify(zlib.inflate);


/** Throws a Fail if the file is not a valid mindustry map file. */
export async function validateFile(compressedData:Buffer){
	//Only decompress the first chunk to prevent DOS
	const firstCompressedChunk = compressedData.subarray(0, 256);
	const firstChunk = await inflate(firstCompressedChunk, {
		finishFlush: zlib.constants.Z_SYNC_FLUSH
	}).catch(() =>
		fail(`Invalid file: the file you have uploaded is not a valid Mindustry map file: invalid compressed data`)
	);
	const headerBytes = firstChunk.subarray(0, 4);
	if(headerBytes.join(" ") != msavHeaderBytes.join(" "))
		fail(`Invalid file: the file you have uploaded is not a valid Mindustry map file: invalid header`);
}

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

export function fail(message: string): never {
	throw new Fail(message);
}
export function crash(message: string): never {
	throw new Error(message);
}

export function capitalize(message: string) {
	return message[0].toUpperCase() + message.slice(1);
}

export const gamemodes = ["attack", "survival", "pvp", "sandbox"] as const;
export type Gamemode = (typeof gamemodes)[number];
export function Gamemode(input: string): Gamemode {
	input = input.toLowerCase();
	if (gamemodes.includes(input)) return input;
	fail(`"${escapeTextDiscord(input)}" is not a valid gamemode`);
}

export class IndexedRatekeeper<K> {
	private readonly rateMap = new Map<K, [occurences: number, lastTime: number]>();
	private globalOccurences = 0;
	private globalLastTime = 0;

	allowGlobal(spacing:number, cap:number):boolean {
		if(Date.now() - this.globalLastTime > spacing){
			this.globalOccurences = 0;
			this.globalLastTime = Date.now();
		}

		this.globalOccurences ++;
		return this.globalOccurences <= cap;
	}

	/**
	* @returns whether an action is allowed.
	* @param key the key to check the ratelimit for
	* @param spacing the spacing between action chunks in milliseconds
	* @param cap the maximum amount of actions per chunk
	* @param globalSpacing the spacing between all action chunks in milliseconds
	* @param globalCap the maximum amount of all actions per chunk
	**/
	allow2(key:K, spacing:number, cap:number, globalSpacing:number, globalCap:number):boolean {
		if(this.allowGlobal(globalSpacing, globalCap)){
			if(this.allow(key, spacing, cap)){
				return true;
			} else {
				//Un-increment the global occurences count
				this.globalOccurences --;
			}
		}
		return false;
	}
		
	/**
	* @returns whether an action is allowed.
	* @param key the key to check the ratelimit for
	* @param spacing the spacing between action chunks in milliseconds
	* @param cap the maximum amount of actions per chunk
	**/
	allow(key:K, spacing:number, cap:number):boolean {
		let [occurences, lastTime] = this.rateMap.get(key) ?? [0, 0];

		if(Date.now() - lastTime > spacing){
			occurences = 0;
			lastTime = Date.now();
		}
		occurences ++;

		this.rateMap.set(key, [occurences, lastTime])

		return occurences <= cap
	}

}

/**
 * @unsafe object must not have any extra properties.
 **/
export function getProp<T extends Record<PropertyKey, unknown>>(object: T, key: PropertyKey): T[keyof T] | undefined {
	return object[key] as never;
}

export function escapeTextDiscord(text:string):string {
	return text.replace(/([*\\_~`|:#])/g, c => '\\' + c);
}

export function capitalizeWord(text:string):string {
	if(text.length == 0) return text;
	return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

const ratekeeper = new IndexedRatekeeper<string>();

export async function runFunction(interaction: CommandInteraction, callback: () => Promise<unknown>, successMessage: string, ratelimit = true) {
	try {
		if(ratelimit){
			ratekeeper.allow2(
				interaction.user.id,
				600_000, 10, //10 commands per 10 minutes (including failures)
				600_000, 20, //20 commands per 10 minutes for all users globally
			) || fail(`You've been ratelimited. Please try again in a few minutes.`);
		}
		await callback();
		return await interaction.reply(successMessage);
	} catch (err) {
		if (err instanceof Fail) {
			return interaction.reply(`Error: ${err.message}`);
		} else throw err;
	}
}

export const gamemodeChoices = [
	{ name: "Attack", value: "attack" },
	{ name: "Survival", value: "survival" },
	{ name: "PVP", value: "pvp" },
	{ name: "Sandbox", value: "sandbox" },
];

export function gamemodeOption(option: SlashCommandStringOption, description = 'Gamemode of the map to be modified') {
	return option.setName('gamemode').setDescription(description).setChoices(gamemodeChoices).setRequired(true);
}



declare module "*config.json" {
	export const value: {
		"discord": {
			"token": string;
			"appID": string;
			"guildID": string;
		}
		"github": {
			"owner": string;
			"key": string;
			"repo": string;
			"paths": Record<"attack" | "survival" | "pvp" | "hexed", string>;
			"branch": "map-bot-tests";
		}
	};
	export default value;
}

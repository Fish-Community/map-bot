import rawConfig from '../config.json' assert {type: 'json'};

export const config = {
	"discord": {
		"token": String(rawConfig.discord.token),
		"appID": String(rawConfig.discord.appID),
		"guildID": String(rawConfig.discord.guildID),
		"roleID" : String(rawConfig.discord.roleID)
	},
	"github": {
		"owner": String(rawConfig.github.owner),
		"key": String(rawConfig.github.key),
		"repo": String(rawConfig.github.repo),
		"paths": {
			"attack": String(rawConfig.github.paths.attack),
			"survival": String(rawConfig.github.paths.survival),
			"pvp": String(rawConfig.github.paths.pvp),
			"hexed": String(rawConfig.github.paths.hexed),
		},
		"branch": String(rawConfig.github.branch),
	}
}
export const gamemodePaths = config.github.paths;
export default config;

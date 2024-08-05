import { Client, GatewayIntentBits } from 'discord.js';
import config from './config.js';

import { ping } from './commands/ping.js';
import { maps } from './commands/showMaps.js'
import { addmap } from './commands/addMap.js';
import { deletemap } from './commands/deleteMap.js';
import { registerCommands } from './commands.js';
import { renameMap } from './commands/renameMap.js';
import { updateMap } from './commands/updatemap.js';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
    registerCommands().catch(console.error);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()){
    const { commandName } = interaction;
    switch (commandName) {
        case 'ping':
            await ping(interaction);
            break;
        case 'add_map':
            await addmap(interaction);
            break;
        case 'delete_map':
            await deletemap(interaction);
            break;
        case 'maps':
            await maps(interaction);
            break;
        case 'rename_map':
            await renameMap(interaction);
            break;
        case 'update_map':
            await updateMap(interaction);
            break;
      default:
          console.error(`Unknown interation ${commandName} occured.`)
          break;
    }
  }
});

client.login(config.discord.token);

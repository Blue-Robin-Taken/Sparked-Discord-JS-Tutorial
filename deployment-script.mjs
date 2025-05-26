import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const clientId = process.env.clientID;
const guildId = process.env.guildID;
const token = process.env.TOKEN;
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commands = [];
const foldersPath = join(__dirname, 'commands');
const commandFiles = readdirSync(foldersPath).filter((file) =>
    file.endsWith('.mjs')
);

(async () => {
    for (const file of commandFiles) {
        const filePath = join(foldersPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const command = commandModule.default;

        console.log(command);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }

    const rest = new REST().setToken(token);
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        console.error(error);
    }
})();

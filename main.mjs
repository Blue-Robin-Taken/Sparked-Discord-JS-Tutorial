// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
// require('dotenv').config();
import dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pathToFileURL } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

const foldersPath = fs
    .readdirSync(path.join(__dirname, 'commands'))
    .filter((file) => file.endsWith('.mjs'));

for (const file of foldersPath) {
    const filePath = path.join(path.join(__dirname, 'commands'), file);
    const commandModule = await import(pathToFileURL(filePath).href);
    const command = commandModule.default;
    console.log(commandModule);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on('messageCreate', (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    if (message.content.startsWith('?')) {
        if (message.content === '?ping') {
            message.channel.send(
                `Pong 🏓! My ping is: ${Math.round(client.ws.ping)}ms`
            );
            // https://stackoverflow.com/a/63411714/15982771
            return;
        }
    }
});

client.login(TOKEN);

import {
    ActionRowBuilder,
    ColorResolvable,
    EmbedBuilder,
    Events,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextChannel
} from 'discord.js';
import Bot from '../classes/Bot';
import Database from '../classes/Database';
import { EventType } from '../enums/enums';

export = {
    name: Events.ClientReady,
    type: EventType.Classic,
    once: true,
    execute: async (main: Bot, database: Database) => {
        console.log(`Connexion successfully established with ${main.djsClient!.user?.username}`.bgGreen);
        database.initializateGuilds();

        const embed = new EmbedBuilder()
            .setColor(main.colors.true as ColorResolvable)
            .setTitle(`Welcome on Aunt development!`)
            .setDescription(
                '> Welcome on this channel. It is for this server one of the two bases channels and allow you to understand the server and his functioning by his rules.\n> Here, chat with all the others members, mainly about informatic!\n\n**Here you can find:**\n- `server rules`\n- `Aunt terms of services`\n- `Aunt privacy policy`\n\nWe here reply to all the questions using a modmail `( includes on aunt bot )`. Maybe the bot is not online? The ask in report, chat or even in staffs dms `( exceptional )`.'
            );

        const embed1 = new EmbedBuilder()
            .setFooter({
                text: `You have to follow them, not only for you to stay, but for the experiences of others.`,
                iconURL: main.djsClient!.user?.avatarURL() ?? undefined
            })
            .setColor(main.colors.true as ColorResolvable)
            .setThumbnail(
                'https://images-ext-1.discordapp.net/external/RD2H6wBdF7ifbqHvRpuqiKkraRn3x9iEIZ7iMby4gwI/%3Fv%3D1/https/cdn.discordapp.com/emojis/789614567306297374.png?format=webp&quality=lossless'
            )
            .setDescription(
                'These rules are needed to maintain the server in his original state!\n\n⏰ **Members are all equals in front of the rules.**\n➜ When a message from you is sent, we consider that you read them and that you accept all the articles it includes.\n```php\n01. Respect the discord guidelines and terms.\n02. You are responsible of any acts of your account.\n03. You need to be respectful with all.\n04. NSFW & illegal contents are NOT allowed.\n05. Inviting, selling, leaking user real or unreal DATAS (to troll) are NOT allowed.\n06. Do not spam mentions (exception for people you know).\n07. As in textual channels, you have to be respectful in voice ones.\n08. We sadly only allow and recognize french & english languages.```'
            )
            .setTitle('Server rules');

        const component = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rules')
                .setDisabled(false)
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Select to obtain more informations about a type of rules.')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('📋')
                        .setLabel('Discord Guildlines.')
                        .setValue('discord'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🧸')
                        .setLabel('Account & Profile.')
                        .setValue('account'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🪅')
                        .setLabel('Live Together.')
                        .setValue('together'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('⛩')
                        .setLabel('Externals contents.')
                        .setValue('contents'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('📌')
                        .setLabel('Mentions.')
                        .setValue('mentions'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🔊')
                        .setLabel('Voice rules.')
                        .setValue('voice'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🤬')
                        .setLabel('No exhaustiveness.')
                        .setValue('exhaustiveness'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('⚔️')
                        .setLabel('Aunt termes of services.')
                        .setValue('terms'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🔑')
                        .setLabel('Aunt privacy policy.')
                        .setValue('policy')
                )
        );

        // await (main.djsClient!.channels?.cache.get("1088512857324392468") as TextChannel).send({ embeds: [embed, embed1], components: [component as ActionRowBuilder<StringSelectMenuBuilder>] });
    }
};

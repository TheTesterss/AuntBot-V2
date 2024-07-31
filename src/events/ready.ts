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
            .setTitle(`Bien sur Aunt développement!`)
            .setDescription(
                '> Bienvenue dans ce salon, c\'est pour ce serveur, l\'un des deux salons importants et permet de comprendre le serveur et son fonctionnement par son règlement.\n> Ici, discute avec les autres membres, principalement à propos des informations.'
            );

        const embed1 = new EmbedBuilder()
            .setFooter({
                text: `Vous devez les suivre, non seulement pour rester en notre compagnie, mais aussi pour les expériences de chacun.`,
                iconURL: main.djsClient!.user?.avatarURL() ?? undefined
            })
            .setColor(main.colors.true as ColorResolvable)
            .setThumbnail(
                'https://images-ext-1.discordapp.net/external/RD2H6wBdF7ifbqHvRpuqiKkraRn3x9iEIZ7iMby4gwI/%3Fv%3D1/https/cdn.discordapp.com/emojis/789614567306297374.png?format=webp&quality=lossless'
            )
            .setDescription(
                'Ces règles sont nécéssaires pour maintenir le serveur dans son état d\'origine.\n\n⏰ **Members are all equals in front of the rules.**\n➜ When a message from you is sent, we consider that you read them and that you accept all the articles it includes.\n```php\n01. Respect the discord guidelines and terms.\n02. You are responsible of any acts of your account.\n03. You need to be respectful with all.\n04. NSFW & illegal contents are NOT allowed.\n05. Inviting, selling, leaking user real or unreal DATAS (to troll) are NOT allowed.\n06. Do not spam mentions (exception for people you know).\n07. As in textual channels, you have to be respectful in voice ones.\n08. We sadly only allow and recognize french & english languages.```'
            )
            .setTitle('Règles du serveur');

        const component = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rules')
                .setDisabled(false)
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Sélectionne pour obtenir un maximum d\'informations.')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('📋')
                        .setLabel('Utilisation de Discord')
                        .setValue('discord'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🧸')
                        .setLabel('Compte et profil')
                        .setValue('account'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🪅')
                        .setLabel('Vivre ensemble')
                        .setValue('together'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('⛩')
                        .setLabel('Contenu externe')
                        .setValue('contents'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('📌')
                        .setLabel('Mentions')
                        .setValue('mentions'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🔊')
                        .setLabel('Règles vocales')
                        .setValue('voice'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🤬')
                        .setLabel('Exhaustivité')
                        .setValue('exhaustiveness'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('⚔️')
                        .setLabel('Aunt, termes et services')
                        .setValue('terms'),
                    new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setEmoji('🔑')
                        .setLabel('Aunt, Police de confidentalité')
                        .setValue('policy')
                )
        );

        await (main.djsClient!.channels?.cache.get("1088512857324392468") as TextChannel).send({ embeds: [embed, embed1], components: [component as ActionRowBuilder<StringSelectMenuBuilder>] });
    }
};

import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    ComponentType,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    Snowflake,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    UserContextMenuCommandInteraction,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction
} from 'discord.js';
import { CommandDatas } from '../../../enums/Interfaces';
import Bot from '../../../classes/Bot';
import Database from '../../../classes/Database';
import { LangValues } from '../../../enums/enums';
import { errorEmbed } from '../../../utils/functions/errorEmbed';

export const command: CommandDatas = {
    name: 'developers',
    nameLocalizations: {
        fr: 'développeurs'
    },
    description: 'Managing developers options.',
    descriptionLocalizations: {
        fr: 'Gère les options des développerurs.'
    },
    options: [
        {
            name: 'whitelist',
            nameLocalizations: { fr: 'liste_blanche' },
            description: "Managing owner's white list.",
            descriptionLocalizations: { fr: 'Gère la liste blanche.' },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    nameLocalizations: { fr: 'ajout' },
                    description: 'Add an user into the whitelist.',
                    descriptionLocalizations: { fr: 'Ajoute un utilisateur à la liste blanche.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            nameLocalizations: { fr: 'utilisateur' },
                            description: 'User to add.',
                            descriptionLocalizations: { fr: 'Utilisateur à ajouter.' },
                            type: ApplicationCommandOptionType.User,
                            required: true
                        }
                    ]
                },
                {
                    name: 'remove',
                    nameLocalizations: { fr: 'retrait' },
                    description: 'Remove an user into the whitelist.',
                    descriptionLocalizations: { fr: 'Retire un utilisateur à la liste blanche.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            nameLocalizations: { fr: 'utilisateur' },
                            description: 'User to remove.',
                            descriptionLocalizations: { fr: 'Utilisateur à retirer.' },
                            type: ApplicationCommandOptionType.User,
                            required: true
                        }
                    ]
                },
                {
                    name: 'reset',
                    nameLocalizations: { fr: 'réinitialiser' },
                    description: 'Reset the whitelist.',
                    descriptionLocalizations: { fr: 'Réinitialise la liste blanche.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: []
                },
                {
                    name: 'list',
                    nameLocalizations: { fr: 'liste' },
                    description: 'List of whitelisted users.',
                    descriptionLocalizations: { fr: 'Liste des utilisateurs sur liste blanche.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: []
                }
            ]
        },
        {
            name: 'blacklist',
            nameLocalizations: { fr: 'liste_noire' },
            description: "Managing owner's black list.",
            descriptionLocalizations: { fr: 'Gère la liste noire.' },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'add',
                    nameLocalizations: { fr: 'ajout' },
                    description: 'Add an user into the blacklist.',
                    descriptionLocalizations: { fr: 'Ajoute un utilisateur à la liste noire.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            nameLocalizations: { fr: 'utilisateur' },
                            description: 'User to add.',
                            descriptionLocalizations: { fr: 'Utilisateur à ajouter.' },
                            type: ApplicationCommandOptionType.User,
                            required: true
                        }
                    ]
                },
                {
                    name: 'remove',
                    nameLocalizations: { fr: 'retrait' },
                    description: 'Remove an user into the blacklist.',
                    descriptionLocalizations: { fr: 'Retire un utilisateur à la liste noire.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'user',
                            nameLocalizations: { fr: 'utilisateur' },
                            description: 'User to remove.',
                            descriptionLocalizations: { fr: 'Utilisateur à retirer.' },
                            type: ApplicationCommandOptionType.User,
                            required: true
                        }
                    ]
                },
                {
                    name: 'reset',
                    nameLocalizations: { fr: 'réinitialiser' },
                    description: 'Reset the blacklist.',
                    descriptionLocalizations: { fr: 'Réinitialise la liste noire.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: []
                },
                {
                    name: 'list',
                    nameLocalizations: { fr: 'liste' },
                    description: 'List of blacklisted users.',
                    descriptionLocalizations: { fr: 'Liste des utilisateurs sur liste noire.' },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: []
                }
            ]
        },
        {
            name: 'warns',
            nameLocalizations: { fr: 'avertissements' },
            description: 'Managing users warns.',
            descriptionLocalizations: { fr: 'Gérer les avertissements des utilisateurs.' },
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        }
    ],
    customOptions: {
        CanBeReboot: true,
        allowInDms: false,
        blacklistAllowed: false,
        forBotOwnerOnly: true,
        forGuildAdminsOnly: false,
        forGuildOwnerOnly: false,
        inVoiceOnly: false,
        isNSFW: false,
        whitelistDisallowed: false,
        memberRequiredPermissions: [],
        clientRequiredPermissions: []
    },
    types: [ApplicationCommandType.ChatInput],
    execute: async (
        bot: Bot,
        database: Database,
        interaction:
            | ChatInputCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
        command: CommandDatas,
        lang: LangValues
    ): Promise<void> => {
        let sub = (interaction as ChatInputCommandInteraction).options.getSubcommand();
        if (sub === 'whitelist') {
        }
    }
};

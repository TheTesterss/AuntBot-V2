import {
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    Snowflake
} from 'discord.js';


export type customColorsType = {
    true: string;
    false: string;
};

export type MongooseConfigType = {
    serverSelectionTimeoutMS?: number;
    family?: 4 | 6;
    maxPoolSize?: number;
};

export type LangType = 'fr' | 'en';

export type SlashCommandOptions =
    | SlashCommandAttachmentOption
    | SlashCommandBooleanOption
    | SlashCommandChannelOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandGroupBuilder;

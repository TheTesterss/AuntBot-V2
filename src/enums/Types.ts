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

export type customEmojisType = {
    chat: string;
    community: string;
    id: string;
    channel: string;
    admin: string;
    mod: string;
    automod: string;
    stats: string;
    support: string;
    user: string;
    ben: string;
    leftarrow: string;
    rightarrow: string;
    leave: string;
    join: string;
};

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

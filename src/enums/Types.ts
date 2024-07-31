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

export type errorEmbedType = {
    descriptions: {
        permissions: embedLangsType;
        bot_perms: embedLangsType;
        fetching: embedLangsType;
        executing: embedLangsType;
        not_found: embedLangsType;
        voice: embedLangsType;
        developer: embedLangsType;
        owner: embedLangsType;
        admin: embedLangsType;
        unvailable: embedLangsType;
        news: embedLangsType;
        cooldown: embedLangsType;
        blacklisted: embedLangsType;
        internal: embedLangsType;
        interaction: embedLangsType;
        adding: embedLangsType;
        removing: embedLangsType;
    };
    footers: {
        301: embedLangsType;
        302: embedLangsType;
        401: embedLangsType;
        402: embedLangsType;
        403: embedLangsType;
        404: embedLangsType;
        429: embedLangsType;
        500: embedLangsType;
        501: embedLangsType;
        503: embedLangsType;
    };
};

export type embedType = {
    descriptions: {
        latencies_fetching: embedLangsType;
        latencies_updated: embedLangsType;
    };
    fields: {
        latencies_updated: latencies_updated_field;
    };
    footers: {
        200: embedLangsType;
    };
};

export type embedLangsType = {
    en: string;
    fr: string;
};

type latencies_updated_field = {
    name: string;
    0: embedLangsType;
};

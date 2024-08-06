import {
    AnySelectMenuInteraction,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    ClientEvents,
    CommandInteraction,
    LocalizationMap,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    PermissionResolvable,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserContextMenuCommandInteraction,
    UserSelectMenuInteraction
} from "discord.js";
import Bot from "../classes/Bot";
import Database from "../classes/Database";
import { ClientDB, UserDB, GuildDB, MemberDB } from "../database/index";
import { EventType, LangValues } from "./enums";

export interface EventDatas {
    name: keyof ClientEvents | keyof ClientCustomEvents | keyof MongooseEvents;
    once?: boolean;
    type: EventType;
    execute: (bot: Bot, database: Database, ...args: any) => {};
}

export interface MongooseEvents {
    ready: [database: Database];
    clientCreate: [client: typeof ClientDB];
    clientUpdate: [oldClient: typeof ClientDB, newClient: typeof ClientDB];
    clientDelete: [client: typeof ClientDB];
    guildCreate: [guild: typeof GuildDB];
    guildUpdate: [oldGuild: typeof GuildDB, newGuild: typeof GuildDB];
    guildDelete: [guild: typeof GuildDB];
    userCreate: [user: typeof UserDB];
    userUpdate: [oldUser: typeof UserDB, newUser: typeof UserDB];
    userDelete: [user: typeof UserDB];
    memberCreate: [member: typeof MemberDB];
    memberUpdate: [oldMember: typeof MemberDB, newMember: typeof MemberDB];
    memberDelete: [member: typeof MemberDB];
}

export interface CommandDatas {
    name: string;
    nameLocalizations: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    options: CommandDatasOption[];
    customOptions: commandDatasCustomOptions;
    types: ApplicationCommandType[];
    execute: (
        bot: Bot,
        database: Database,
        interaction:
            | ChatInputCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
        command: CommandDatas,
        lang: LangValues
    ) => {};
}

export interface CommandDatasOption {
    name: string;
    nameLocalizations: LocalizationMap;
    autocomplete?: boolean;
    type: ApplicationCommandOptionType;
    required?: boolean;
    description: string;
    descriptionLocalizations: LocalizationMap;
    options?: CommandDatasOption[];
    channelTypes?: (
        | ChannelType.GuildText
        | ChannelType.GuildVoice
        | ChannelType.GuildCategory
        | ChannelType.GuildAnnouncement
        | ChannelType.AnnouncementThread
        | ChannelType.PublicThread
        | ChannelType.PrivateThread
        | ChannelType.GuildStageVoice
        | ChannelType.GuildForum
        | ChannelType.GuildMedia
    )[];
    maxLength?: number;
    minLength?: number;
    maxValue?: number;
    minValue?: number;
    choices?: CommandDatasOptionChoice[];
}

export interface CommandDatasOptionChoice {
    name: string;
    value: string | number;
    nameLocalizations: LocalizationMap;
}

export interface commandDatasCustomOptions {
    blacklistAllowed?: boolean;
    whitelistDisallowed?: boolean;
    inVoiceOnly?: boolean;
    forGuildOwnerOnly?: boolean;
    forGuildAdminsOnly?: boolean;
    forBotOwnerOnly?: boolean;
    CanBeReboot?: boolean;
    allowInDms?: boolean;
    isNSFW?: boolean;
    ephemeralReply?: boolean;
    memberRequiredPermissions: PermissionResolvable[];
    clientRequiredPermissions: PermissionResolvable[];
}

export interface ClientCustomEvents {
    slashCommandExecution: [interaction: CommandInteraction, command: CommandDatas];
    userContextCommandExecution: [interaction: UserContextMenuCommandInteraction, command: CommandDatas];
    messageContextCommandExecution: [interaction: MessageContextMenuCommandInteraction, command: CommandDatas];
    buttonExecution: [interaction: ButtonInteraction];
    roleSelectMenuExecution: [interaction: RoleSelectMenuInteraction];
    userSelectMenuExecution: [interaction: UserSelectMenuInteraction];
    channelSelectMenuExecution: [interaction: ChannelSelectMenuInteraction];
    stringSelectMenuExecution: [interaction: StringSelectMenuInteraction];
    selectMenuExecution: [interaction: AnySelectMenuInteraction];
    modalExecution: [interaction: ModalSubmitInteraction];
    autocompleteExecution: [interaction: AutocompleteInteraction];
}

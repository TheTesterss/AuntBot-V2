export enum EventType {
    Classic = 1,
    Custom = 2,
    Database = 3
}

export enum DatabaseEvents {
    Ready = 'ready',
    GuildCreate = 'guildCreate',
    GuildUpdate = 'guildUpdate',
    GuildDelete = 'guildDelete',
    ClientCreate = 'clientCreate',
    ClientUpdate = 'clientUpdate',
    ClientDelete = 'clientDelete',
    MemberCreate = 'memberCreate',
    MemberUpdate = 'memberUpdate',
    MemberDelete = 'memberDelete',
    UserCreate = 'userCreate',
    UserUpdate = 'userUpdate',
    UserDelete = 'userDelete',
    Reset = 'reset'
}

export enum CustomEvents {
    SlashCommandExecution = 'slashCommandExecution',
    UserContextCommandExecution = 'userContextCommandExecution',
    MessageContextCommandExecution = 'messageContextCommandExecution',
    ButtonExecution = 'buttonExecution',
    RoleSelectMenuExecution = 'roleSelectMenuExecution',
    UserSelectMenuExecution = 'userSelectMenuExecution',
    ChannelSelectMenuExecution = 'channelSelectMenuExecution',
    StringSelectMenuExecution = 'stringSelectMenuExecution',
    SelectMenuExecution = 'selectMenuExecution',
    ModalExecution = 'modalExecution',
    AutocompleteExecution = 'autocompleteExecution'
}

export enum LangValues {
    EN = 'en',
    FR = 'fr'
}

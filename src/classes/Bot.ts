import {
    AnySelectMenuInteraction,
    ApplicationCommandOptionBase,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    Client,
    ClientEvents,
    Collection,
    CommandInteraction,
    ContextMenuCommandBuilder,
    Events,
    IntentsBitField,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    Partials,
    RoleSelectMenuInteraction,
    Routes,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandUserOption,
    StringSelectMenuInteraction,
    UserContextMenuCommandInteraction,
    UserSelectMenuInteraction
} from 'discord.js';
import fs from 'node:fs';
import { REST } from '@discordjs/rest';
import path from 'path';

import emojis from '../utils/jsons/emojis.json';
import colors from '../utils/jsons/colors.json';
import { customColorsType, customEmojisType } from '../enums/Types';
import { ClientCustomEvents, CommandDatas, CommandDatasOption, EventDatas, MongooseEvents } from '../enums/Interfaces';
import Database from './Database';
import { EventType, LangValues } from '../enums/enums';
import EventEmitter from 'node:events';

export default class Bot extends EventEmitter {
    public djsClient: Client | undefined;
    public database: Database | undefined;
    public customEmojis: customEmojisType = emojis;
    public colors: customColorsType = colors;
    public commands: Collection<string, CommandDatas> = new Collection();
    public eventTypes: { 1: string; 2: string; 3: string };
    constructor() {
        super({ captureRejections: true });
        this.djsClient = new Client({
            allowedMentions: {
                repliedUser: false
            },
            intents: [
                IntentsBitField.Flags.DirectMessages, //? Are private messages recolted ?
                IntentsBitField.Flags.GuildEmojisAndStickers, //? Are emojis and stickers actions recolted ?
                IntentsBitField.Flags.GuildInvites, //? Are invitations recolted ?
                IntentsBitField.Flags.GuildMembers, //? Are members and their updates collected ?
                IntentsBitField.Flags.GuildMessageReactions, //? Are reactions to message recolted ?
                IntentsBitField.Flags.GuildMessages, //? Are messages in guild recolted ?
                IntentsBitField.Flags.GuildPresences, //? Are the member profile and/or status updates recolted ?
                IntentsBitField.Flags.GuildVoiceStates, //? Are the voice users updates recolted ?
                IntentsBitField.Flags.Guilds, //? Are the guilds collected ?
                IntentsBitField.Flags.MessageContent, //? Is the content of the messages recolted ?
                IntentsBitField.Flags.GuildMessageTyping //? Are message typed notified ?
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.ThreadMember,
                Partials.User
            ]
        });
        this.database = new Database(
            {
                family: 4,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5_000
            },
            this
        );
        this.database.startDatabase(process.env.mongo_uri);

        this.eventTypes = {
            1: 'Discord.js event',
            2: 'Program event',
            3: 'Database event'
        };
    }

    async fetchEvents(): Promise<EventDatas[]> {
        const followedModels: EventDatas[] = [];
        let folders: string[] = fs.readdirSync(path.join(path.resolve(__dirname, '..'), 'events'));

        for (const subFolder of folders) {
            if (fs.lstatSync(path.join(path.resolve(__dirname, '..'), 'events', subFolder)).isDirectory()) {
                let files: string[] = fs.readdirSync(path.join(path.resolve(__dirname, '..'), 'events', subFolder));

                for (const file of files) {
                    let filePath: string = `../events/${subFolder}/${file}`;
                    let model: EventDatas = require(filePath);

                    if (this.isValidEventModel(model, file)) followedModels.push(model);
                }
            }

            if (subFolder.endsWith('.js')) {
                let filePath: string = `../events/${subFolder}`;
                let model: EventDatas = require(filePath);

                if (this.isValidEventModel(model, subFolder)) followedModels.push(model);
            }
        }

        return followedModels;
    }

    public isValidEventModel(model: EventDatas, file: string): boolean {
        if (!model || !model.name) throw new Error(`[${file.toLocaleUpperCase()}] - Arguments aren't all completed.`);

        if (typeof model.name !== 'string' || (model.once && ![true, false].includes(model.once)))
            throw new TypeError(`[${file.toLocaleUpperCase()}] - Arguments types aren't correct.`);

        return true;
    }

    public async runEvents(): Promise<void> {
        let followedModels: EventDatas[] = await this.fetchEvents();
        for (const model of followedModels) {
            switch (model.type) {
                case EventType.Classic:
                    this.djsClient![model.once ? 'once' : 'on'](model.name as keyof ClientEvents, async (...args) =>
                        model.execute(this, this.database!, ...(args as any[]))
                    );
                    break;
                case EventType.Custom:
                    this[model.once ? 'once' : 'on'](model.name as keyof ClientCustomEvents, async (...args) =>
                        model.execute(this, this.database!, ...(args as any[]))
                    );
                    break;
                case EventType.Database:
                    this.database![model.once ? 'once' : 'on'](model.name as keyof MongooseEvents, async (...args) =>
                        model.execute(this, this.database!, ...(args as any[]))
                    );
                    break;
            }

            console.log(
                `Connection established with file event: ${model.name} for a/an ${this.eventTypes[model.type]}`.bgGreen
            );
        }
    }

    public async fetchCommands(lang: LangValues): Promise<CommandDatas[]> {
        const followedModels: CommandDatas[] = [];
        let folders: string[] = fs.readdirSync(path.join(path.resolve(__dirname, '..'), 'commands', lang));

        for (const subFolder of folders) {
            let files: string[] = fs.readdirSync(path.join(path.resolve(__dirname, '..'), 'commands', lang, subFolder));

            for (const file of files) {
                let filePath: string = `../commands/${lang}/${subFolder}/${file}`;
                const model: CommandDatas = require(filePath).command;

                if (this.isValidCommandModel(model, file)) followedModels.push(model);
            }
        }

        return followedModels;
    }

    public isValidCommandModel(model: CommandDatas, file: string): boolean {
        if (!model || !model.name || !model.description || model.types?.length === 0)
            throw new Error(`[${file.toLocaleUpperCase()}] - Arguments aren't all completed.`);

        return true;
    }

    private async addOption(
        slash: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder,
        opt: CommandDatasOption
    ): Promise<ApplicationCommandOptionBase> {
        const setCommonProperties = (option: any, opt1: CommandDatasOption) => {
            option.setName(opt1.name);
            option.setNameLocalizations(opt1.nameLocalizations);
            option.setDescription(opt1.description);
            option.setDescriptionLocalizations(opt1.descriptionLocalizations);
            return option;
        };

        let result: any;
        switch (opt.type) {
            case ApplicationCommandOptionType.Attachment:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addAttachmentOption(
                    (option: SlashCommandAttachmentOption): SlashCommandAttachmentOption => {
                        setCommonProperties(option, opt);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Boolean:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addBooleanOption(
                    (option: SlashCommandBooleanOption): SlashCommandBooleanOption => {
                        setCommonProperties(option, opt);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Channel:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addChannelOption(
                    (option: SlashCommandChannelOption): SlashCommandChannelOption => {
                        setCommonProperties(option, opt);
                        if (opt.channelTypes) option.addChannelTypes(opt.channelTypes);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Integer:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addIntegerOption(
                    (option: SlashCommandIntegerOption): SlashCommandIntegerOption => {
                        setCommonProperties(option, opt);
                        if (opt.maxValue) option.setMaxValue(opt.maxValue);
                        if (opt.minValue) option.setMinValue(opt.minValue);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Mentionable:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addMentionableOption(
                    (option: SlashCommandMentionableOption): SlashCommandMentionableOption => {
                        setCommonProperties(option, opt);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Number:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addNumberOption(
                    (option: SlashCommandNumberOption): SlashCommandNumberOption => {
                        setCommonProperties(option, opt);
                        if (opt.maxValue) option.setMaxValue(opt.maxValue);
                        if (opt.minValue) option.setMinValue(opt.minValue);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Role:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addRoleOption(
                    (option: SlashCommandRoleOption): SlashCommandRoleOption => {
                        setCommonProperties(option, opt);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.String:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addStringOption(
                    (option: SlashCommandStringOption): SlashCommandStringOption => {
                        setCommonProperties(option, opt);
                        if (opt.autocomplete) option.setAutocomplete(true);
                        if (opt.choices && opt.choices.length > 0) option.addChoices(opt.choices);
                        if (opt.maxLength) option.setMaxLength(opt.maxLength);
                        option.setRequired(opt.required ?? false)
                        if (opt.minLength) option.setMinLength(opt.minLength);
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.Subcommand:
                (slash as SlashCommandBuilder).addSubcommand(
                    (option: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder => {
                        setCommonProperties(option, opt);
                        if (opt.options) for (const opt1 of opt.options) this.addOption(option, opt1);
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.SubcommandGroup:
                (slash as SlashCommandBuilder).addSubcommandGroup(
                    (option: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder => {
                        setCommonProperties(option, opt);
                        if (opt.options) for (const opt1 of opt.options) this.addOption(option, opt1);
                        return (result = option);
                    }
                );
                break;
            case ApplicationCommandOptionType.User:
                (slash as SlashCommandBuilder | SlashCommandSubcommandBuilder).addUserOption(
                    (option: SlashCommandUserOption): SlashCommandUserOption => {
                        setCommonProperties(option, opt);
                        option.setRequired(opt.required ?? false)
                        return (result = option);
                    }
                );
                break;
        }

        return result;
    }

    public async createCommands(): Promise<void> {
        let followedModels: CommandDatas[] = await this.fetchCommands(LangValues.EN);
        let commands: any[] = [];
        for (const model of followedModels) {
            for (const type of model.types)
                switch (type) {
                    case ApplicationCommandType.ChatInput:
                        const slash = new SlashCommandBuilder()
                            .setName(model.name)
                            .setDescription(model.description ?? 'Pop ! A description is missing here :/')
                            .setDescriptionLocalizations(
                                model.descriptionLocalizations ?? { fr: 'Pop ! Une description est manquante ici :/' }
                            )
                            .setNameLocalizations(model.nameLocalizations)
                            .setDMPermission(model.customOptions.allowInDms ?? null)
                            .setNSFW(model.customOptions.isNSFW ?? false)
                            .setDefaultMemberPermissions(
                                model.customOptions?.memberRequiredPermissions[0]?.discordPerm ?? null
                            );

                        for (const option of model.options) await this.addOption(slash, option);

                        commands.push(slash);
                        break;
                    case ApplicationCommandType.Message:
                        const message = new ContextMenuCommandBuilder()
                            .setName(model.name)
                            .setDMPermission(null)
                            .setNameLocalizations(model.nameLocalizations)
                            .setType(ApplicationCommandType.Message);

                        commands.push(message);
                        break;
                    case ApplicationCommandType.User:
                        const user = new ContextMenuCommandBuilder()
                            .setName(model.name)
                            .setDMPermission(null)
                            .setNameLocalizations(model.nameLocalizations)
                            .setType(ApplicationCommandType.User);

                        commands.push(user);
                        break;
                }
            console.log(`Slash ${model.name} has been correctly added to discord.`.bgBlue);
        }

        const rest = new REST({ version: '10' }).setToken(process.env.token);
        await rest.put(Routes.applicationCommands(this.djsClient!.user!.id), { body: commands });
        console.log(`Slash commands loaded with success! Amount of slashs: ${commands.length}.`.bgBlue);
    }

    public waitForCommandExecution(): void {
        this.djsClient!.on(Events.InteractionCreate, async (interaction) => {
            const lang: string | undefined = (
                await this.database?.models.GuildDB.findOne({ id: interaction.guild!.id })
            )?.lang;
            if (interaction.isChatInputCommand()) {
                if (!interaction.deferred) await interaction.deferReply();
                this.emit(
                    'slashCommandExecution',
                    interaction as CommandInteraction,
                    (await this.fetchCommands(lang as LangValues)).find((cmd) => cmd.name === interaction.commandName)
                );
            }
            if (interaction.isUserContextMenuCommand()) {
                if (!interaction.deferred) await interaction.deferReply();
                this.emit(
                    'userContextCommandExecution',
                    interaction as UserContextMenuCommandInteraction,
                    (await this.fetchCommands(lang as LangValues)).find((cmd) => cmd.name === interaction.commandName)
                );
            }
            if (interaction.isMessageContextMenuCommand()) {
                if (!interaction.deferred) await interaction.deferReply();
                this.emit(
                    'messageContextCommandExecution',
                    interaction as MessageContextMenuCommandInteraction,
                    (await this.fetchCommands(lang as LangValues)).find((cmd) => cmd.name === interaction.commandName)
                );
            }
            if (interaction.isButton()) this.emit('buttonExecution', interaction as ButtonInteraction);
            if (interaction.isRoleSelectMenu())
                this.emit('roleSelectMenuExecution', interaction as RoleSelectMenuInteraction);
            if (interaction.isUserSelectMenu())
                this.emit('userSelectMenuExecution', interaction as UserSelectMenuInteraction);
            if (interaction.isChannelSelectMenu())
                this.emit('channelSelectMenuExecution', interaction as ChannelSelectMenuInteraction);
            if (interaction.isStringSelectMenu())
                this.emit('stringSelectMenuExecution', interaction as StringSelectMenuInteraction);
            if (interaction.isAnySelectMenu())
                this.emit('selectMenuExecution', interaction as AnySelectMenuInteraction);
            if (interaction.isModalSubmit()) this.emit('modalExecution', interaction as ModalSubmitInteraction);
            if (interaction.isAutocomplete())
                this.emit('autocompleteExecution', interaction as AutocompleteInteraction);
        });
    }

    public isValidToken(token: string): boolean {
        //return /^([a-zA-Z0-9]{24}\.[a-zA-Z0-9]{6}\.[a-zA-Z0-9]{27})$/.test(token);
        return true;
    }

    public async startClient(token: string): Promise<this> {
        if (!this.isValidToken(token))
            throw new TypeError("It seems like your bot token doesn't correspond to a valid discord bot token.");

        await this.djsClient!.login(token).catch((e) => console.error);
        await this.runEvents();
        await this.createCommands();
        this.waitForCommandExecution();
        await this.database!.initializateClient();

        return this;
    }
}

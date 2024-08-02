import { GuildDB, ClientDB, MemberDB, UserDB } from '../database/index';
const Models = { GuildDB, ClientDB, MemberDB, UserDB };
import EventEmitter from 'node:events';
import Bot from './Bot';
import { MongooseConfigType } from '../enums/Types';
import mongoose from 'mongoose';
import { LangValues } from '../enums/enums';
import { Guild, GuildMember, Snowflake, User } from 'discord.js';

export default class Database extends EventEmitter {
    public mongoose: typeof mongoose = mongoose;
    public models: typeof Models = Models;
    private simplifyModelsNames: {
        client: string;
        user: string;
        member: string;
        guild: string;
    } = {
        client: 'ClientDB',
        user: 'UserDB',
        member: 'MemberDB',
        guild: 'GuildDB'
    };
    private project: Bot;
    public options: MongooseConfigType = {};
    constructor(config: MongooseConfigType, main: Bot) {
        super({ captureRejections: true });
        this.project = main;
        this.options.serverSelectionTimeoutMS = config.serverSelectionTimeoutMS ?? 5_000;
        (this.options.family = config.family ?? 4), (this.options.maxPoolSize = config.maxPoolSize ?? 10);
    }

    public async initializateGuilds(): Promise<void> {
        this.project.djsClient!.guilds.cache.forEach(async (guild) => await this.initializateGuild(guild));
    }

    public async initializateGuild(guild: Guild): Promise<void> {
        let db: typeof GuildDB | null = await this.models.GuildDB.findOne({ id: guild.id });
        if (db) return;

        this.models.GuildDB.create({ id: guild.id, lang: LangValues.EN }).catch((e: any) => console.error);
        guild.members.cache.forEach(async (member) => await this.initializateGuildMember(guild, member));
        console.log(`${guild.name} has been added to the database.`.bgMagenta);
    }

    public async initializateClient(): Promise<void> {
        let db: typeof ClientDB | null = await this.models.ClientDB.findOne({ id: this.project.djsClient!.user!.id });
        if (db) return;

        this.models.ClientDB.create({ id: this.project.djsClient!.user!.id, blacklist: [], whitelist: [] }).catch(
            (e: any) => console.error
        );
        console.log(`client has been added to the database.`.bgYellow);
    }

    public async initializateGuildMembers(guild: Guild): Promise<void> {
        guild.members.cache.forEach(async (member) => await this.initializateGuildMember(guild, member));
    }

    public async initializateGuildMember(guild: Guild, member: GuildMember): Promise<void> {
        let db: typeof MemberDB | null = await this.models.MemberDB.findOne({ id: member.id, guild_id: guild.id });
        if (db) return;

        this.models.MemberDB.create({ id: member.id, guild_id: guild.id }).catch((e: any) => console.error);
        console.log(`${member.user.username} has been added to the database.`.bgCyan);
    }

    public async initializateUser(user: User): Promise<void> {
        let db: typeof UserDB | null = await this.models.UserDB.findOne({ id: user.id });
        if (db) return;

        this.models.UserDB.create({ id: user.id, prevnames: [] }).catch((e: any) => console.error);
        console.log(`${user.username} has been added to the database.`.bgCyan);
    }

    public isValidConnexionLink(uri: string): boolean {
        //return /^mongodb\+srv:\/\/[a-zA-Z0-9._%+-]+:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.mongodb\.net\/?$/.test(uri);
        return true;
    }

    public async resetDatas(): Promise<void> {
        const collections = mongoose.connection.collections;
        await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
    }

    public async startDatabase(uri: string): Promise<this> {
        if (!this.isValidConnexionLink(uri))
            throw new TypeError("It seems like your mongo uri link doesn't correspond to a valid mongo uri token.");

        await this.mongoose.connect(uri, this.options).catch((e) => console.error);
        //await this.resetDatas();
        this.emit('ready', this);

        return this;
    }
}

import { Events, Guild } from 'discord.js';
import Bot from '../../classes/Bot';
import Database from '../../classes/Database';
import { EventType } from '../../enums/enums';

export = {
    name: Events.GuildCreate,
    type: EventType.Classic,
    once: false,
    execute: async (main: Bot, database: Database, guild: Guild) => {
        //TODO Guild create & Delete logs.
        database.initializateGuild(guild);
    }
};

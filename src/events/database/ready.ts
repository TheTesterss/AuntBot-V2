import { Events } from 'discord.js';
import Bot from '../../classes/Bot';
import Database from '../../classes/Database';
import { EventType, DatabaseEvents } from '../../enums/enums';

export = {
    name: DatabaseEvents.Ready,
    type: EventType.Database,
    once: true,
    execute: async (main: Bot, database: Database) => {
        console.log(`Connexion successfully established with The database`.bgGreen);
    }
};

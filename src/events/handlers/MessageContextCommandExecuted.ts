import { ApplicationCommandType, CommandInteraction } from 'discord.js';
import Bot from '../../classes/Bot';
import Database from '../../classes/Database';
import { EventType, CustomEvents } from '../../enums/enums';
import { CommandDatas } from '../../enums/Interfaces';

export = {
    name: CustomEvents.MessageContextCommandExecution,
    type: EventType.Custom,
    once: false,
    execute: async (main: Bot, database: Database, interaction: CommandInteraction, command: CommandDatas) => {
        if (!command.types.includes(ApplicationCommandType.Message)) return;
    }
};

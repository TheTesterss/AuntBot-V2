import { AuditLogEvent, Events, Guild, GuildBan, User } from "discord.js";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";
import { EventType } from "../../enums/enums";

export = {
    name: Events.GuildBanRemove,
    type: EventType.Classic,
    once: false,
    execute: async (main: Bot, database: Database, ban: GuildBan) => {
        const guild = ban.guild;
        const thisGuildDb = await database.models.GuildDB.findOne({ id: guild.id });
        if (!thisGuildDb) return;

        thisGuildDb.mod.bans.delete(ban.user.id);
        await thisGuildDb.save();
    }
};

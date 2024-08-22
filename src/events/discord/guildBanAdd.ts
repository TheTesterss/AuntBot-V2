import { AuditLogEvent, Events, Guild, GuildBan, User } from "discord.js";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";
import { EventType } from "../../enums/enums";

export = {
    name: Events.GuildBanAdd,
    type: EventType.Classic,
    once: false,
    execute: async (main: Bot, database: Database, ban: GuildBan) => {
        const guild = ban.guild;
        const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd });
        let mod = logs.entries.find((x) => x.targetId === ban.user.id)?.executorId;

        if (mod === main.djsClient?.user?.id) return;

        const thisGuildDb = await database.models.GuildDB.findOne({ id: guild.id });
        if (!thisGuildDb) return;
        if (!mod) mod = "???";

        thisGuildDb.mod.bans.set(ban.user.id, { date: Date.now(), mod });
        await thisGuildDb.save();
    }
};

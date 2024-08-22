import { Events, Guild } from "discord.js";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";
import { EventType } from "../../enums/enums";

export = {
    name: Events.ClientReady,
    type: EventType.Classic,
    once: true,
    execute: async (main: Bot, database: Database) => {
        const now = Date.now();
        main.djsClient = main.djsClient!;

        const guilds = await main.djsClient.guilds.fetch();

        for (const [guildId, oauthGuild] of guilds) {
            console.log(guildId);
            const guild = await oauthGuild.fetch();

            const thisGuildDb = await database.models.GuildDB.findOne({ id: guildId });

            if (!thisGuildDb) continue;

            const bans = thisGuildDb.mod.bans;
            const tempBans = Array.from(bans.entries()).filter(([, ban]) => ban.endDate);

            for (const [userId, ban] of tempBans) {
                const endDate = ban.endDate!;

                if (endDate <= now) {
                    try {
                        await guild.members.unban(userId);
                    } catch {}
                } else {
                    const remainingTime = endDate - now;

                    setTimeout(async function () {
                        const updatedGuildDb = await database.models.GuildDB.findOne({ id: guildId });
                        const updatedBan = updatedGuildDb?.mod.bans.get(userId);

                        if (!updatedBan || !updatedBan.endDate || updatedBan.endDate > endDate) return;

                        try {
                            await guild.members.unban(userId);
                        } catch {}
                    }, remainingTime);
                }
            }
        }
    }
};

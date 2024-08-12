import { Guild } from "discord.js";
import Bot from "../../classes/Bot";

/**
 * Bannit temporairement un utilisateur
 * @param guild - Le serveur d'où bannir
 * @param userId - L'ID de l'utilisateur à ban
 * @param durationMs - La durée du ban en ms
 * @param reason - La raison du ban
 * @param deleteMessageSeconds - Depuis combien de temps en secondes supprimer les messages de la personne bannie
 * @returns Promise<Boolean> Si la personne a bien pu être bannie
 */
export default async function tempBan(
    bot: Bot,
    guild: Guild,
    userId: string,
    endDate: number,
    reason: string,
    deleteMessageSeconds: number
): Promise<Boolean> {
    let r = true;

    const bannedUsers = await guild.bans.fetch();
    const isUserBanned = bannedUsers ? bannedUsers.some((ban) => ban.user.id === userId) : false;

    if (isUserBanned) {
        r = false;
    } else {
        try {
            await guild.bans.create(userId, { reason, deleteMessageSeconds });
        } catch {
            r = false;
        }
    }

    if (r) {
        setTimeout(async function () {
            const thisGuildDb = await bot.database?.models.GuildDB.findOne({ id: guild.id });
            const dbEndDate = thisGuildDb?.mod.bans.get(userId)?.endDate;
            if (!dbEndDate) return;
            if (dbEndDate > endDate) return;

            try {
                guild.members.unban(userId);
            } catch {}
        }, endDate - Date.now());
    }

    return r;
}

import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Guild,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";
import parseTime from "../../../utils/functions/parseTime";
import tempBan from "../../../utils/functions/tempBan";
import humanizeTime from "../../../utils/functions/humanizeTime";

export const command: CommandDatas = {
    // #region datas
    name: "ban",
    nameLocalizations: {
        fr: "bannir"
    },
    description: "Bans a user.",
    descriptionLocalizations: {
        fr: "Bannit un utilisateur."
    },
    options: [
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "User to ban.",
            descriptionLocalizations: { fr: "L'utilisateur à bannir." },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "Reason for the ban.",
            descriptionLocalizations: { fr: "Raison du bannissement." },
            type: ApplicationCommandOptionType.String,
            required: false,
            maxLength: 512
        },
        {
            name: "duration",
            nameLocalizations: { fr: "durée" },
            description: "Duration of the ban.",
            descriptionLocalizations: { fr: "Durée du bannissement." },
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "notify",
            nameLocalizations: { fr: "notifier" },
            description: "Notify the user about the ban.",
            descriptionLocalizations: { fr: "Notifier l'utilisateur du bannissement." },
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: "Yes, with reason",
                    nameLocalizations: { fr: "Oui, avec raison" },
                    value: "yes_with_reason"
                },
                {
                    name: "Yes, without reason",
                    nameLocalizations: { fr: "Oui, sans raison" },
                    value: "yes_without_reason"
                },
                {
                    name: "No",
                    nameLocalizations: { fr: "Non" },
                    value: "no"
                }
            ]
        },
        {
            name: "prune-time",
            nameLocalizations: { fr: "durée-de-purge" },
            description: "Duration of messages to delete (e.g., '1d 1h').",
            descriptionLocalizations: { fr: "Durée des messages à supprimer (par exemple, '1j 1h')." },
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    customOptions: {
        CanBeReboot: true,
        allowInDms: false,
        blacklistAllowed: false,
        forBotOwnerOnly: false,
        forGuildAdminsOnly: false,
        forGuildOwnerOnly: false,
        inVoiceOnly: false,
        isNSFW: false,
        whitelistDisallowed: false,
        memberRequiredPermissions: ["BanMembers"],
        clientRequiredPermissions: ["BanMembers"]
    },
    types: [ApplicationCommandType.ChatInput],
    // #endregion datas
    execute: async (
        bot: Bot,
        database: Database,
        interaction:
            | ChatInputCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
        _command: CommandDatas,
        lang: LangValues
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;

        const targetUser = interaction.options.getUser("user", true);
        const targetId = targetUser.id;
        const reason = interaction.options.getString("reason", false) || "No reason specified.";
        const notify = interaction.options.getString("notify", false) || "no";
        const pruneTimeInSeconds = parseTime(interaction.options.getString("prune-time", false) || "0s", "s");
        const duration = interaction.options.getString("duration", false);

        let errorEmbed = new EmbedBuilder().setTitle("Error").setColor(bot.colors.false as ColorResolvable);

        if (!interaction.guild) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> This command can only be executed on a server."
                    )
                ]
            });
            return;
        }

        const requestMember = await interaction.guild.members.fetch(interaction.user.id);
        if (!requestMember) return;

        const bannedUsers = await interaction.guild.bans.fetch();
        const isUserBanned = bannedUsers ? bannedUsers.some((ban) => ban.user.id === targetId) : false;

        if (isUserBanned) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> I cannot ban a user who is already banned."
                    )
                ]
            });
            return;
        }

        let targetMember;
        try {
            targetMember = await interaction.guild.members.fetch(targetId);
            if (targetMember) {
                const targetUserRolePosition = targetMember.roles.highest.position;
                const requestUserRolePosition = requestMember.roles.highest.position;

                if (targetUserRolePosition >= requestUserRolePosition) {
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> You cannot ban this member as they have the same or a higher role than you."
                    );

                    await interaction.editReply({ embeds: [errorEmbed] });
                    return;
                }
            }
        } catch {}

        if (pruneTimeInSeconds === null) {
            errorEmbed.setDescription(
                "<:9692redguard:1274033795615424582> Invalid prune duration. Please use the following format: `d` or `j` for days, `h` for hours, `min` for minutes, and `s` for seconds."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        if (pruneTimeInSeconds > 604800) {
            errorEmbed.setDescription(
                "<:9692redguard:1274033795615424582> Invalid prune duration. The total duration cannot exceed 7 days."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        const currentDate = Date.now();
        let dbData: { date: number; mod: string; endDate?: number } = { date: currentDate, mod: interaction.user.id };
        let durationMs;
        if (!duration) {
            try {
                await interaction.guild.bans.create(targetId, {
                    reason: reason,
                    deleteMessageSeconds: pruneTimeInSeconds
                });
            } catch {
                errorEmbed.setDescription("<:9692redguard:1274033795615424582> I couldn't ban this user.");

                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }
        } else {
            durationMs = parseTime(duration);

            if (durationMs === null) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> Invalid ban duration. Please use the following format: `y` for years, `M` or `mon` for months, `w` for weeks, `d` or `j` for days, `h` for hours, `min` for minutes, and `s` for seconds."
                        )
                    ]
                });
                return;
            }

            const endDate = currentDate + durationMs;

            let banned = await tempBan(bot, interaction.guild as Guild, targetId, endDate, reason, pruneTimeInSeconds);

            if (!banned) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription("<:9692redguard:1274033795615424582> I couldn't ban this member.")
                    ]
                });
                return;
            }

            dbData = { endDate, ...dbData };
        }

        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Powered by Aunt Development"
        });

        let sent = false;
        if (notify !== "no") {
            let embedNotif = embed
                .setTitle("You have been banned")
                .setDescription(
                    `<:icons_ban:1275820197370138765> You have been banned from the server ${interaction.guild.name}:\n> <:9829namodicon:1271775961272029206> **Moderator:** ${interaction.user.displayName} (\`${interaction.user.id}\`)`
                );

            if (notify === "yes_with_reason") {
                embedNotif.data.description += `\n > <:6442nanewsicon:1271775861938327592> **Reason:** ${reason}`;
            }

            try {
                await targetUser.send({ embeds: [embedNotif] });
                sent = true;
            } catch {
                sent = false;
            }
        }

        const thisGuildDb = await database.models.GuildDB.findOne({ id: interaction.guild.id });
        if (!thisGuildDb) return;

        thisGuildDb.mod.bans.set(targetId, dbData);
        await thisGuildDb.save();

        embed
            .setTitle(`Banned successfully!`)
            .setDescription(
                `<:icons_ban:1275820197370138765> The member ${targetUser} (\`${targetUser.id}\`) has been banned ${duration ? `for ${humanizeTime(durationMs as number, "ms", lang)} ` : ""}!\n> <:6442nanewsicon:1271775861938327592> **Reason:** ${reason}\n > ${sent ? "The user has been notified." : notify === "no" ? "The user was not notified." : "I couldn't notify the user (their DMs are disabled)."}`
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

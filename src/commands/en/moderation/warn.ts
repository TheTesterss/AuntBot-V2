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
import humanizeTime from "../../../utils/functions/humanizeTime";
import tempBan from "../../../utils/functions/tempBan";

export const command: CommandDatas = {
    // #region datas
    name: "warn",
    nameLocalizations: {
        fr: "avertir"
    },
    description: "Warns a user.",
    descriptionLocalizations: {
        fr: "Avertit un utilisateur."
    },
    options: [
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "User to warn.",
            descriptionLocalizations: { fr: "L'utilisateur à avertir." },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "Reason for the warn.",
            descriptionLocalizations: { fr: "Raison de l'avertissement." },
            type: ApplicationCommandOptionType.String,
            required: false,
            maxLength: 512
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
        memberRequiredPermissions: ["BanMembers", "ModerateMembers"],
        clientRequiredPermissions: ["BanMembers", "ModerateMembers"]
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
        if (!interaction.guild) return;

        const errorEmbed = new EmbedBuilder().setTitle("Error").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Powered by Aunt Development"
        });

        const targetUser = interaction.options.getUser("user", true);
        const targetId = targetUser.id;
        const reason = interaction.options.getString("reason", false) || "No reason specified.";
        const notify = interaction.options.getString("notify", false) || "yes_with_reason";

        if (targetUser.id === interaction.user.id) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("<:9692redguard:1274033795615424582> You cannot warn yourself.")]
            });
            return;
        }

        if (targetUser.bot) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("<:9692redguard:1274033795615424582> You cannot warn a bot.")]
            });
            return;
        }

        const requestMember = await interaction.guild?.members.fetch(interaction.user.id);
        if (!requestMember) return;

        const targetMember = await interaction.guild?.members.fetch(targetId);
        if (!targetMember) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> You cannot warn a user who is not on the server."
                    )
                ]
            });
            return;
        }

        const targetUserRolePosition = targetMember.roles.highest.position;
        const requestUserRolePosition = requestMember.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            errorEmbed.setDescription(
                "<:9692redguard:1274033795615424582> You cannot warn this member because they have the same highest role or a higher role than you."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        const guildId = interaction.guildId;
        const thisGuildDb = await database.models.GuildDB.findOne({ id: guildId });

        if (!thisGuildDb) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> An error occurred with the database."
                    )
                ]
            });
            return;
        }

        thisGuildDb.mod.totalWarns++;

        thisGuildDb.mod.warns.push({
            id: thisGuildDb.mod.totalWarns,
            date: Date.now(),
            mod: interaction.user.id,
            reason,
            target: targetUser.id
        });

        thisGuildDb.save();

        const targetWarns = thisGuildDb.mod.warns.filter((x) => x.target === targetUser.id);
        const actions = thisGuildDb.mod.warnActions.filter((x) => x.warns === targetWarns.length);

        let message;
        if (actions.length !== 0) {
            const action = actions[0];

            if (action.actionType === "timeout") {
                try {
                    await targetMember.timeout(
                        action.duration as number,
                        `Has received a total of ${targetWarns.length} warning${targetWarns.length > 1 ? "s" : ""}. See sanction #${thisGuildDb.mod.totalWarns}.`
                    );
                    message = `> <:icons_timeout:1271775567074824232> The member has been successfully timed out for ${humanizeTime(action.duration as number, "ms", lang)}.`;
                } catch {
                    message = "> <:1523reddot:1274033425292066816> I couldn't timeout this member.";
                }
            } else if (action.actionType === "tempban") {
                const banned = await tempBan(
                    bot,
                    interaction.guild as Guild,
                    targetId,
                    Date.now() + (action.duration as number),
                    `Has received a total of ${targetWarns.length} warning${targetWarns.length > 1 ? "s" : ""}. See sanction #${thisGuildDb.mod.totalWarns}.`,
                    7 * 24 * 60 * 60
                );
                message = banned
                    ? `> <:icons_ban:1275820197370138765> The member has been successfully temp-banned for ${humanizeTime(action.duration as number, "ms", lang)}`
                    : "> <:1523reddot:1274033425292066816> I couldn't temp-ban this member.";
            } else if (action.actionType === "permban") {
                try {
                    await targetMember.ban({
                        reason: `Has received a total of ${targetWarns.length} warning${targetWarns.length > 1 ? "s" : ""}. See sanction #${thisGuildDb.mod.totalWarns}.`,
                        deleteMessageSeconds: 7 * 24 * 60 * 60
                    });
                    message = "> <:icons_ban:1275820197370138765> The member has been successfully permanently banned.";
                } catch {
                    message = "> <:1523reddot:1274033425292066816> I couldn't permanently ban the member.";
                }
            }
        }

        let sent = true;
        if (notify !== "no") {
            let embedNotif = embed
                .setTitle("New Warning")
                .setDescription(
                    `<:icons_dred:1271775677472968746> You have been warned in the server ${interaction.guild?.name}:\n> <:9829namodicon:1271775961272029206> **Moderator:** ${interaction.user.displayName} (\`${interaction.user.id}\`)`
                );

            if (notify === "yes_with_reason") {
                embedNotif.data.description += `\n > <:6442nanewsicon:1271775861938327592> **Reason:** ${reason}`;
            }

            try {
                await targetUser.send({ embeds: [embedNotif] });
            } catch {
                sent = false;
            }
        }

        embed
            .setTitle(`Warning Issued!`)
            .setDescription(
                `<:8181greendot:1274033444006920272> The member ${targetUser} (\`${targetUser?.id}\`) has received a new warning! ${notify === "no" ? "As requested, they were not notified." : sent ? "They have been notified." : "I couldn't notify them (their DMs are disabled)."}\nThey now have ${targetWarns.length} warning${targetWarns.length > 1 ? "s" : ""}.\n\n<:6442nanewsicon:1271775861938327592> Reason:\n> ${reason}\n\n<:4249dndbadge:1274036708676997132> Sanction:\n${message ? message : `> No sanction for ${targetWarns.length} warning${targetWarns.length > 1 ? "s" : ""}.`}`
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

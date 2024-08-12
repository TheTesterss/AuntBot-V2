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
        const reason = interaction.options.getString("reason", false) || "Pas de raison spécifiée.";
        const notify = interaction.options.getString("notify", false) || "no";
        const pruneTimeInSeconds = parseTime(interaction.options.getString("prune-time", false) || "0s", "s");
        const duration = interaction.options.getString("duration", false);

        let errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);

        if (!interaction.guild) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Cette commande ne peut qu'être faite sur un serveur.")]
            });
            return;
        }

        const requestMember = await interaction.guild.members.fetch(interaction.user.id);
        if (!requestMember) return;

        const bannedUsers = await interaction.guild.bans.fetch();
        const isUserBanned = bannedUsers ? bannedUsers.some((ban) => ban.user.id === targetId) : false;

        if (isUserBanned) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Je ne peux pas bannir un utilisateur déjà banni.")]
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
                        "Vous ne pouvez pas bannir ce membre car il a le même plus haut rôle que vous voire un rôle au dessus."
                    );

                    await interaction.editReply({ embeds: [errorEmbed] });
                    return;
                }
            }
        } catch {}

        if (pruneTimeInSeconds === null) {
            errorEmbed.setDescription(
                "Durée de purge invalide. Veuillez utiliser ce format : `d` ou `j` pour les jours, `h` pour les heures, `min` pour les minutes et `s` pour les secondes."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        if (pruneTimeInSeconds > 604800) {
            errorEmbed.setDescription("Durée de purge invalide. La durée totale ne peut excéder 7 jours.");

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
                errorEmbed.setDescription("Je n'ai pas pu bannir cet utilisateur.");

                await interaction.editReply({ embeds: [errorEmbed] });
                return;
            }
        } else {
            durationMs = parseTime(duration);

            if (durationMs === null) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "Durée de bannissement invalide. Veuillez utiliser ce format : `y` pour les années, `M` ou `mon` pour les mois, `w` pour les semaines, `d` ou `j` pour les jours, `h` pour les heures, `min` pour les minutes et `s` pour les secondes."
                        )
                    ]
                });
                return;
            }

            const endDate = currentDate + durationMs;

            let banned = await tempBan(bot, interaction.guild as Guild, targetId, endDate, reason, pruneTimeInSeconds);

            if (!banned) {
                await interaction.editReply({
                    embeds: [errorEmbed.setDescription("Je n'ai pas pu bannir ce membre.")]
                });
                return;
            }

            dbData = { endDate, ...dbData };
        }

        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        let sent = false;
        if (notify !== "no") {
            let embedNotif = embed
                .setTitle("Vous avez été banni")
                .setDescription(
                    `Vous avez été banni du serveur ${interaction.guild.name} :\n> **Modérateur :** ${interaction.user.displayName} (\`${interaction.user.id}\`)`
                );

            if (notify === "yes_with_reason") {
                embedNotif.data.description += `\n > **Raison :** ${reason}`;
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
            .setTitle(`Banni avec succès !`)
            .setDescription(
                `Le membre ${targetUser} (\`${targetUser.id}\`) a bien été banni ${duration ? `pour ${humanizeTime(durationMs as number, "ms", lang)} ` : ""}!\n> **Raison :** ${reason}\n > ${sent ? "L'utilisateur a bien été prévenu." : notify === "no" ? "L'utilisateur n'a pas été prévenu." : "Je n'ai pas pu prévenir l'utilisateur (ses DMs sont désactivés)."}`
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

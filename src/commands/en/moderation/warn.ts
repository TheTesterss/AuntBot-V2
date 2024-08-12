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
        command: CommandDatas,
        lang: LangValues
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;

        const targetUser = interaction.options.getUser("user", true);
        const targetId = targetUser.id;
        const reason = interaction.options.getString("reason", false) || "Pas de raison spécifiée.";
        const notify = interaction.options.getString("notify", false) || "yes_with_reason";

        const errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);

        if (targetUser.id === interaction.user.id) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Vous ne pouvez pas vous avertir vous-même.")]
            });
            return;
        }

        if (targetUser.bot) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Vous ne pouvez pas avertir un bot.")]
            });
            return;
        }

        const requestMember = await interaction.guild?.members.fetch(interaction.user.id);
        if (!requestMember) return;

        const targetMember = await interaction.guild?.members.fetch(targetId);
        if (!targetMember) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription("Vous ne pouvez pas avertir une personne qui n'est pas sur le serveur.")
                ]
            });
            return;
        }

        const targetUserRolePosition = targetMember.roles.highest.position;
        const requestUserRolePosition = requestMember.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            errorEmbed.setDescription(
                "Vous ne pouvez pas avertir ce membre car il a le même plus haut rôle que vous voire un rôle au dessus."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        const guildId = interaction.guildId;
        const thisGuildDb = await database.models.GuildDB.findOne({ id: guildId });

        if (!thisGuildDb) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Une erreur s'est produite avec la base de données.")]
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
                        `A eu un total de ${targetWarns.length} avertissement${targetWarns.length > 1 ? "s" : ""}. Voir sanction #${thisGuildDb.mod.totalWarns}.`
                    );
                    message = `> Le membre a bien été exclu temporairement pendant ${humanizeTime(action.duration as number, "ms", lang)}.`;
                } catch {
                    message = "> Je n'ai pas pu exclure temporairement ce membre.";
                }
            } else if (action.actionType === "tempban") {
                const banned = await tempBan(
                    bot,
                    interaction.guild as Guild,
                    targetId,
                    Date.now() + (action.duration as number),
                    `A eu un total de ${targetWarns.length} avertissement${targetWarns.length > 1 ? "s" : ""}. Voir sanction #${thisGuildDb.mod.totalWarns}.`,
                    7 * 24 * 60 * 60
                );
                message = banned
                    ? `> Le membre a bien été banni temporairement pendant ${humanizeTime(action.duration as number, "ms", lang)}`
                    : "> Je n'ai pas pu bannir temporairement ce membre.";
            } else if (action.actionType === "permban") {
                try {
                    await targetMember.ban({
                        reason: `A eu un total de ${targetWarns.length} avertissement${targetWarns.length > 1 ? "s" : ""}. Voir sanction #${thisGuildDb.mod.totalWarns}.`,
                        deleteMessageSeconds: 7 * 24 * 60 * 60
                    });
                    message = "> Le membre a bien été banni définitivement.";
                } catch {
                    message = "> Je n'ai pas pu bannir définitivement le membre.";
                }
            }
        }

        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        let sent = true;
        if (notify !== "no") {
            let embedNotif = embed
                .setTitle("Nouvel avertissement")
                .setDescription(
                    `Vous venez d'être averti du serveur ${interaction.guild?.name} :\n> **Modérateur :** ${interaction.user.displayName} (\`${interaction.user.id}\`)`
                );

            if (notify === "yes_with_reason") {
                embedNotif.data.description += `\n > **Raison :** ${reason}`;
            }

            try {
                await targetUser.send({ embeds: [embedNotif] });
            } catch {
                sent = false;
            }
        }

        embed
            .setTitle(`Avertissement donné !`)
            .setDescription(
                `Le membre ${targetUser} (\`${targetUser?.id}\`) a bien reçu un nouvel avertissement ! ${notify === "no" ? "Comme demandé, il n'a pas été prévenu." : sent ? "Il a bien été averti." : "Je n'ai pas pu l'avertir (ses DMs sont désactivés)."}\nIl a désormais ${targetWarns.length} avertissement${targetWarns.length > 1 ? "s" : ""}.\n\nRaison :\n> ${reason}\n\nSanction :\n${message ? message : `> Aucune sanction pour ${targetWarns.length} avertissement${targetWarns.length > 1 ? "s" : ""}.`}`
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";
import parseTime from "../../../utils/functions/parseTime";

export const command: CommandDatas = {
    // #region datas
    name: "softban",
    nameLocalizations: {
        fr: "softban"
    },
    description: "Bans and unbans a user to clear their messages.",
    descriptionLocalizations: {
        fr: "Bannit puis débannit un utilisateur pour supprimer ses messages."
    },
    options: [
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "User to softban.",
            descriptionLocalizations: { fr: "L'utilisateur à softban." },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "Reason for the softban.",
            descriptionLocalizations: { fr: "Raison du softban." },
            type: ApplicationCommandOptionType.String,
            required: false,
            maxLength: 512
        },
        {
            name: "notify",
            nameLocalizations: { fr: "notifier" },
            description: "Notify the user about the softban.",
            descriptionLocalizations: { fr: "Notifier l'utilisateur du softban." },
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
            description: "Duration of messages to delete, default: 7d (e.g., '1d 1h').",
            descriptionLocalizations: { fr: "Durée des messages à supprimer, par défaut : 7j (par exemple, '1j 1h')." },
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
        _database: Database,
        interaction:
            | ChatInputCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
        _command: CommandDatas,
        _lang: LangValues
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;

        const targetUser = interaction.options.getUser("user", true);
        const targetId = targetUser.id;
        const reason = interaction.options.getString("reason", false) || "Pas de raison spécifiée.";
        const notify = interaction.options.getString("notify", false) || "no";
        const pruneTimeInSeconds = parseTime(interaction.options.getString("prune-time", false) || "7d", "s");

        let errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);
        const requestMember = await interaction.guild?.members.fetch(interaction.user.id);
        if (!requestMember) return;

        const bannedUsers = await interaction.guild?.bans.fetch();
        const isUserBanned = bannedUsers ? bannedUsers.some((ban) => ban.user.id === targetId) : false;

        if (isUserBanned) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Je ne peux pas bannir un utilisateur déjà banni."
                    )
                ]
            });
            return;
        }

        let targetMember;
        try {
            targetMember = await interaction.guild?.members.fetch(targetId);
            if (targetMember) {
                const targetUserRolePosition = targetMember.roles.highest.position;
                const requestUserRolePosition = requestMember.roles.highest.position;

                if (targetUserRolePosition >= requestUserRolePosition) {
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Vous ne pouvez pas bannir ce membre car il a le même plus haut rôle que vous voire un rôle au dessus."
                    );

                    await interaction.editReply({ embeds: [errorEmbed] });
                    return;
                }
            }
        } catch {}

        if (pruneTimeInSeconds === null) {
            errorEmbed.setDescription(
                "<:9692redguard:1274033795615424582> Durée de purge invalide. Veuillez utiliser ce format : `d` ou `j` pour les jours, `h` pour les heures, `min` pour les minutes et `s` pour les secondes."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        if (pruneTimeInSeconds > 604800) {
            errorEmbed.setDescription(
                "<:9692redguard:1274033795615424582> Durée de purge invalide. La durée totale ne peut excéder 7 jours."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        try {
            await interaction.guild?.bans.create(targetId, {
                reason: reason,
                deleteMessageSeconds: pruneTimeInSeconds
            });
        } catch {
            errorEmbed.setDescription("<:9692redguard:1274033795615424582> Je n'ai pas pu bannir cet utilisateur.");

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        await interaction.guild?.bans.remove(targetId);

        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        let sent = false;
        if (notify !== "no") {
            let embedNotif = embed
                .setTitle("Vous avez été softban")
                .setDescription(
                    `<:icons_ban:1275820197370138765> Vous avez été softban du serveur ${interaction.guild?.name} :\n> <:9829namodicon:1271775961272029206> **Modérateur :** ${interaction.user.displayName} (\`${interaction.user.id}\`)`
                );

            if (notify === "yes_with_reason") {
                embedNotif.data.description += `\n > <:6442nanewsicon:1271775861938327592> **Raison :** ${reason}`;
            }

            try {
                await targetUser.send({ embeds: [embedNotif] });
                sent = true;
            } catch {
                sent = false;
            }
        }

        embed
            .setTitle(`Softban avec succès !`)
            .setDescription(
                `Le membre ${targetUser} (\`${targetUser.id}\`) a bien été softban !\n> **Raison :** ${reason}\n > ${sent ? "L'utilisateur a bien été prévenu." : notify === "no" ? "L'utilisateur n'a pas été prévenu." : "Je n'ai pas pu prévenir l'utilisateur (ses DMs sont désactivés)."}`
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

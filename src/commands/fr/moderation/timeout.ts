import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    GuildMember,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";
import parseTime from "../../../utils/functions/parseTime";
import humanizeTime from "../../../utils/functions/humanizeTime";

export const command: CommandDatas = {
    // #region datas
    name: "timeout",
    nameLocalizations: {
        fr: "timeout"
    },
    description: "Timeouts a user for a specific duration.",
    descriptionLocalizations: {
        fr: "Met un membre en timeout pour une durée spécifiée."
    },
    options: [
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "Le membre à mettre en timeout.",
            descriptionLocalizations: { fr: "Le membre à mettre en timeout." },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "duration",
            nameLocalizations: { fr: "durée" },
            description: "Timeout duration (e.g. 1d 1h 30min).",
            descriptionLocalizations: { fr: "La durée du timeout (ex: 1j 1h 30min)." },
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "The reason for the timeout.",
            descriptionLocalizations: { fr: "La raison du timeout." },
            type: ApplicationCommandOptionType.String,
            required: false,
            maxLength: 512
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
        memberRequiredPermissions: ["ModerateMembers"],
        clientRequiredPermissions: ["ModerateMembers"]
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
        lang: LangValues
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;
        if (!interaction.guild) return;

        const errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        const targetMember = interaction.options.getMember("user") as GuildMember;

        const durationInput = interaction.options.getString("duration")!;
        const reason = interaction.options.getString("reason") || "Aucune raison spécifiée.";

        const requestUser = await interaction.guild.members.fetch(interaction.user.id);

        if (!targetMember) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Vous ne pouvez pas exclure temporairement un utilisateur qui n'est pas sur le serveur."
                    )
                ]
            });
            return;
        }

        if (targetMember.id === interaction.guild.ownerId) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription("Vous ne pouvez pas exclure temporairement le propriétaire du serveur.")
                ]
            });
            return;
        }

        if (requestUser.roles.highest.position <= targetMember.roles.highest.position) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Vous ne pouvez pas exclure temporairement un utilisateur avec un rôle supérieur ou égal au vôtre."
                    )
                ]
            });
            return;
        }

        const durationMs = parseTime(durationInput);
        if (!durationMs) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Durée invalide. Veuillez utiliser ce format : `d` ou `j` pour les jours, `h` pour les heures, `min` pour les minutes et `s` pour les secondes."
                    )
                ]
            });
            return;
        }

        if (durationMs > 7 * 24 * 60 * 60 * 1000) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Durée invalide. La durée totale ne peut pas excéder 7 jours.")]
            });
            return;
        }

        try {
            await targetMember.timeout(durationMs, reason);
            await interaction.editReply({
                embeds: [
                    embed.setDescription(
                        `L'utilisateur ${targetMember.user} a été exlcu pour ${humanizeTime(durationMs, "ms", lang)}. \n**Raison**: ${reason}`
                    )
                ]
            });
        } catch {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription("Une erreur s'est produite lors d'exclusion temporaire de l'utilisateur.")
                ]
            });
        }
    }
};

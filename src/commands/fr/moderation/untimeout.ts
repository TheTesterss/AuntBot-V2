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

export const command: CommandDatas = {
    // #region datas
    name: "untimeout",
    nameLocalizations: {
        fr: "untimeout"
    },
    description: "Removes the timeout from a user.",
    descriptionLocalizations: {
        fr: "Retire le timeout d'un membre."
    },
    options: [
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "The member whose timeout is to be removed.",
            descriptionLocalizations: { fr: "Le membre dont le timeout doit être retiré." },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "The untimeout reason.",
            descriptionLocalizations: { fr: "La raison de l'untimeout." },
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
        _lang: LangValues
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;
        if (!interaction.guild) return;

        const errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        const targetMember = interaction.options.getMember("user") as GuildMember;
        const reason = interaction.options.getString("reason") || "Aucune raison spécifiée.";

        const requestUser = await interaction.guild.members.fetch(interaction.user.id);

        if (!targetMember) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Vous ne pouvez pas retirer le timeout d'un utilisateur qui n'est pas sur le serveur."
                    )
                ]
            });
            return;
        }

        if (requestUser.roles.highest.position <= targetMember.roles.highest.position) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Vous ne pouvez pas retirer le timeout d'un utilisateur avec un rôle supérieur ou égal au vôtre."
                    )
                ]
            });
            return;
        }

        if (!targetMember.communicationDisabledUntil) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Cet utilisateur n'est pas exclu temporairement.")]
            });
            return;
        }

        try {
            await targetMember.timeout(null, reason);
            await interaction.editReply({
                embeds: [
                    embed.setDescription(
                        `Le timeout de ${targetMember.user} a été levé avec succès. \n**Raison**: ${reason}`
                    )
                ]
            });
        } catch {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Une erreur s'est produite lors de l'untimeout.")]
            });
        }
    }
};

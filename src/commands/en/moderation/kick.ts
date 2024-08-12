import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    GuildMember
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    // #region datas
    name: "kick",
    nameLocalizations: {
        fr: "expulser"
    },
    description: "Kicks a user from the server.",
    descriptionLocalizations: {
        fr: "Expulse un utilisateur du serveur."
    },
    options: [
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "The user to kick.",
            descriptionLocalizations: {
                fr: "L'utilisateur à expulser."
            },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "The reason for kicking the user.",
            descriptionLocalizations: {
                fr: "La raison de l'expulsion de l'utilisateur."
            },
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
        memberRequiredPermissions: ["KickMembers"],
        clientRequiredPermissions: ["KickMembers"]
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

        if (!targetMember) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription("Vous ne pouvez pas expulser un utiliser qui n'est pas sur le serveur.")
                ]
            });
            return;
        }

        const requestMember = (await interaction.guild?.members.fetch(interaction.user.id)) as GuildMember;

        if (targetMember.id === interaction.guild.ownerId) {
            await interaction.reply({
                embeds: [errorEmbed.setDescription("Vous ne pouvez pas exclure le propriétaire du serveur.")],
                ephemeral: true
            });
            return;
        }

        if (requestMember.roles.highest.position <= targetMember.roles.highest.position) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Vous ne pouvez pas expulser cet utilisateur car il est plus haut ou au même niveau que vous dans la hierarchie."
                    )
                ]
            });
            return;
        }

        if (!targetMember.kickable) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "Je ne peux pas expulser cet utilisateur. Il est peut-être plus haut que moi dans la hiérarchie."
                    )
                ]
            });
            return;
        }

        try {
            await targetMember.kick(reason);
            await interaction.editReply({
                embeds: [
                    embed.setDescription(
                        `L'utilisateur ${targetMember.user.tag} a été expulsé avec succès. \n**Raison**: ${reason}`
                    )
                ]
            });
        } catch {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Une erreur s'est produite lors de l'expulsion de l'utilisateur.")]
            });
        }
    }
};

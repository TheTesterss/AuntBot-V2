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

        const errorEmbed = new EmbedBuilder().setTitle("Error").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Powered by Aunt Development"
        });

        const targetMember = interaction.options.getMember("user") as GuildMember;
        const reason = interaction.options.getString("reason") || "No reason specified.";

        if (!targetMember) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> You cannot kick a user who is not in the server."
                    )
                ]
            });
            return;
        }

        const requestMember = (await interaction.guild?.members.fetch(interaction.user.id)) as GuildMember;

        if (targetMember.id === interaction.guild.ownerId) {
            await interaction.reply({
                embeds: [
                    errorEmbed.setDescription("<:9692redguard:1274033795615424582> You cannot kick the server owner.")
                ],
                ephemeral: true
            });
            return;
        }

        if (requestMember.roles.highest.position <= targetMember.roles.highest.position) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> You cannot kick this user because they are higher or at the same level as you in the hierarchy."
                    )
                ]
            });
            return;
        }

        if (!targetMember.kickable) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> I cannot kick this user. They may be higher than me in the hierarchy."
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
                        `<:icons_kick:1271775530634444902> The user ${targetMember.user.tag} was successfully kicked. \n<:6442nanewsicon:1271775861938327592> **Reason**: ${reason}`
                    )
                ]
            });
        } catch {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> An error occurred while trying to kick the user."
                    )
                ]
            });
        }
    }
};

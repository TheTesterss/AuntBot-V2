import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    TextChannel,
    ThreadChannel,
    TextBasedChannel,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    ChannelType
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    // #region datas
    name: "unlock",
    nameLocalizations: {
        fr: "déverrouiller"
    },
    description: "Unlocks a channel to allow @everyone to send messages.",
    descriptionLocalizations: {
        fr: "Déverrouille un salon pour permettre à @everyone d'envoyer des messages."
    },
    options: [
        {
            name: "channel",
            nameLocalizations: { fr: "salon" },
            description: "The channel to unlock. If not specified, the current channel will be unlocked.",
            descriptionLocalizations: {
                fr: "Le salon à déverrouiller. Si non spécifié, le salon actuel sera déverrouillé."
            },
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildStageVoice,
                ChannelType.PrivateThread,
                ChannelType.PublicThread,
                ChannelType.GuildVoice
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
        memberRequiredPermissions: ["ManageChannels"],
        clientRequiredPermissions: ["ManageChannels"]
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

        const errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        const channel = (interaction.options.getChannel("channel", false) as TextBasedChannel) || interaction.channel;

        if (!channel || !channel.isTextBased()) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Salon invalide ou ce type de salon ne peut pas être déverrouillé."
                    )
                ]
            });
            return;
        }

        try {
            if (channel.isThread()) {
                const threadChannel = channel as ThreadChannel;
                await threadChannel.setLocked(false);
                await interaction.editReply({
                    embeds: [
                        embed.setDescription(
                            `<:8181greendot:1274033444006920272> Le thread <#${channel.id}> a été déverrouillé avec succès.`
                        )
                    ]
                });
            } else {
                const textChannel = channel as TextChannel;
                await textChannel.permissionOverwrites.edit(textChannel.guild.roles.everyone, { SendMessages: null });
                await interaction.editReply({
                    embeds: [
                        embed.setDescription(
                            `<:8181greendot:1274033444006920272> Le salon <#${channel.id}> a été déverrouillé avec succès.`
                        )
                    ]
                });
            }
        } catch {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Une erreur s'est produite lors du déverrouillage du salon."
                    )
                ]
            });
        }
    }
};

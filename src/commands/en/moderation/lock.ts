import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    TextChannel,
    ThreadChannel,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    TextBasedChannel,
    ChannelType
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    // #region datas
    name: "lock",
    nameLocalizations: {
        fr: "verrouiller"
    },
    description: "Locks a channel to prevent @everyone from sending messages.",
    descriptionLocalizations: {
        fr: "Verrouille un salon pour empêcher @everyone d'envoyer des messages."
    },
    options: [
        {
            name: "channel",
            nameLocalizations: { fr: "salon" },
            description: "The channel to lock. If not specified, the current channel will be locked.",
            descriptionLocalizations: {
                fr: "Le salon à verrouiller. Si non spécifié, le salon actuel sera verrouillé."
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

        const errorEmbed = new EmbedBuilder().setTitle("Error").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Powered by Aunt Development"
        });

        const channel = (interaction.options.getChannel("channel", false) as TextBasedChannel) || interaction.channel;

        if (!channel || !channel.isTextBased()) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Invalid channel or this type of channel cannot be locked."
                    )
                ]
            });
            return;
        }

        try {
            if (channel.isThread()) {
                const threadChannel = channel as ThreadChannel;
                await threadChannel.setLocked(true);
                await interaction.editReply({
                    embeds: [
                        embed.setDescription(
                            `<:8181greendot:1274033444006920272> The thread <#${channel.id}> has been successfully locked.`
                        )
                    ]
                });
            } else {
                const textChannel = channel as TextChannel;
                await textChannel.permissionOverwrites.edit(textChannel.guild.roles.everyone, { SendMessages: false });
                await interaction.editReply({
                    embeds: [
                        embed.setDescription(
                            `<:8181greendot:1274033444006920272> The channel <#${channel.id}> has been successfully locked.`
                        )
                    ]
                });
            }
        } catch {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> An error occurred while locking the channel."
                    )
                ]
            });
        }
    }
};

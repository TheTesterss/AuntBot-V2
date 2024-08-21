import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Message,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    // #region datas
    name: "conversation",
    nameLocalizations: {
        fr: "conversation"
    },
    description: "Manage conversations",
    descriptionLocalizations: {
        fr: "Gérer les conversations"
    },
    options: [
        {
            name: "delete",
            nameLocalizations: {
                fr: "effacer"
            },
            description: "Delete a series of messages between two timestamps.",
            descriptionLocalizations: {
                fr: "Supprimer une série de messages entre deux timestamps."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "first_message",
                    nameLocalizations: {
                        fr: "premier_message"
                    },
                    description: "The ID of the first message to delete.",
                    descriptionLocalizations: {
                        fr: "L'ID du premier message à supprimer."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "last_message",
                    nameLocalizations: {
                        fr: "dernier_message"
                    },
                    description: "The ID of the last message to delete (optional).",
                    descriptionLocalizations: {
                        fr: "L'ID du dernier message à supprimer (facultatif)."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false
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
        memberRequiredPermissions: ["ManageMessages"],
        clientRequiredPermissions: ["ManageMessages"]
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

        const channel = interaction.channel;

        if (!channel?.isTextBased() || channel.isDMBased()) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> This command cannot be used in this channel."
                    )
                ]
            });
            return;
        }

        const firstMessageId = interaction.options.getString("first_message", true);
        const lastMessageId = interaction.options.getString("last_message");

        const replyMessage = await interaction.editReply({
            embeds: [embed.setDescription("Deleting messages...")]
        });

        try {
            const firstMessage = await channel.messages.fetch(firstMessageId);
            if (!firstMessage) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> The specified first message could not be found in this channel."
                        )
                    ]
                });
                return;
            }

            let lastMessage: Message | undefined;
            if (lastMessageId) {
                lastMessage = await channel.messages.fetch(lastMessageId);
                if (!lastMessage) {
                    await interaction.editReply({
                        embeds: [
                            errorEmbed.setDescription(
                                "<:9692redguard:1274033795615424582> The specified last message could not be found in this channel."
                            )
                        ]
                    });
                    return;
                }
            } else {
                lastMessage = replyMessage;
            }

            if (firstMessage.createdTimestamp > lastMessage.createdTimestamp) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> The first message cannot be more recent than the last message."
                        )
                    ]
                });
                return;
            }

            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            if (lastMessage.createdTimestamp < twoWeeksAgo) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> The specified last message is older than 2 weeks and cannot be deleted."
                        )
                    ]
                });
                return;
            }

            const messagesToDelete: Message[] = [firstMessage];
            let lastFetchedMessageId = firstMessageId;

            let i = 0;
            while (true) {
                i++;
                const fetchedMessages = await channel.messages.fetch({
                    after: lastFetchedMessageId,
                    limit: 100
                });

                if (fetchedMessages.size === 0) break;

                messagesToDelete.push(...fetchedMessages.values());

                if (fetchedMessages.some((msg) => msg.createdTimestamp >= lastMessage!.createdTimestamp)) {
                    break;
                }

                lastFetchedMessageId = fetchedMessages.first()?.id!;
            }

            const filteredMessages = messagesToDelete.filter(
                (msg) =>
                    msg.createdTimestamp >= firstMessage.createdTimestamp &&
                    msg.createdTimestamp <= lastMessage.createdTimestamp &&
                    msg.id !== replyMessage.id
            );

            let totalDeleted = 0;
            for (let i = 0; i < filteredMessages.length; i += 100) {
                const bulkMessages = filteredMessages.slice(i, i + 100);
                const deletedMessages = await channel.bulkDelete(bulkMessages, true);
                totalDeleted += deletedMessages.size;
            }

            const totalToDelete = filteredMessages.length;
            const description =
                totalDeleted === totalToDelete
                    ? `<:8181greendot:1274033444006920272> The conversation (of ${totalDeleted} messages) was successfully deleted.`
                    : `<:3100yellowdot:1274033394430377985> The conversation was partially deleted. ${totalDeleted}/${totalToDelete} messages were deleted. The others couldn't be deleted as they are older than 2 weeks.`;

            await interaction.editReply({
                embeds: [embed.setDescription(description)]
            });
        } catch {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> An error occurred while deleting the messages."
                    )
                ]
            });
        }
    }
};

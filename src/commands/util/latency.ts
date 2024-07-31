import {
    ApplicationCommandType,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from 'discord.js';
import { CommandDatas } from '../../enums/Interfaces';
import Bot from '../../classes/Bot';
import Database from '../../classes/Database';
import { LangValues } from '../../enums/enums';

export const command: CommandDatas = {
    name: 'latencies',
    nameLocalizations: {
        fr: 'latences'
    },
    description: 'Show the differents client latencies.',
    descriptionLocalizations: {
        fr: 'Affiche les différentes latences du client.'
    },
    options: [],
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
        memberRequiredPermissions: [],
        clientrequiredPermissions: []
    },
    types: [ApplicationCommandType.ChatInput],
    execute: async (
        bot: Bot,
        database: Database,
        interaction: CommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
        command: CommandDatas,
        lang: LangValues
    ): Promise<void> => {
        let embed = new EmbedBuilder()
            .setColor(bot.colors.true as ColorResolvable)
            .setFooter({
                iconURL: interaction.client.user.avatarURL() ?? undefined,
                text: bot.embed.footers['200'][lang]
            });

        let message = await interaction.editReply({
            embeds: [embed.setDescription(bot.embed.descriptions.latencies_fetching[lang])]
        });
        await message.edit({
            embeds: [
                embed.setDescription(bot.embed.descriptions.latencies_updated[lang]).addFields({
                    name: bot.embed.fields.latencies_updated.name.replaceAll(
                        '{date}',
                        Math.round(Date.now() / 1000).toString()
                    ),
                    value: bot.embed.fields.latencies_updated['0'][lang]
                        .replaceAll('{ws.ping}', bot.djsClient!.ws.ping.toString())
                        .replaceAll(
                            '{response.ping}',
                            Math.round(message.createdTimestamp / interaction.createdTimestamp).toString()
                        )
                        .replaceAll(
                            '{connection.timestamp}',
                            Math.round(bot.djsClient!.readyTimestamp! / 1000).toString()
                        ),
                    inline: true
                })
            ]
        });
    }
};

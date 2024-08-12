import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    name: "latencies",
    nameLocalizations: {
        fr: "latences"
    },
    description: "Show the differents client latencies.",
    descriptionLocalizations: {
        fr: "Affiche les différentes latences du client."
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
        clientRequiredPermissions: []
    },
    types: [ApplicationCommandType.ChatInput],
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
        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Powered by Aunt Development"
        });

        let message = await interaction.editReply({
            embeds: [embed.setDescription(`${bot.customEmojis.chat} - Fetching latencies...`)]
        });
        await message.edit({
            embeds: [
                embed.setDescription(`${bot.customEmojis.chat} - Latencies fetched.`).addFields({
                    name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                    value: `${bot.customEmojis.stats} - **Gateway MS** - \`${bot.djsClient!.ws.ping}ms\`\n${bot.customEmojis.stats} - **Response MS** - \`${Math.round(message.createdTimestamp / interaction.createdTimestamp)}ms\`\n${bot.customEmojis.stats} - **Connected** - <t:${Math.round(bot.djsClient!.readyTimestamp! / 1000)}:R>`,
                    inline: true
                })
            ]
        });
    }
};

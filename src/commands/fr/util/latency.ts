import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from 'discord.js';
import { CommandDatas } from '../../../enums/Interfaces';
import Bot from '../../../classes/Bot';
import Database from '../../../classes/Database';
import { LangValues } from '../../../enums/enums';

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
        clientRequiredPermissions: undefined
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
            text: 'Alimenté par Aunt Développement'
        });

        let message = await interaction.editReply({
            embeds: [embed.setDescription(`<:1422navoteicon:1271775782426902598> - Recherche des latences...`)]
        });
        await message.edit({
            embeds: [
                embed.setDescription(`<:1422navoteicon:1271775782426902598> - Latences trouvées.`).addFields({
                    name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                    value: `<:8614naboosticon:1271775921166221312> - **MS Passerelle** - \`${bot.djsClient!.ws.ping}ms\`\n<:6123nacompassicon:1271775852434034688> - **MS Réponse** - \`${Math.round(message.createdTimestamp / interaction.createdTimestamp)}ms\`\n<:7506namodcommunityicon:1271775882595536926> - **Connecté** - <t:${Math.round(bot.djsClient!.readyTimestamp! / 1000)}:R>`,
                    inline: true
                })
            ]
        });
    }
};

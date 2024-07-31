import {
    CommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    EmbedBuilder,
    ColorResolvable,
    ButtonInteraction,
    AnySelectMenuInteraction
} from 'discord.js';
import Bot from '../../classes/Bot';
import { errorEmbedType, LangType } from '../../enums/Types';

export const errorEmbed = async (
    main: Bot,
    interaction:
        | ButtonInteraction
        | AnySelectMenuInteraction
        | CommandInteraction
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction,
    lang: LangType,
    text: 'adding' | 'removing' | 'interaction'
) => {
    let embed = new EmbedBuilder()
        .setDescription(main.error_embed.descriptions[text][lang])
        .setColor(main.colors.false as ColorResolvable)
        .setFooter({
            text: main.error_embed.footers[403][lang],
            iconURL: interaction.client.user.avatarURL() ?? undefined
        })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
};

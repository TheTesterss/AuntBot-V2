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
import { LangType } from '../../enums/Types';
import { LangValues } from '../../enums/enums';

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
        .setColor(main.colors.false as ColorResolvable)
        .setFooter({
            text: lang === LangValues.EN ? 'Powered by Aunt Development' : 'Alimenté par Aunt Développement',
            iconURL: interaction.client.user.avatarURL() ?? undefined
        })
        .setTimestamp();

    switch (text) {
        case 'adding':
            embed.setDescription(
                lang === LangValues.EN
                    ? "This user can't be added into the list."
                    : 'Cette utilisateur ne peut être ajouté dans la liste.'
            );
            break;
        case 'removing':
            embed.setDescription(
                lang === LangValues.EN
                    ? "This user can't be removed into the list."
                    : 'Cette utilisateur ne peut être retiré dans la liste.'
            );
            break;
        case 'interaction':
            embed.setDescription(
                lang === LangValues.EN ? 'This interaction is not yours.' : "Cette intéraction n'est pas la tienne."
            );
            break;
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
};

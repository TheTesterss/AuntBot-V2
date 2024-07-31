import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ColorResolvable,
    CommandInteraction,
    Embed,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuComponent,
    UserContextMenuCommandInteraction
} from 'discord.js';
import Bot from '../../classes/Bot';

const getComponents = (value1: boolean, value2: boolean): ActionRowBuilder<ButtonBuilder> => {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('back')
                .setDisabled(value1)
                .setLabel('Go back?')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('errors')
                .setDisabled(value2)
                .setLabel('Informations about discord errors?')
                .setStyle(ButtonStyle.Danger)
        ) as ActionRowBuilder<ButtonBuilder>;
};

export const handleError = async (
    main: Bot,
    interaction: CommandInteraction | UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction,
    error: any
) => {
    let embed = new EmbedBuilder()
        .setDescription(
            `### ${error.message}\n\n\`\`\`ts\n${error.stack}\`\`\`\n>>> **Don't you know what are errors about? Click the button to show!**`
        )
        .setColor(main.colors.false as ColorResolvable)
        .setFooter({ text: error.name, iconURL: interaction.client.user.avatarURL() ?? undefined })
        .setTimestamp();

    let message = await interaction.editReply({ embeds: [embed], components: [getComponents(true, false)] });
    let collected = message.createMessageComponentCollector({ time: 60_000 });

    collected.on('collect', async (i: ButtonInteraction) => {
        if (!i.deferred) await i.deferUpdate();
        if (i.user?.id !== interaction.user.id)
            return void i.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("This interaction is reserved to the command's author.")
                        .setColor(main.colors.false as ColorResolvable)
                        .setFooter({
                            iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                            text: 'Try by yourself this command!'
                        })
                ]
            });
        if (i.customId === 'errors') {
            const embed1 = new EmbedBuilder()
                .setColor(main.colors.true as ColorResolvable)
                .setDescription(
                    `### Sadly Aunt is including few errors, by reporting them on the support you contribute a lot to the project.\n\n>>> \`Discord APIError: Unkown interaction\`\n➜ This error directly comes from **Discord**.\n\`TypeError: Cannont read/set property '...' of undefined\`\n➜ A common variable is used without being defined, report that immediatly.\n\`DiscordAPIError: Invalid Form Body\`\n➜ The program sent a request to the Discord api with missing arguments.\n\`FetchError; request to [...] failed, reason: [...]\`\n➜ The request to Discord failed for some reasons.`
                )
                .setFooter({
                    text: 'This represents most frequents errors not including all discord errors. For uknow errors, contact immediatly us.',
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined
                });

            message.edit({ embeds: [embed1], components: [getComponents(false, true)] });
        }
        if (i.customId === 'back') {
            let embed = new EmbedBuilder()
                .setDescription(
                    `### ${error.message}\n\n\`\`\`ts\n${error.stack}\`\`\`\n>>> **Don't you know what are errors about? Click the button to show!**`
                )
                .setColor(main.colors.false as ColorResolvable)
                .setFooter({ text: error.name, iconURL: interaction.client.user.avatarURL() ?? undefined })
                .setTimestamp();

            await message.edit({ embeds: [embed], components: [getComponents(true, false)] });
        }
    });
};

import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    // #region datas
    name: "bans",
    nameLocalizations: {
        fr: "bannissements"
    },
    description: "Bans",
    descriptionLocalizations: {
        fr: "Bans"
    },
    options: [
        {
            name: "view",
            nameLocalizations: {
                fr: "voir"
            },
            description: "Displays server bans.",
            descriptionLocalizations: {
                fr: "Affiche les bannissements du serveur."
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    nameLocalizations: { fr: "id" },
                    description: "ID of a banned person whose ban you wish to see.",
                    descriptionLocalizations: {
                        fr: "ID d'une personne bannie dont vous souhaitez voir le bannissement."
                    },
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    minLength: 16,
                    maxLength: 20
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
        memberRequiredPermissions: [],
        clientRequiredPermissions: []
    },
    types: [ApplicationCommandType.ChatInput],
    // #endregion datas
    execute: async (
        bot: Bot,
        database: Database,
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

        if (!interaction.guild) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> This command can only be executed on a server."
                    )
                ]
            });
            return;
        }

        const fetchedBans = await interaction.guild.bans.fetch();
        let bans = Array.from(fetchedBans.values());

        if (bans.length === 0) {
            await interaction.editReply({ embeds: [embed.setDescription("No bans to display.")] });
            return;
        }

        const thisGuildDb = await database.models.GuildDB.findOne({ id: interaction?.guild?.id });
        bans = bans.sort((a, b) => {
            const dateA = thisGuildDb?.mod.bans.get(a.user.id)?.date || 0;
            const dateB = thisGuildDb?.mod.bans.get(b.user.id)?.date || 0;
            return dateA - dateB;
        });

        let i = 0;

        const targetId = interaction.options.getString("id");
        if (targetId) {
            i = bans.findIndex((b) => b.user.id === targetId);

            if (i === -1) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> No banned person found with this ID."
                        )
                    ]
                });
                return;
            }
        }

        const firstButton = new ButtonBuilder().setLabel("⏮️").setStyle(ButtonStyle.Secondary).setCustomId("first");
        const previousButton = new ButtonBuilder().setLabel("◀️").setStyle(ButtonStyle.Secondary).setCustomId("prev");
        const pageButton = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId("page");
        const nextButton = new ButtonBuilder().setLabel("▶️").setStyle(ButtonStyle.Secondary).setCustomId("next");
        const lastButton = new ButtonBuilder().setLabel("⏭️").setStyle(ButtonStyle.Secondary).setCustomId("last");

        const updateButtons = () => {
            return new ActionRowBuilder<ButtonBuilder>().addComponents(
                firstButton.setDisabled(i === 0),
                previousButton.setDisabled(i === 0),
                pageButton.setLabel(`${i + 1}/${bans.length}`),
                nextButton.setDisabled(i + 1 === bans.length),
                lastButton.setDisabled(i + 1 === bans.length)
            );
        };

        const updateMessage = async (interactionToUpdate: ButtonInteraction | ModalSubmitInteraction) => {
            if (interactionToUpdate instanceof ModalSubmitInteraction && !interactionToUpdate.isFromMessage()) return;

            const dbInfos = thisGuildDb?.mod.bans.get(bans[i].user.id);
            await interactionToUpdate.update({
                embeds: [
                    embed
                        .setTitle(`Server Bans`)
                        .setDescription(
                            `> <:icons_ban:1275820197370138765> **Banned User:** ${bans[i].user.displayName} (\`${bans[i].user.id}\`)\n> <:9829namodicon:1271775961272029206> **Moderator:** ${dbInfos ? `<@${dbInfos.mod}> (\`${dbInfos.mod}\`)` : "Unknown moderator."}\n> <:6442nanewsicon:1271775861938327592> **Reason:** ${bans[i].reason}\n> <:8045slowmode:1275825495103111301> **Date:** ${dbInfos ? `<t:${Math.round(dbInfos.date / 1000)}:F>` : "Unknown date."}\n> <:icons_timeout:1271775567074824232> **Temporary Ban:** ${dbInfos?.endDate ? `Yes (expires <t:${Math.round(dbInfos.endDate / 1000)}:R>).` : "No."}`
                        )
                ],
                components: bans.length === 1 ? [] : [updateButtons()]
            });
        };

        const dbInfos = thisGuildDb?.mod.bans.get(bans[i].user.id);
        let message = await interaction.editReply({
            embeds: [
                embed
                    .setTitle(`Server Bans`)
                    .setDescription(
                        `> <:icons_ban:1275820197370138765> **Banned User:** ${bans[i].user.displayName} (\`${bans[i].user.id}\`)\n> <:9829namodicon:1271775961272029206> **Moderator:** ${dbInfos ? `<@${dbInfos.mod}> (\`${dbInfos.mod}\`)` : "Unknown moderator."}\n> <:6442nanewsicon:1271775861938327592> **Reason:** ${bans[i].reason}\n> <:8045slowmode:1275825495103111301> **Date:** ${dbInfos ? `<t:${Math.round(dbInfos.date / 1000)}:F>` : "Unknown date."}\n> <:icons_timeout:1271775567074824232> **Temporary Ban:** ${dbInfos?.endDate ? `Yes (expires <t:${Math.round(dbInfos.endDate / 1000)}:R>).` : "No."}`
                    )
            ],
            components: bans.length === 1 ? [] : [updateButtons()]
        });

        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on("collect", async (btnInteraction: ButtonInteraction) => {
            const btn = btnInteraction.customId;

            if (btnInteraction.user.id !== interaction.user.id) {
                await btnInteraction.reply({
                    embeds: [errorEmbed.setDescription("<:9692redguard:1274033795615424582> This is not your button.")],
                    ephemeral: true
                });
                return;
            }

            if (btn === "page") {
                const modal = new ModalBuilder().setCustomId("page_modal").setTitle("Enter Page Number");

                const pageInput = new TextInputBuilder()
                    .setCustomId("page_number")
                    .setLabel("Page Number")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Enter a page number...")
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(pageInput));
                await btnInteraction.showModal(modal);

                try {
                    const modalInteraction = await btnInteraction.awaitModalSubmit({ time: 15000 });
                    const pageNumber = parseInt(modalInteraction.fields.getTextInputValue("page_number"));

                    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > bans.length) {
                        await modalInteraction.reply({
                            embeds: [
                                errorEmbed.setDescription("<:9692redguard:1274033795615424582> Invalid page number.")
                            ],
                            ephemeral: true
                        });
                        return;
                    }

                    i = pageNumber - 1;
                    await updateMessage(modalInteraction);
                } catch {
                    await btnInteraction.followUp({
                        embeds: [errorEmbed.setDescription("<:9692redguard:1274033795615424582> Time's up.")],
                        ephemeral: true
                    });
                }
            } else {
                switch (btn) {
                    case "first":
                        i = 0;
                        break;
                    case "prev":
                        i = i - 1;
                        break;
                    case "next":
                        i = i + 1;
                        break;
                    case "last":
                        i = bans.length - 1;
                        break;
                }

                await updateMessage(btnInteraction);
            }

            collector.empty();
            collector.resetTimer();
        });

        collector.on("end", async (collected) => {
            const authorInteracted = collected.some((x) => x.user.id === interaction.user.id);

            if (!authorInteracted) {
                await interaction.editReply({
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            updateButtons().components.map((x) => x.setDisabled(true))
                        )
                    ]
                });
            }
        });
    }
};

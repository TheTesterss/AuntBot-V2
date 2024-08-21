import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonComponent,
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
import parseTime from "../../../utils/functions/parseTime";
import humanizeTime from "../../../utils/functions/humanizeTime";

export const command: CommandDatas = {
    // #region datas
    name: "warns",
    nameLocalizations: {
        fr: "avertissements"
    },
    description: "Warns related.",
    descriptionLocalizations: {
        fr: "Warns related."
    },
    options: [
        {
            name: "actions",
            nameLocalizations: { fr: "actions" },
            description: "Warn config",
            descriptionLocalizations: { fr: "Configuration des avertissements" },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "add",
                    nameLocalizations: { fr: "ajouter" },
                    description: "Adds an action for a given number of warnings",
                    descriptionLocalizations: { fr: "Ajoute une action pour un nombre donné d'avertissements" },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            nameLocalizations: { fr: "type" },
                            description: "Type of sanction",
                            descriptionLocalizations: { fr: "Le type de sanction" },
                            type: ApplicationCommandOptionType.String,
                            choices: [
                                {
                                    name: "Timeout",
                                    nameLocalizations: { fr: "Exclusion temporaire" },
                                    value: "timeout"
                                },
                                {
                                    name: "Temporary ban",
                                    nameLocalizations: { fr: "Bannissement temporaire" },
                                    value: "tempban"
                                },
                                {
                                    name: "Permanent ban",
                                    nameLocalizations: { fr: "Bannissement permanent" },
                                    value: "permban"
                                }
                            ],
                            required: true
                        },
                        {
                            name: "number",
                            nameLocalizations: { fr: "nombre" },
                            description: "Number of warnings",
                            descriptionLocalizations: { fr: "Nombre d'avertissements" },
                            type: ApplicationCommandOptionType.Integer,
                            minValue: 1,
                            maxValue: 10,
                            required: true
                        },
                        {
                            name: "duration",
                            nameLocalizations: { fr: "durée" },
                            description: "Duration of the action (only for timeout and tempban)",
                            descriptionLocalizations: {
                                fr: "Durée de l'action (seulement pour les exclusions temporaires et les bannissements temporaires)"
                            },
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "delete",
                    nameLocalizations: { fr: "supprimer" },
                    description: "Deletes an existing action for a given number of warnings",
                    descriptionLocalizations: {
                        fr: "Supprime une action existante pour un nombre donné d'avertissements"
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "action",
                            nameLocalizations: { fr: "action" },
                            description: "Action to delete",
                            descriptionLocalizations: { fr: "L'action à supprimer" },
                            type: ApplicationCommandOptionType.Integer,
                            minValue: 1,
                            maxValue: 10,
                            required: true,
                            autocomplete: true
                        }
                    ]
                },
                {
                    name: "view",
                    nameLocalizations: { fr: "voir" },
                    description: "Shows all warning actions",
                    descriptionLocalizations: {
                        fr: "Affiche toutes les actions d'avertissements"
                    },
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "purge",
                    nameLocalizations: { fr: "purger" },
                    description: "Deletes all existing actions.",
                    descriptionLocalizations: {
                        fr: "Supprime toutes les actions existantes."
                    },
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        },
        {
            name: "remove",
            nameLocalizations: { fr: "retirer" },
            description: "Removes a user's warning.",
            descriptionLocalizations: { fr: "Retire un avertissement d'un utilisateur." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    nameLocalizations: { fr: "id" },
                    description: "ID of warning.",
                    descriptionLocalizations: { fr: "L'ID de l'avertissement." },
                    type: ApplicationCommandOptionType.Integer,
                    autocomplete: true,
                    required: true,
                    minValue: 1,
                    maxValue: 10
                }
            ]
        },
        {
            name: "purge",
            nameLocalizations: { fr: "purger" },
            description: "Removes all warnings from the server or a user.",
            descriptionLocalizations: { fr: "Retire tous les avertissements du serveur ou d'un utilisateur." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    nameLocalizations: { fr: "utilisateur" },
                    description: "The user whose warnings you wish to remove.",
                    descriptionLocalizations: { fr: "L'utilisateur dont vous souhaitez retirer les avertissements." },
                    type: ApplicationCommandOptionType.User,
                    required: false
                }
            ]
        },
        {
            name: "view",
            nameLocalizations: { fr: "voir" },
            description: "Shows all warnings from the server or a user.",
            descriptionLocalizations: { fr: "Affiche tous les avertissements du serveur ou d'un utilisateur." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    nameLocalizations: { fr: "utilisateur" },
                    description: "The user whose warnings you wish to see.",
                    descriptionLocalizations: { fr: "L'utilisateur dont vous souhaitez voir les avertissements." },
                    type: ApplicationCommandOptionType.User,
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
        memberRequiredPermissions: ["BanMembers", "ModerateMembers"],
        clientRequiredPermissions: ["BanMembers", "ModerateMembers"]
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
        lang: LangValues
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;

        let errorEmbed = new EmbedBuilder().setTitle("Error").setColor(bot.colors.false as ColorResolvable);
        const guildId = interaction.guildId;
        const GuildDB = database.models.GuildDB;
        const thisGuildDb = await GuildDB.findOne({ id: guildId });
        const userId = interaction.user.id;

        if (!thisGuildDb) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> An error occurred with the database."
                    )
                ]
            });
            return;
        }

        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Powered by Aunt Development"
        });

        const group = interaction.options.getSubcommandGroup();
        const fullCommandName = group
            ? `${group} ${interaction.options.getSubcommand()}`
            : interaction.options.getSubcommand();

        // #region actions add
        if (fullCommandName === "actions add") {
            const number = interaction.options.getInteger("number", true);
            const type = interaction.options.getString("type", true);
            const duration = interaction.options.getString("duration", false);

            let msDuration, humanizedTime;
            if (type !== "permban") {
                if (!duration) {
                    await interaction.editReply({
                        embeds: [
                            errorEmbed.setDescription(
                                "<:9692redguard:1274033795615424582> You must specify a duration for this type of action."
                            )
                        ]
                    });
                    return;
                } else {
                    msDuration = parseTime(duration);

                    if (msDuration === null) {
                        await interaction.editReply({
                            embeds: [
                                errorEmbed.setDescription(
                                    "<:9692redguard:1274033795615424582> The specified duration is not valid. You can use `y` for years, `mon` for months, `w` for weeks, `d` for days, `h` for hours, `min` for minutes."
                                )
                            ]
                        });
                        return;
                    }

                    humanizedTime = humanizeTime(msDuration, "ms", lang);
                }
            }

            const exists = thisGuildDb.mod && thisGuildDb.mod.warnActions.some((action) => action.warns === number);

            if (!exists) {
                thisGuildDb.mod.warnActions.push({ duration: msDuration, warns: number, actionType: type });
                await thisGuildDb.save();

                if (type === "permban") {
                    embed.setDescription(
                        `<:8181greendot:1274033444006920272> Noted! I will permanently ban users after ${number} warning${number > 1 ? "s" : ""}.`
                    );
                } else if (type === "tempban") {
                    embed.setDescription(
                        `<:8181greendot:1274033444006920272> Noted! I will temporarily ban users for ${humanizedTime} after ${number} warning${number > 1 ? "s" : ""}`
                    );
                } else if (type === "timeout") {
                    embed.setDescription(
                        `<:8181greendot:1274033444006920272> Noted! I will timeout users for ${humanizedTime} after ${number} warning${number > 1 ? "s" : ""}`
                    );
                }

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> An action already exists for this number of warnings."
                        )
                    ]
                });
            }
        }
        // #endregion actions add
        // #region actions delete
        else if (fullCommandName === "actions delete") {
            const number = interaction.options.getInteger("action", true);

            const exists = thisGuildDb.mod && thisGuildDb.mod.warnActions.some((action) => action.warns === number);

            if (!exists) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> No action exists for this number of warnings."
                        )
                    ]
                });
                return;
            }

            await GuildDB.updateOne({ id: guildId }, { $pull: { "mod.warnActions": { warns: number } } });

            await interaction.editReply({
                embeds: [
                    embed.setDescription(
                        "<:8181greendot:1274033444006920272> The action has been successfully deleted!"
                    )
                ]
            });
        }
        // #endregion actions delete
        // #region actions view
        else if (fullCommandName === "actions view") {
            if (thisGuildDb.mod.warnActions.length === 0) {
                await interaction.editReply({
                    embeds: [
                        embed.setDescription(
                            "<:2054orangedot:1274033354131640391> No warning actions are recorded on this server."
                        )
                    ]
                });
                return;
            }

            const actions: string[] = [];
            for (const action of thisGuildDb.mod.warnActions) {
                let actionDescription: string;
                if (action.actionType === "permban") {
                    actionDescription = "<:icons_ban:1275820197370138765> Permanent ban";
                } else if (action.actionType === "tempban") {
                    actionDescription = `<:icons_ban:1275820197370138765> Temp ban for ${humanizeTime(action.duration as number, "ms", lang)}`;
                } else if (action.actionType === "timeout") {
                    actionDescription = `<:icons_timeout:1271775567074824232> Timeout for ${humanizeTime(action.duration as number, "ms", lang)}`;
                } else {
                    actionDescription = "Unknown action";
                }

                let name = `> - **${action.warns < 10 ? `0${action.warns}` : action.warns} warning${action.warns > 1 ? "s" : ""}** - ${actionDescription}`;
                actions.push(name);
            }

            actions.sort((a, b) => {
                const numA = parseInt(a.replace("**", "").split(" ")[2], 10);
                const numB = parseInt(b.replace("**", "").split(" ")[2], 10);
                return numA - numB;
            });

            await interaction.editReply({
                embeds: [
                    embed.setDescription(
                        `### There are ${actions.length} warning action${actions.length > 1 ? "s" : ""} on this server:\n${actions.join("\n")}`
                    )
                ]
            });
        }
        // #endregion actions view
        // #region actions purge
        else if (fullCommandName === "actions purge") {
            if (thisGuildDb.mod.warnActions.length === 0) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> There are no warning actions to delete on this server."
                        )
                    ]
                });
                return;
            }

            const confirmButton = new ButtonBuilder()
                .setCustomId("confirmwarnsactions")
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId("cancelwarnsactions")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

            const message = await interaction.editReply({
                components: [actionRow],
                embeds: [
                    embed
                        .setDescription(
                            "Are you sure you want to purge all warning actions?\nThis action is irreversible."
                        )
                        .setTitle("Purge Warning Actions")
                ]
            });

            const collector = message.createMessageComponentCollector({ time: 15000 });

            collector.on("collect", async (i) => {
                if (i.customId === "confirmwarnsactions") {
                    await GuildDB.updateOne({ id: guildId }, { $set: { "mod.warnActions": [] } });

                    await i.update({
                        embeds: [
                            embed
                                .setDescription(
                                    "<:8181greendot:1274033444006920272> I have successfully deleted all warning actions from this server!"
                                )
                                .setTitle("Warning Actions Purged!")
                        ],
                        components: []
                    });
                } else if (i.customId === "cancelwarnsactions") {
                    await i.update({
                        content: "<:2054orangedot:1274033354131640391> Action cancelled.",
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                actionRow.components.map((button) => ButtonBuilder.from(button).setDisabled(true))
                            )
                        ]
                    });
                }
            });

            collector.on("end", async (collected) => {
                if (collected.some((x) => x.user.id === interaction.user.id)) return;
                await interaction.editReply({
                    content: "<:1523reddot:1274033425292066816> Time expired.",
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            actionRow.components.map((button) => ButtonBuilder.from(button).setDisabled(true))
                        )
                    ]
                });
            });
        }

        // #endregion actions purge
        // #region remove
        else if (fullCommandName === "remove") {
            const id = interaction.options.getInteger("id", true);

            const warnDetails = thisGuildDb.mod.warns.find((warn) => warn.id === id);

            if (!warnDetails) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription("<:9692redguard:1274033795615424582> No warning found with this ID.")
                    ]
                });
                return;
            }

            await GuildDB.updateOne({ id: guildId }, { $pull: { "mod.warns": { id } } });

            const cancelButton = new ButtonBuilder()
                .setCustomId("cancelwarnremove")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton);

            const message = await interaction.editReply({
                embeds: [
                    embed
                        .setDescription(
                            `I have successfully removed this warning:\n> - <:9732memberblue:1274037205408681995> **Target ID:** \`${warnDetails.target}\`\n> - <:9829namodicon:1271775961272029206> **Moderator ID:** \`${warnDetails.mod}\`\n> - <:6442nanewsicon:1271775861938327592> **Reason:** ${warnDetails.reason}\n- <:8045slowmode:1275825495103111301> **Date:** <t:${Math.round(warnDetails.date / 1000)}:F>\n\n-# In case of error, you have 30 seconds to click the "Cancel" button to restore the warning.`
                        )
                        .setTitle(`Warning #${warnDetails.id} Removed!`)
                ],
                components: [actionRow]
            });

            const collector = message.createMessageComponentCollector({ time: 30000 });

            collector.on("collect", async (i) => {
                if (i.customId !== "cancelwarnremove" || i.user.id !== interaction.user.id) {
                    await i.reply({
                        embeds: [
                            errorEmbed.setDescription(
                                "<:9692redguard:1274033795615424582> This is not your button or invalid action."
                            )
                        ],
                        ephemeral: true
                    });
                    return;
                }

                await GuildDB.updateOne({ id: guildId }, { $push: { "mod.warns": warnDetails } });

                await i.update({
                    embeds: [
                        embed
                            .setDescription(
                                "<:8181greendot:1274033444006920272> I have successfully canceled the removal of this warning!"
                            )
                            .setTitle("Removal Canceled")
                    ],
                    components: []
                });
            });

            collector.on("end", async (collected) => {
                if (!collected.some((x) => x.user.id === interaction.user.id)) {
                    await interaction.editReply({
                        content: "Time expired, you can no longer cancel the warning removal.",
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                message.components[0].components.map((x) =>
                                    ButtonBuilder.from(x as ButtonComponent).setDisabled(true)
                                )
                            )
                        ]
                    });
                }
            });
        }

        // #endregion remove
        // #region purge
        else if (fullCommandName === "purge") {
            const targetUser = interaction.options.getUser("user", false);

            const confirmButton = new ButtonBuilder()
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success)
                .setCustomId("confirmpurgewarns");

            const cancelButton = new ButtonBuilder()
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("cancelpurgewarns");

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

            let message;

            if (!targetUser) {
                message = await interaction.editReply({
                    components: [actionRow],
                    embeds: [
                        embed
                            .setDescription(
                                `Are you sure you want to purge all warnings? ${thisGuildDb.mod.warns.length > 1 ? `${thisGuildDb.mod.warns.length} warnings will be removed` : `${thisGuildDb.mod.warns.length} warning will be removed`} and the warning count will be reset to 0.\nThis action is irreversible.`
                            )
                            .setTitle("Purge Warnings")
                    ]
                });
            } else {
                const targetWarnings = thisGuildDb.mod.warns.filter((warn) => warn.target === targetUser.id);

                if (targetWarnings.length === 0) {
                    await interaction.editReply({
                        embeds: [
                            errorEmbed.setDescription(
                                `<:9692redguard:1274033795615424582> The mentioned user (${targetUser}) has no warnings.`
                            )
                        ]
                    });
                    return;
                }

                message = await interaction.editReply({
                    components: [actionRow],
                    embeds: [
                        embed
                            .setDescription(
                                `Are you sure you want to purge all warnings of ${targetUser}? ${
                                    targetWarnings.length > 1
                                        ? `${targetWarnings.length} warnings will be removed`
                                        : `${targetWarnings.length} warning will be removed`
                                }.\nThis action is irreversible.`
                            )
                            .setTitle("Purge User Warnings")
                    ]
                });
            }

            if (!message) return;

            const collector = message.createMessageComponentCollector({ time: 15000 });

            collector.on("collect", async (i) => {
                const btn = i.customId;

                if (i.user.id !== userId) {
                    await i.reply({
                        embeds: [
                            errorEmbed.setDescription("<:9692redguard:1274033795615424582> This is not your button.")
                        ],
                        ephemeral: true
                    });
                    return;
                }

                if (btn === "confirmpurgewarns") {
                    if (!targetUser) {
                        await GuildDB.updateOne({ id: guildId }, { $set: { "mod.warns": [], "mod.totalWarns": 0 } });
                        await i.update({
                            embeds: [
                                embed
                                    .setDescription(
                                        `<:8181greendot:1274033444006920272> I have successfully removed all warnings from the server!`
                                    )
                                    .setTitle("Warnings Purged!")
                            ],
                            components: []
                        });
                    } else {
                        await GuildDB.updateOne(
                            { id: guildId },
                            {
                                $pull: { "mod.warns": { target: targetUser.id } }
                            }
                        );
                        await i.update({
                            embeds: [
                                embed
                                    .setDescription(
                                        `<:8181greendot:1274033444006920272> I have successfully removed all warnings from <@${targetUser.id}>.`
                                    )
                                    .setTitle("User Warnings Purged!")
                            ],
                            components: []
                        });
                    }
                } else if (btn === "cancelpurgewarns") {
                    await i.update({
                        content: "Action canceled.",
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                message.components[0].components.map((x) =>
                                    ButtonBuilder.from(x as ButtonComponent).setDisabled(true)
                                )
                            )
                        ]
                    });
                }
            });

            collector.on("end", async (collected) => {
                if (!collected.some((x) => x.user.id === userId)) {
                    await interaction.editReply({
                        components: [
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                actionRow.components.map((x) => x.setDisabled(true))
                            )
                        ]
                    });
                }
            });
        }

        // #endregion purge
        // #region view
        else if (fullCommandName === "view") {
            const targetUser = interaction.options.getUser("user", false);

            let warns = targetUser
                ? thisGuildDb.mod.warns.filter((x) => x.target === targetUser.id)
                : thisGuildDb.mod.warns;

            if (warns.length === 0) {
                await interaction.editReply({ embeds: [embed.setDescription("No warnings to display.")] });
                return;
            }

            let i = 0;

            const firstButton = new ButtonBuilder().setLabel("⏮️").setStyle(ButtonStyle.Secondary).setCustomId("first");
            const previousButton = new ButtonBuilder()
                .setLabel("◀️")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("prev");
            const pageButton = new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId("page");
            const nextButton = new ButtonBuilder().setLabel("▶️").setStyle(ButtonStyle.Secondary).setCustomId("next");
            const lastButton = new ButtonBuilder().setLabel("⏭️").setStyle(ButtonStyle.Secondary).setCustomId("last");

            const updateButtons = () => {
                return new ActionRowBuilder<ButtonBuilder>().addComponents(
                    firstButton.setDisabled(i === 0),
                    previousButton.setDisabled(i === 0),
                    pageButton.setLabel(`${i + 1}/${warns.length}`),
                    nextButton.setDisabled(i + 1 === warns.length),
                    lastButton.setDisabled(i + 1 === warns.length)
                );
            };

            const updateMessage = async (interactionToUpdate: ButtonInteraction | ModalSubmitInteraction) => {
                if (interactionToUpdate instanceof ModalSubmitInteraction && !interactionToUpdate.isFromMessage())
                    return;

                await interactionToUpdate.update({
                    embeds: [
                        embed
                            .setTitle(`Warnings ${targetUser ? `of ${targetUser.displayName}` : "Global"}`)
                            .setDescription(
                                `> <:9659nachessicon:1271775948852957276> **Warning ID:** ${warns[i].id}\n> <:8045slowmode:1275825495103111301> **Date:** <t:${Math.round(warns[i].date / 1000)}:F>\n> <:9829namodicon:1271775961272029206> **Moderator:** <@${warns[i].mod}> (\`${warns[i].mod}\`)\n> <:6442nanewsicon:1271775861938327592> **Reason:** ${warns[i].reason}`
                            )
                    ],
                    components: warns.length === 1 ? [] : [updateButtons()]
                });
            };

            let message = await interaction.editReply({
                embeds: [
                    embed
                        .setTitle(`Warnings ${targetUser ? `of ${targetUser.displayName}` : "Global"}`)
                        .setDescription(
                            `> <:9659nachessicon:1271775948852957276> **Warning ID:** ${warns[i].id}\n> <:8045slowmode:1275825495103111301> **Date:** <t:${Math.round(warns[i].date / 1000)}:F>\n> <:9829namodicon:1271775961272029206> **Moderator:** <@${warns[i].mod}> (\`${warns[i].mod}\`)\n> <:6442nanewsicon:1271775861938327592> **Reason:** ${warns[i].reason}`
                        )
                ],
                components: warns.length === 1 ? [] : [updateButtons()]
            });

            const collector = message.createMessageComponentCollector({ time: 300000 });

            collector.on("collect", async (btnInteraction: ButtonInteraction) => {
                const btn = btnInteraction.customId;

                if (btnInteraction.user.id !== userId) {
                    await btnInteraction.reply({
                        embeds: [
                            errorEmbed.setDescription("<:9692redguard:1274033795615424582> This is not your button.")
                        ],
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

                        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > warns.length) {
                            await modalInteraction.reply({
                                embeds: [
                                    errorEmbed.setDescription(
                                        "<:9692redguard:1274033795615424582> Invalid page number."
                                    )
                                ],
                                ephemeral: true
                            });
                            return;
                        }

                        i = pageNumber - 1;
                        await updateMessage(modalInteraction);
                    } catch {
                        await btnInteraction.followUp({
                            embeds: [errorEmbed.setDescription("<:9692redguard:1274033795615424582> Time expired.")],
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
                            i = warns.length - 1;
                            break;
                    }

                    await updateMessage(btnInteraction);
                }

                collector.empty();
                collector.resetTimer();
            });

            collector.on("end", async (collected) => {
                const authorInteracted = collected.some((x) => x.user.id === userId);

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
        // #endregion view
    }
};

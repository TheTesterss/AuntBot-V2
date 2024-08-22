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

        let errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);
        const guildId = interaction.guildId;
        const GuildDB = database.models.GuildDB;
        const thisGuildDb = await GuildDB.findOne({ id: guildId });
        const userId = interaction.user.id;

        if (!thisGuildDb) {
            await interaction.editReply({
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Une erreur s'est produite avec la base de données."
                    )
                ]
            });
            return;
        }

        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
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
                                "<:9692redguard:1274033795615424582> Vous devez spécifier une durée pour ce type d'action."
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
                                    "<:9692redguard:1274033795615424582> La durée spécifiée n'est pas valide. Vous pouvez utiliser `y` pour les ans, `mon` pour les mois, `w` pour les semaines, `d` pour les jours, `h` pour les heures, `min` pour les minutes."
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
                        `<:8181greendot:1274033444006920272> C'est noté ! Je bannirai définitivement les utilisateurs au bout de ${number} avertissement${number > 1 ? "s" : ""}.`
                    );
                } else if (type === "tempban") {
                    embed.setDescription(
                        `<:8181greendot:1274033444006920272> C'est noté ! Je bannirai pendant ${humanizedTime} les utilisateurs au bout de ${number} avertissement${number > 1 ? "s" : ""}`
                    );
                } else if (type === "timeout") {
                    embed.setDescription(
                        `<:8181greendot:1274033444006920272> C'est noté ! Je mettrai en sourdine pendant ${humanizedTime} les utilisateurs au bout de ${number} avertissement${number > 1 ? "s" : ""}`
                    );
                }

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({
                    embeds: [
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> Une action existe déjà pour ce nombre d'avertissements."
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
                            "<:9692redguard:1274033795615424582> Aucune action pour ce nombre d'avertissements existe."
                        )
                    ]
                });
                return;
            }

            await GuildDB.updateOne({ id: guildId }, { $pull: { "mod.warnActions": { warns: number } } });

            await interaction.editReply({
                embeds: [embed.setDescription("<:8181greendot:1274033444006920272> J'ai bien supprimé cette action !")]
            });
        }
        // #endregion actions delete
        // #region actions view
        else if (fullCommandName === "actions view") {
            if (thisGuildDb.mod.warnActions.length === 0) {
                await interaction.editReply({
                    embeds: [
                        embed.setDescription(
                            "<:2054orangedot:1274033354131640391> Aucune action d'avertissement n'est enregistrée sur ce serveur."
                        )
                    ]
                });
                return;
            }

            const actions: string[] = [];
            for (const action of thisGuildDb.mod.warnActions) {
                let actionDescription: string;
                if (action.actionType === "permban") {
                    actionDescription = "<:icons_ban:1275820197370138765> Bannir définitivement";
                } else if (action.actionType === "tempban") {
                    actionDescription = `<:icons_ban:1275820197370138765> Bannir pendant ${humanizeTime(action.duration as number, "ms", lang)}`;
                } else if (action.actionType === "timeout") {
                    actionDescription = `<:icons_timeout:1271775567074824232> Exclure (Timeout) pendant ${humanizeTime(action.duration as number, "ms", lang)}`;
                } else {
                    actionDescription = "Action inconnue";
                }

                let name = `> - **${action.warns < 10 ? `0${action.warns}` : action.warns} avertissement${action.warns > 1 ? "s" : ""}** - ${actionDescription}`;
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
                        `### Il y a ${actions.length} action${actions.length > 1 ? "s" : ""} d'avertissement sur ce serveur :\n${actions.join("\n")}`
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
                            "<:9692redguard:1274033795615424582> Il n'y a aucun action d'avertissement à supprimer sur ce serveur."
                        )
                    ]
                });
                return;
            }

            const confirmButton = new ButtonBuilder()
                .setCustomId("confirmwarnsactions")
                .setLabel("Confirmer")
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId("cancelwarnsactions")
                .setLabel("Annuler")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

            const message = await interaction.editReply({
                components: [actionRow],
                embeds: [
                    embed
                        .setDescription(
                            "Êtes-vous sûr de vouloir purger toutes les actions d'avertissement ?\nCette action est irréversible."
                        )
                        .setTitle("Purge des actions d'avertissement")
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
                                    "<:8181greendot:1274033444006920272> J'ai bien supprimé toutes les actions d'avertissement de ce serveur !"
                                )
                                .setTitle("Actions d'avertissement purgées !")
                        ],
                        components: []
                    });
                } else if (i.customId === "cancelwarnsactions") {
                    await i.update({
                        content: "<:2054orangedot:1274033354131640391> Action annulée.",
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
                    content: "<:1523reddot:1274033425292066816> Temps écoulé.",
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
                        errorEmbed.setDescription(
                            "<:9692redguard:1274033795615424582> Aucun avertissement avec cet ID trouvé."
                        )
                    ]
                });
                return;
            }

            await GuildDB.updateOne({ id: guildId }, { $pull: { "mod.warns": { id } } });

            const cancelButton = new ButtonBuilder()
                .setCustomId("cancelwarnremove")
                .setLabel("Annuler")
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton);

            const message = await interaction.editReply({
                embeds: [
                    embed
                        .setDescription(
                            `J'ai bien supprimé cet avertissement :\n> - <:9732memberblue:1274037205408681995> **ID cible :** \`${warnDetails.target}\`\n> - <:9829namodicon:1271775961272029206> **ID modérateur :** \`${warnDetails.mod}\`\n> - <:6442nanewsicon:1271775861938327592> **Raison :** ${warnDetails.reason}\n- <:8045slowmode:1275825495103111301> **Date :** <t:${Math.round(warnDetails.date / 1000)}:F>\n\n-# En cas d'erreur, vous avez 30 secondes pour cliquer sur le bouton "Annuler" afin de remettre l'avertissement.`
                        )
                        .setTitle(`Avertissement #${warnDetails.id} supprimé !`)
                ],
                components: [actionRow]
            });

            const collector = message.createMessageComponentCollector({ time: 30000 });

            collector.on("collect", async (i) => {
                if (i.customId !== "cancelwarnremove" || i.user.id !== interaction.user.id) {
                    await i.reply({
                        embeds: [
                            errorEmbed.setDescription(
                                "<:9692redguard:1274033795615424582> Ce n'est pas votre bouton ou action invalide."
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
                                "<:8181greendot:1274033444006920272> J'ai bien annulé la suppression de cet avertissement !"
                            )
                            .setTitle("Annulation de la suppression")
                    ],
                    components: []
                });
            });

            collector.on("end", async (collected) => {
                if (!collected.some((x) => x.user.id === interaction.user.id)) {
                    await interaction.editReply({
                        content: "Temps écoulé, vous ne pouvez plus annuler la suppression de l'avertissement.",
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
                .setLabel("Confirmer")
                .setStyle(ButtonStyle.Success)
                .setCustomId("confirmpurgewarns");

            const cancelButton = new ButtonBuilder()
                .setLabel("Annuler")
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
                                `Êtes-vous sûr de vouloir purger tous les avertissements ? ${thisGuildDb.mod.warns.length > 1 ? `${thisGuildDb.mod.warns.length} avertissements seront supprimés` : `${thisGuildDb.mod.warns.length} avertissement sera supprimé`} et le nombre d'avertissements sera remis à 0.\nCette action est irréversible.`
                            )
                            .setTitle("Purge des avertissements")
                    ]
                });
            } else {
                const targetWarnings = thisGuildDb.mod.warns.filter((warn) => warn.target === targetUser.id);

                if (targetWarnings.length === 0) {
                    await interaction.editReply({
                        embeds: [
                            errorEmbed.setDescription(
                                `<:9692redguard:1274033795615424582> L'utilisateur mentionné (${targetUser}) n'a aucun avertissement.`
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
                                `Êtes-vous sûr de vouloir purger tous les avertissements de ${targetUser} ? ${
                                    targetWarnings.length > 1
                                        ? `${targetWarnings.length} avertissements seront supprimés`
                                        : `${targetWarnings.length} sera supprimé`
                                }.\nCette action est irréversible.`
                            )
                            .setTitle("Purge des avertissements d'un utilisateur")
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
                            errorEmbed.setDescription("<:9692redguard:1274033795615424582> Ce n'est pas votre bouton.")
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
                                        `<:8181greendot:1274033444006920272> J'ai bien supprimé tous les avertissements du serveur !`
                                    )
                                    .setTitle("Avertissements purgés !")
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
                                        `<:8181greendot:1274033444006920272> J'ai bien supprimé tous les avertissements de <@${targetUser.id}>.`
                                    )
                                    .setTitle("Avertissements d'un utilisateur purgés !")
                            ],
                            components: []
                        });
                    }
                } else if (btn === "cancelpurgewarns") {
                    await i.update({
                        content: "Action annulée.",
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
                await interaction.editReply({ embeds: [embed.setDescription("Aucun avertissement à afficher.")] });
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
                            .setTitle(`Avertissements ${targetUser ? `de ${targetUser.displayName}` : "globaux"}`)
                            .setDescription(
                                `> <:9659nachessicon:1271775948852957276> **ID de l'avertissement :** ${warns[i].id}\n> <:8045slowmode:1275825495103111301> **Date :** <t:${Math.round(warns[i].date / 1000)}:F>\n> <:9829namodicon:1271775961272029206> **Modérateur :** <@${warns[i].mod}> (\`${warns[i].mod}\`)\n> <:6442nanewsicon:1271775861938327592> **Raison :** ${warns[i].reason}`
                            )
                    ],
                    components: warns.length === 1 ? [] : [updateButtons()]
                });
            };

            let message = await interaction.editReply({
                embeds: [
                    embed
                        .setTitle(`Avertissements ${targetUser ? `de ${targetUser.displayName}` : "globaux"}`)
                        .setDescription(
                            `> <:9659nachessicon:1271775948852957276> **ID de l'avertissement :** ${warns[i].id}\n> <:8045slowmode:1275825495103111301> **Date :** <t:${Math.round(warns[i].date / 1000)}:F>\n> <:9829namodicon:1271775961272029206> **Modérateur :** <@${warns[i].mod}> (\`${warns[i].mod}\`)\n> <:6442nanewsicon:1271775861938327592> **Raison :** ${warns[i].reason}`
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
                            errorEmbed.setDescription("<:9692redguard:1274033795615424582> Ce n'est pas votre bouton.")
                        ],
                        ephemeral: true
                    });
                    return;
                }

                if (btn === "page") {
                    const modal = new ModalBuilder().setCustomId("page_modal").setTitle("Saisir le numéro de page");

                    const pageInput = new TextInputBuilder()
                        .setCustomId("page_number")
                        .setLabel("Numéro de la page")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("Entrez un numéro de page...")
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
                                        "<:9692redguard:1274033795615424582> Numéro de page invalide."
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
                            embeds: [errorEmbed.setDescription("<:9692redguard:1274033795615424582> Temps écoulé.")],
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

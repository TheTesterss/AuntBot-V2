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

        const errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);
        const embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        if (!interaction.guild) {
            await interaction.editReply({
                embeds: [errorEmbed.setDescription("Cette commande ne peut qu'être faite sur un serveur.")]
            });
            return;
        }

        const fetchedBans = await interaction.guild.bans.fetch();
        let bans = Array.from(fetchedBans.values());

        if (bans.length === 0) {
            await interaction.editReply({ embeds: [embed.setDescription("Aucun bannissement à afficher.")] });
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
                    embeds: [errorEmbed.setDescription("Aucune personne bannie trouvée avec cet ID.")]
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
                        .setTitle(`Bannissements du serveur`)
                        .setDescription(
                            `> **Utilisateur banni :** ${bans[i].user.displayName} (\`${bans[i].user.id}\`)\n> **Modérateur :** ${dbInfos ? `<@${dbInfos.mod}> (\`${dbInfos.mod}\`)` : "Modérateur inconnu."}\n> **Raison :** ${bans[i].reason}\n> **Date :** ${dbInfos ? `<t:${Math.round(dbInfos.date / 1000)}:F>` : "Date inconnue."}\n> **Bannissement temporaire :** ${dbInfos?.endDate ? `Oui (expire <t:${Math.round(dbInfos.endDate / 1000)}:R>.)` : "Non."}`
                        )
                ],
                components: bans.length === 1 ? [] : [updateButtons()]
            });
        };

        const dbInfos = thisGuildDb?.mod.bans.get(bans[i].user.id);
        let message = await interaction.editReply({
            embeds: [
                embed
                    .setTitle(`Bannissements du serveur`)
                    .setDescription(
                        `> **Utilisateur banni :** ${bans[i].user.displayName} (\`${bans[i].user.id}\`)\n> **Modérateur :** ${dbInfos ? `<@${dbInfos.mod}> (\`${dbInfos.mod}\`)` : "Modérateur inconnu."}\n> **Raison :** ${bans[i].reason}\n> **Date :** ${dbInfos ? `<t:${Math.round(dbInfos.date / 1000)}:F>` : "Date inconnue."}\n> **Bannissement temporaire :** ${dbInfos?.endDate ? `Oui (expire <t:${Math.round(dbInfos.endDate / 1000)}:R>.)` : "Non."}`
                    )
            ],
            components: bans.length === 1 ? [] : [updateButtons()]
        });

        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on("collect", async (btnInteraction: ButtonInteraction) => {
            const btn = btnInteraction.customId;

            if (btnInteraction.user.id !== interaction.user.id) {
                await btnInteraction.reply({
                    embeds: [errorEmbed.setDescription("Ce n'est pas votre bouton.")],
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

                    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > bans.length) {
                        await modalInteraction.reply({
                            embeds: [errorEmbed.setDescription("Numéro de page invalide.")],
                            ephemeral: true
                        });
                        return;
                    }

                    i = pageNumber - 1;
                    await updateMessage(modalInteraction);
                } catch {
                    await btnInteraction.followUp({
                        embeds: [errorEmbed.setDescription("Temps écoulé.")],
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

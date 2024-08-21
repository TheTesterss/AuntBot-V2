import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChannelType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    Message,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";

export const command: CommandDatas = {
    // #region datas
    name: "clean",
    nameLocalizations: {
        fr: "clean"
    },
    description: "Deletes multiple messages.",
    descriptionLocalizations: {
        fr: "Supprime plusieurs messages."
    },
    options: [
        {
            name: "number",
            nameLocalizations: { fr: "nombre" },
            description: "Number of messages to delete.",
            descriptionLocalizations: { fr: "Nombre de messages à supprimer." },
            type: ApplicationCommandOptionType.Integer,
            required: true,
            minValue: 1,
            maxLength: 100
        },
        {
            name: "user",
            nameLocalizations: { fr: "utilisateur" },
            description: "Author of messages to delete.",
            descriptionLocalizations: { fr: "L'auteur des messages à supprimer." },
            type: ApplicationCommandOptionType.User,
            required: false
        },
        {
            name: "filter",
            nameLocalizations: { fr: "filtre" },
            description: "Only messages with this content will be deleted.",
            descriptionLocalizations: { fr: "Seulement les messages avec ce contenu seront supprimés." },
            type: ApplicationCommandOptionType.String,
            required: false
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
        memberRequiredPermissions: ["ManageMessages"],
        clientRequiredPermissions: ["ManageMessages"]
    },
    types: [ApplicationCommandType.ChatInput],
    // #endregion datas
    execute: async (
        bot: Bot,
        _database: Database,
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

        const number = interaction.options.getInteger("number", true);
        const user = interaction.options.getUser("user", false);
        const filter = interaction.options.getString("filter", false);

        const msg = await interaction.editReply("Suppression des messages...");

        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        let collectedMessages: Message<boolean>[] = [];
        let lastMessageId: string | undefined;
        let reachedEnd = false;

        while (collectedMessages.length < number && !reachedEnd) {
            let fetchedMessages = await interaction.channel?.messages.fetch({
                limit: 100,
                before: lastMessageId
            });

            if (!fetchedMessages || fetchedMessages.size === 0) {
                reachedEnd = true;
                break;
            }

            const filteredMessages = fetchedMessages.filter((x) => {
                const isWithinTwoWeeks = x.createdTimestamp >= twoWeeksAgo;
                const matchesUser = user ? x.author.id === user.id : true;
                const matchesFilter = filter ? x.content.includes(filter) : true;
                const isNotInteractionMessage = x.id !== msg.id;
                return isWithinTwoWeeks && matchesUser && matchesFilter && isNotInteractionMessage;
            });

            collectedMessages = collectedMessages.concat(Array.from(filteredMessages.values()));

            const lastFetchedMessage = fetchedMessages.last();
            if (lastFetchedMessage) {
                lastMessageId = lastFetchedMessage.id;
            } else {
                reachedEnd = true;
            }

            if ((fetchedMessages.last()?.createdTimestamp || 0) < twoWeeksAgo) {
                reachedEnd = true;
            }
        }

        if (collectedMessages.length === 0) {
            await interaction.editReply({
                content: "",
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Aucun message correspondant à ces paramètres trouvé."
                    )
                ]
            });
            return;
        }

        const messagesToDelete = collectedMessages.slice(0, number).map((msg) => msg.id);

        if (!interaction.channel || !interaction.channel.isTextBased() || interaction.channel.type === ChannelType.DM) {
            await interaction.editReply({
                content: "",
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Cette commande ne peut pas être utilisée dans ce type de salon."
                    )
                ]
            });
            return;
        }

        let size;
        try {
            size = (await interaction.channel.bulkDelete(messagesToDelete, true)).size;
        } catch {
            await interaction.editReply({
                content: "",
                embeds: [
                    errorEmbed.setDescription(
                        "<:9692redguard:1274033795615424582> Une erreur s'est produite lors de la suppression des messages."
                    )
                ]
            });
            return;
        }

        if (size === number) {
            await interaction.editReply({
                content: "",
                embeds: [
                    embed.setDescription(`<:8181greendot:1274033444006920272> J'ai bien supprimé ${number} messages.`)
                ]
            });
        } else {
            await interaction.editReply({
                content: "",
                embeds: [
                    embed.setDescription(
                        `<:3100yellowdot:1274033394430377985> Je n'ai pas pu supprimer autant de messages, seulement ${size} message${
                            size > 1
                                ? "s ont pu être effacés car ils correspondaient aux critères et dataient de moins de 2 semaines"
                                : " a pu être effacé car il correspondait aux critères et datait de moins de 2 semaines"
                        }.`
                    )
                ]
            });
        }
    }
};

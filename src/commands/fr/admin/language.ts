import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";
import { GuildDB } from "../../../database";

export const command: CommandDatas = {
    name: "language",
    nameLocalizations: {
        fr: "langue"
    },
    description: "Set the server language.",
    descriptionLocalizations: {
        fr: "Définit la langue du serveur."
    },
    options: [
        {
            name: "language",
            nameLocalizations: { fr: "langue" },
            description: "The new language for this server.",
            descriptionLocalizations: { fr: "La nouvelle langue pour ce serveur." },
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "English 🇺🇸",
                    nameLocalizations: { fr: "Anglais 🇺🇸" },
                    value: "en"
                },
                {
                    name: "French 🇫🇷",
                    nameLocalizations: { fr: "Français 🇫🇷" },
                    value: "fr"
                }
            ]
        }
    ],
    customOptions: {
        CanBeReboot: true,
        allowInDms: false,
        blacklistAllowed: false,
        forBotOwnerOnly: false,
        forGuildAdminsOnly: true,
        forGuildOwnerOnly: false,
        inVoiceOnly: false,
        isNSFW: false,
        whitelistDisallowed: false,
        memberRequiredPermissions: [],
        clientrequiredPermissions: []
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
        interaction = interaction as ChatInputCommandInteraction;

        const newLang = interaction.options.getString("language", true);
        const guildId = interaction.guildId;

        await GuildDB.findOneAndUpdate({ id: guildId }, { lang: newLang });

        let embed = new EmbedBuilder()
            .setColor(bot.colors.true as ColorResolvable)
            .setFooter({
                iconURL: interaction.client.user.avatarURL() ?? undefined,
                text: newLang === "fr" ? "Alimenté par Aunt Développement" : "Powered by Aunt Development"
            })
            .setTitle(newLang === "fr" ? "Succès !" : "Success!")
            .setDescription(
                newLang === "fr"
                    ? "Je parlerai désormais français 🇫🇷 sur ce serveur !"
                    : "From now on, I'll be speaking English 🇺🇸 on this server!"
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

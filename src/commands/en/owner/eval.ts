import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from "discord.js";
import { CommandDatas } from "../../../enums/Interfaces";
import Bot from "../../../classes/Bot";
import Database from "../../../classes/Database";
import { LangValues } from "../../../enums/enums";
import { handleError } from "../../../utils/functions/handleErrors";

export const command: CommandDatas = {
    name: "eval",
    nameLocalizations: {
        fr: "eval"
    },
    description: "Execute code on discord.",
    descriptionLocalizations: {
        fr: "Exécute un code sur discord."
    },
    options: [
        {
            name: "content",
            nameLocalizations: { fr: "contenu" },
            description: "Content to eval.",
            descriptionLocalizations: { fr: "Contenu à évaluer." },
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    customOptions: {
        CanBeReboot: true,
        allowInDms: false,
        blacklistAllowed: false,
        forBotOwnerOnly: true,
        forGuildAdminsOnly: false,
        forGuildOwnerOnly: false,
        inVoiceOnly: false,
        isNSFW: false,
        whitelistDisallowed: false,
        memberRequiredPermissions: [],
        clientRequiredPermissions: []
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
        try {
            interaction.editReply({ content: eval(interaction.options.get("content")?.value as string) });
        } catch (e) {
            handleError(bot, interaction, e);
        }
    }
};

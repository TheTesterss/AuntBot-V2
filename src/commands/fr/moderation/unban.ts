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

export const command: CommandDatas = {
    // #region datas
    name: "unban",
    nameLocalizations: {
        fr: "débannir"
    },
    description: "Unbans a user.",
    descriptionLocalizations: {
        fr: "Débannit un utilisateur."
    },
    options: [
        {
            name: "id",
            nameLocalizations: { fr: "id" },
            description: "ID of the user to unban.",
            descriptionLocalizations: { fr: "ID de l'utilisateur à débannir." },
            type: ApplicationCommandOptionType.String,
            required: true,
            minLength: 16,
            maxLength: 20
        },
        {
            name: "reason",
            nameLocalizations: { fr: "raison" },
            description: "Reason for the unban.",
            descriptionLocalizations: { fr: "Raison du débannissement." },
            type: ApplicationCommandOptionType.String,
            required: false,
            maxLength: 512
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
        memberRequiredPermissions: ["BanMembers"],
        clientRequiredPermissions: ["BanMembers"]
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

        const targetUserId = interaction.options.getString("id", true);
        const reason = interaction.options.getString("reason", false) || "Aucune raison spécifiée.";

        let errorEmbed = new EmbedBuilder().setTitle("Erreur").setColor(bot.colors.false as ColorResolvable);

        let targetUser;
        try {
            targetUser = await bot.djsClient?.users.fetch(targetUserId);
        } catch {
            errorEmbed.setDescription(
                `<:9692redguard:1274033795615424582> Aucun utilisateur avec l'ID "${targetUserId}" trouvé.`
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        try {
            await interaction.guild?.members.unban(targetUserId, reason);
        } catch {
            errorEmbed.setDescription(
                "<:9692redguard:1274033795615424582> Je n'ai pas pu débannir cet utilisateur car il n'est pas banni."
            );

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: "Alimenté par Aunt Développement"
        });

        embed
            .setTitle(`Débannissement réussi !`)
            .setDescription(
                `<:8181greendot:1274033444006920272> Le membre ${targetUser} (\`${targetUser?.id}\`) a été débanni !\n> <:6442nanewsicon:1271775861938327592> **Raison :** ${reason}`
            );

        await interaction.editReply({ embeds: [embed] });
    }
};

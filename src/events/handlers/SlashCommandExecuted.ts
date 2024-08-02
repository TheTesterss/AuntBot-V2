import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    PermissionsBitField
} from 'discord.js';
import Bot from '../../classes/Bot';
import Database from '../../classes/Database';
import { EventType, CustomEvents, LangValues } from '../../enums/enums';
import { CommandDatas } from '../../enums/Interfaces';

export = {
    name: CustomEvents.SlashCommandExecution,
    type: EventType.Custom,
    once: false,
    execute: async (
        main: Bot,
        database: Database,
        interaction: ChatInputCommandInteraction,
        command: CommandDatas
    ): Promise<void> => {
        if (!command || !command?.types || !command?.types.includes(ApplicationCommandType.ChatInput)) return;
        if (!interaction.deferred) await interaction.deferReply();

        let lang: string | undefined = (await database?.models.GuildDB.findOne({ id: interaction.guild!.id }))?.lang;
        const embed = new EmbedBuilder().setColor(main.colors.true as ColorResolvable);
        let problem = false;

        if (!lang || ![LangValues.EN, LangValues.FR].includes(lang as LangValues)) {
            if (command.customOptions.forBotOwnerOnly && process.env.owner !== interaction.user.id) {
                problem = true;
                embed.setFooter({
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                    text: lang === LangValues.EN ? 'Powered by Aunt Development' : 'Alimenté par Aunt Développement'
                });
                embed.setDescription(
                    lang === LangValues.EN
                        ? 'This command is reserved to my developers!'
                        : 'Cette commande est réservée à mes développeurs !'
                );
            }

            if (
                command.customOptions.forGuildAdminsOnly &&
                !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
            ) {
                problem = true;
                embed.setFooter({
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                    text: lang === LangValues.EN ? 'Powered by Aunt Development' : 'Alimenté par Aunt Développement'
                });
                embed.setDescription(
                    lang === LangValues.EN
                        ? 'This command is reserved for server admins!'
                        : 'Cette commande est réservée aux administrateurs !'
                );
            }

            if (command.customOptions.forGuildOwnerOnly && interaction.guild?.ownerId !== interaction.user.id) {
                problem = true;
                embed.setFooter({
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                    text: lang === LangValues.EN ? 'Powered by Aunt Development' : 'Alimenté par Aunt Développement'
                });
                embed.setDescription(
                    lang === LangValues.EN
                        ? 'This command is reserved to this owner'
                        : 'Cette commande est réservée à ce propriétaire !'
                );
            }

            if (
                command.customOptions.inVoiceOnly &&
                !interaction.guild?.members.cache.find((m) => m.user.id)?.voice.channel
            ) {
                problem = true;
                embed.setFooter({
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                    text: lang === LangValues.EN ? 'Powered by Aunt Development' : 'Alimenté par Aunt Développement'
                });
                embed.setDescription(
                    lang === LangValues.EN
                        ? 'You have to be in a voice channel to execute that.'
                        : 'Tu dois être en vocal pour exécuter ça.'
                );
            }

            let user_data = await database.models.UserDB.findOne({ id: interaction.user.id });
            if (!user_data)
                await database.models.UserDB.create({
                    id: interaction.user.id,
                    prevnames: [{ dates: [], names: [] }],
                    blacklist: { isBlacklisted: false },
                    whitelist: { isWhitelisted: false }
                }).catch((e) => console.error);
            if (!command.customOptions.blacklistAllowed && user_data && user_data.blacklist) {
                problem = true;
                embed.setFooter({
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                    text: lang === LangValues.EN ? 'Powered by Aunt Development' : 'Alimenté par Aunt Développement'
                });
                embed.setDescription(
                    lang === LangValues.EN ? 'You are currently blacklisted.' : 'Tu fais partis de la liste noire.'
                );
            }
        }

        if (problem) return void (await interaction.editReply({ embeds: [embed] }));

        return void command.execute(main, database, interaction, command, lang as LangValues);
    }
};

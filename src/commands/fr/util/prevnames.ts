import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction
} from 'discord.js';
import { CommandDatas } from '../../../enums/Interfaces';
import Bot from '../../../classes/Bot';
import Database from '../../../classes/Database';
import { LangValues } from '../../../enums/enums';
import { previousNameDataSchema } from '../../../database/subSchemas/User';

export const command: CommandDatas = {
    name: 'usernames',
    nameLocalizations: {
        fr: 'pseudonymes'
    },
    description: 'Show user old names.',
    descriptionLocalizations: {
        fr: 'Affiche les anciens noms d\'utilisateurs.'
    },
    options: [
        {name: "reset", nameLocalizations: {fr: "réinitialiser"}, description: "Reset your old usernames.", descriptionLocalizations: {fr: "Réinitialise vos anciens pseudonymes."}, type: ApplicationCommandOptionType.Subcommand},
        {name: "current", nameLocalizations: {fr: "actuel"}, description: "Show your current username.", descriptionLocalizations: {fr: "Affiche votre pseudonyme actuel."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "user", description: "User to show his old usernames", nameLocalizations: {fr: "utilisateur"}, descriptionLocalizations: {fr: "Utilisateur don't vous souhaitez voir ses pseudonymes."}, type: ApplicationCommandOptionType.User, required: false}
        ]},
        {name: "view", nameLocalizations: {fr: "voir"}, description: "Show your old usernames.", descriptionLocalizations: {fr: "Affiche vos anciens noms d'utilisateurs."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "user", description: "User to show his old usernames", nameLocalizations: {fr: "utilisateur"}, descriptionLocalizations: {fr: "Utilisateur don't vous souhaitez voir ses pseudonymes."}, type: ApplicationCommandOptionType.User, required: false}
        ]}
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
        let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable).setFooter({
            iconURL: interaction.client.user.avatarURL() ?? undefined,
            text: 'Alimenté par Aunt Développement'
        });

        const sub = (interaction as ChatInputCommandInteraction).options.getSubcommand();
        let user = (interaction as ChatInputCommandInteraction).options.getUser("user") || interaction.user;
        let user_db = await database.models.UserDB.findOne({id: user.id});
        if(!user_db) {
            await database.models.UserDB.create({id: user.id, prevnames: [{date: Date.now(), content: user.username}], blacklist: {isBlacklisted: false}, whitelist: {isWhitelisted: false}}).catch((_e: any) => {})
            embed.setDescription(`Utilisateur non inclut dans la base de donnée.`)

            return void interaction.editReply({embeds: [embed]})
        }
        if(sub === "reset") {
            user_db = await database.models.UserDB.findOne({id: interaction.user.id})
            if(!user_db) {
                await database.models.UserDB.create({id: user.id, prevnames: [{date: Date.now(), content: user.username}], blacklist: {isBlacklisted: false}, whitelist: {isWhitelisted: false}}).catch((_e: any) => {})
                embed.setDescription(`Utilisateur non inclut dans la base de donnée.`)

                return void interaction.editReply({embeds: [embed]})
            } else {
                user_db?.updateOne({prevnames: [{date: Date.now(), content: user.username}]})
                user_db?.save();
            
                embed.setDescription(`<:1422navoteicon:1271775782426902598> <@${interaction.user.id}> Vos anciens pseudonymes ont été réinitialisé.`)

                return void await interaction.editReply({embeds: [embed]});
            }
        } else if(sub === "view") {
            let s = 0, e = 9;
            let list = user_db?.prevnames;
            const getComponents = (start: number, end: number, list: typeof previousNameDataSchema[]) => {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("page_left")
                        .setDisabled(start === 0)
                        .setEmoji("<:UB_Left_Arrow_Icon:1271775611395768474>")
                        .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId("page_right")
                        .setDisabled(list?.length <= end + 1)
                        .setEmoji("<:UB_Right_Arrow_Icon:1271775596363645034>")
                        .setStyle(ButtonStyle.Secondary)
                    )
            }

            embed.setDescription(`<:1422navoteicon:1271775782426902598> liste des pseudonymes de <@${user.id}>. ${list?.length} entrées.`)
            embed.addFields(
                {
                    name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                    value: `${list?.map((value) => {
                        const date = value.date as number;
                        const content = value.content as string;
                        return `<:1814nafaceawesomeicon:1271775791981789325> <t:${Math.round(date / 1000)}:R> - \`${content}\``;
                    }).slice(s, e).join("\n")}`,
                    inline: true
                }
            );
            
            let message = await interaction.editReply({embeds: [embed], components: [getComponents(s, e, list as unknown as typeof previousNameDataSchema[]) as ActionRowBuilder<ButtonBuilder>]});
            let collect = message.createMessageComponentCollector({time: 90_000});

            collect.on("end", () => {
                message.edit({embeds: message.embeds, components: [getComponents(0, list?.length + 1, list as unknown as typeof previousNameDataSchema[]) as ActionRowBuilder<ButtonBuilder>]})
            })

            collect.on("collect", async (button) => {
                if(interaction.user.id !== button.user.id) {
                    return void button.reply({embeds: [
                        new EmbedBuilder()
                        .setColor(bot.colors.true as ColorResolvable)
                        .setFooter({
                            iconURL: interaction.client.user.avatarURL() ?? undefined,
                            text: 'Alimenté par Aunt Développement'
                        })
                        .setDescription(`<:1422navoteicon:1271775782426902598> Vous ne pouvez pas intéragir avec ce bouton.`)
                    ]})
                }

                button.customId.endsWith("left") ? s -= 9 : s += 9
                button.customId.endsWith("left") ? e -= 9 : e += 9

                await button.deferUpdate();
                await message.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(bot.colors.true as ColorResolvable)
                        .setFooter({
                            iconURL: interaction.client.user.avatarURL() ?? undefined,
                            text: 'Alimenté par Aunt Développement'
                        })
                        .setDescription(`<:1422navoteicon:1271775782426902598> Liste des pseudonymes de <@${user.id}>. ${list?.length} entrées.`)
                        .addFields(
                            {
                                name: `<t:${Math.round(Date.now() / 1000)}:R>`,
                                value: `${list?.map((value) => {
                                    const date = value.date as number;
                                    const content = value.content as string;
                                    return `<:1814nafaceawesomeicon:1271775791981789325> <t:${Math.round(date / 1000)}:R> - \`${content}\``;
                                }).slice(s, e).join("\n")}`,
                                inline: true
                            }
                        )
                    ]
                })
            })
        } else if (sub === "current") {
            embed.setDescription(`<:1422navoteicon:1271775782426902598> <@${user.id}> Votre pseudonyme actuel est: ${user.username}.`)

            return void await interaction.editReply({embeds: [embed]});
        }
    }
}

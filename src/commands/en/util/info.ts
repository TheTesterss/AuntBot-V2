import {
    ActionRowBuilder,
    APIRole,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    CategoryChannel,
    Channel,
    ChannelType,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    ForumChannel,
    GuildChannel,
    GuildEmoji,
    GuildMember,
    GuildMemberFlags,
    GuildMemberFlagsBitField,
    MessageContextMenuCommandInteraction,
    OAuth2Scopes,
    PermissionsBitField,
    PermissionsString,
    Role,
    StageChannel,
    Sticker,
    User,
    UserContextMenuCommandInteraction,
    UserFlags,
    VideoQualityMode,
    VoiceChannel
} from 'discord.js';
import { CommandDatas } from '../../../enums/Interfaces';
import Bot from '../../../classes/Bot';
import Database from '../../../classes/Database';
import { LangValues } from '../../../enums/enums';

export const command: CommandDatas = {
    name: 'info',
    nameLocalizations: {
        fr: 'info'
    },
    description: 'Show some informations.',
    descriptionLocalizations: {
        fr: 'Affiche quelques informations.'
    },
    options: [
        {
            name: 'role',
            nameLocalizations: { fr: 'rôle' },
            description: "Show role's informations.",
            descriptionLocalizations: { fr: "Affiches les informations d'un rôle." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'mention',
                    nameLocalizations: { fr: 'mention' },
                    description: 'Mention of the role.',
                    descriptionLocalizations: { fr: 'La mention du rôle.' },
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ]
        },
        {
            name: 'client',
            nameLocalizations: { fr: 'client' },
            description: "Show client's informations.",
            descriptionLocalizations: { fr: 'Affiches les informations du client.' },
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        },
        {
            name: 'emoji',
            nameLocalizations: { fr: 'émoji' },
            description: "Show emoji's informations.",
            descriptionLocalizations: { fr: "Affiches les informations d'un émoji." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    nameLocalizations: { fr: 'nom' },
                    description: 'Name of the emoji.',
                    descriptionLocalizations: { fr: "Le nom de l'émoji." },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'channel',
            nameLocalizations: { fr: 'salon' },
            description: "Show channel's informations.",
            descriptionLocalizations: { fr: "Affiches les informations d'un salon." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'mention',
                    nameLocalizations: { fr: 'mention' },
                    description: 'Mention of the channel.',
                    descriptionLocalizations: { fr: 'La mention du salon.' },
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'guild',
            nameLocalizations: { fr: 'serveur' },
            description: "Show guild's informations.",
            descriptionLocalizations: { fr: 'Affiches les informations du serveur.' },
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        },
        {
            name: 'sticker',
            nameLocalizations: { fr: 'autocollant' },
            description: "Show sticker's informations.",
            descriptionLocalizations: { fr: "Affiches les informations d'un autocollant." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    nameLocalizations: { fr: 'nom' },
                    description: 'Name of the sticker.',
                    descriptionLocalizations: { fr: "Le nom de l'autocollant." },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'user',
            nameLocalizations: { fr: 'utilisateur' },
            description: "Show user's informations.",
            descriptionLocalizations: { fr: "Affiches les informations d'un utilisateur." },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'mention',
                    nameLocalizations: { fr: 'mention' },
                    description: 'Mention of the user.',
                    descriptionLocalizations: { fr: "La mention de l'utilisateur." },
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
        const sub = (interaction as ChatInputCommandInteraction).options.getSubcommand();
        if (sub === 'role') {
            let role: Role = (interaction as ChatInputCommandInteraction).options.getRole('mention') as Role;
            let roles = (role as Role).guild.roles.cache.sort((a, b) => a.position - b.position);
            let roleIndex: number;
            for (let i = 0; i < roles.size; i++) {
                if (roles.at(i)?.id === role!.id) {
                    roleIndex = i;
                    break;
                }
            }
            let nextRole = roles.at(roleIndex! - 1) ?? null;
            let previousRole = roles.at(roleIndex! + 1) ?? null;

            let embed = new EmbedBuilder()
                .setColor(role.hexColor ?? (bot.colors.true as ColorResolvable))
                .setFooter({
                    text: 'Powered by Aunt Development',
                    iconURL:
                        bot.djsClient!.user?.avatarURL({ extension: 'png', forceStatic: false, size: 2048 }) ??
                        undefined
                })
                .setThumbnail(
                    role.iconURL() ?? `https://singlecolorimage.com/get/${role.hexColor.replace('#', '')}/1080x1080`
                )
                .setDescription(
                    `<:1422navoteicon:1271775782426902598> - Created the <t:${Math.round(role.createdTimestamp / 1000)}>`
                )
                .setAuthor({ name: `Role ${role.name}`, iconURL: role.iconURL() ?? undefined })
                .addFields(
                    {
                        name: `Informations utiles`,
                        value: `<:6442nanewsicon:1271775861938327592> **Name:** \`${role?.name}\`\n<:1814nafaceawesomeicon:1271775791981789325> **ID:** \`${role?.id}\`\n<:9829nasmilefaceicon:1271775970675658803> **Colour:** \`${role?.hexColor}\``,
                        inline: true
                    },
                    {
                        name: `Informations diverses`,
                        value: `<:9326orangestaffbadge:1274037109107196036> **Updated?** ${role?.managed ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:7761nasparcleicon:1271775902216228915> **Hoisted?** ${role?.hoist ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:6123nacompassicon:1271775852434034688> **Mentionable?** ${role?.mentionable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                        inline: false
                    },
                    {
                        name: `Members [${role.members.size}/${role.guild.members.cache.size}]`,
                        value: `${
                            role.members.size === 0
                                ? '`No one has this role :/`'
                                : role.members
                                      .map((member) => `<@${member.id}>`)
                                      .slice(0, 9)
                                      .join(', ')
                        } ${role.members.size > 10 ? `**and more...**` : ''}`,
                        inline: false
                    },
                    {
                        name: `Position [${role.guild.roles.cache.size - role.position}/${role.guild.roles.cache.size}]`,
                        value: `${previousRole ? `<@&${previousRole.id}> > ` : ''}<@&${role.id}>${nextRole ? ` > <@&${nextRole.id}>` : ''}`,
                        inline: false
                    }
                )
                .setImage(`https://singlecolorimage.com/get/${role.hexColor.replace('#', '')}/1440x26`);

            let button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL(role.iconURL() ?? 'https://discord.com/')
                    .setDisabled(role.iconURL() ? false : true)
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Download role icon")
            );

            return void interaction.editReply({
                embeds: [embed],
                components: [button as ActionRowBuilder<ButtonBuilder>]
            });
        } else if (sub === 'client') {
            const getGuildInvites = async () => {
                const guildInvites = await Promise.all(
                    bot.djsClient!.guilds.cache.map(async (guild) => {
                        if (!guild.members.me!.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)) {
                            return `${guild.name}`;
                        } else {
                            let invite = await guild.channels.cache
                                ?.filter((channel) => channel.type === ChannelType.GuildText)
                                ?.random()
                                ?.createInvite();
                            return `[${guild.name}](${invite?.url})`;
                        }
                    })
                );
                return guildInvites.slice(0, 9).join(', ');
            };

            let embed = new EmbedBuilder()
                .setAuthor({
                    iconURL: bot.djsClient?.user?.avatarURL() ?? undefined,
                    name: bot.djsClient?.user?.username!
                })
                .setColor(bot.colors.true as ColorResolvable)
                .setFooter({
                    text: 'Powered by Aunt Development',
                    iconURL:
                        bot.djsClient!.user?.displayAvatarURL({ extension: 'png', forceStatic: false, size: 2048 }) ??
                        undefined
                })
                .setThumbnail(bot.djsClient!.user?.displayAvatarURL() ?? null)
                .setDescription(
                    `<:1422navoteicon:1271775782426902598> - Informations and statistics of Aunt Bot.\n**Shard #1 • ${bot.djsClient!.users.cache.size} members • ${bot.djsClient!.guilds.cache.size} servers • ${(await bot.djsClient!.application?.commands.fetch())!.size} commands**`
                )
                .addFields(
                    {
                        name: `Useful informations`,
                        value: `<:8614naboosticon:1271775921166221312> **Latency:** ${bot.djsClient!.ws.ping} millisecondes \`(${Math.round(Date.now() - interaction.createdTimestamp)} millisecondes d'exécution)\`.\n<:1814nafaceawesomeicon:1271775791981789325> **ID:** \`${bot.djsClient!.user?.id}\`\n<:7506namodcommunityicon:1271775882595536926> **Owners:** <@${process.env.owner}>, <@${process.env.owner2}>`,
                        inline: true
                    },
                    {
                        name: `Dated informations`,
                        value: `<:3192nacakeicon:1271775822990151772> **Creation?** <t:${Math.round(bot.djsClient!.user?.createdTimestamp! / 1000)}>\n<:6123nacompassicon:1271775852434034688> **Connexion?** <t:${Math.round(bot.djsClient!.readyTimestamp! / 1000)}>`,
                        inline: false
                    },

                    {
                        name: 'Servers',
                        value: `${await getGuildInvites()} ${bot.djsClient!.guilds?.cache.size > 10 ? "**and more...**" : ''}`,
                        inline: false
                    }
                );

            let button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL(
                        bot.djsClient!.generateInvite({
                            scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
                            permissions: [
                                PermissionsBitField.Flags.AddReactions,
                                PermissionsBitField.Flags.AttachFiles,
                                PermissionsBitField.Flags.BanMembers,
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.CreateInstantInvite,
                                PermissionsBitField.Flags.CreatePrivateThreads,
                                PermissionsBitField.Flags.CreatePublicThreads,
                                PermissionsBitField.Flags.DeafenMembers,
                                PermissionsBitField.Flags.EmbedLinks,
                                PermissionsBitField.Flags.KickMembers,
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.ManageGuild,
                                PermissionsBitField.Flags.ManageMessages,
                                PermissionsBitField.Flags.ManageNicknames,
                                PermissionsBitField.Flags.ManageRoles,
                                PermissionsBitField.Flags.ManageThreads,
                                PermissionsBitField.Flags.ModerateMembers,
                                PermissionsBitField.Flags.MoveMembers,
                                PermissionsBitField.Flags.MuteMembers,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.Speak,
                                PermissionsBitField.Flags.UseApplicationCommands,
                                PermissionsBitField.Flags.UseEmbeddedActivities,
                                PermissionsBitField.Flags.UseExternalEmojis,
                                PermissionsBitField.Flags.UseExternalStickers,
                                PermissionsBitField.Flags.ViewAuditLog,
                                PermissionsBitField.Flags.ViewChannel
                            ]
                        })
                    )
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Invite the bot!')
            );

            return void interaction.editReply({
                embeds: [embed],
                components: [button as ActionRowBuilder<ButtonBuilder>]
            });
        } else if (sub === 'channel') {
            const channel: GuildChannel =
                ((interaction as ChatInputCommandInteraction).options.getChannel('mention') as GuildChannel) ||
                interaction.channel;

            let channels = channel!.guild.channels.cache
                .filter((c) => 'position' in c)
                .filter((c) => c.type === channel.type && c.parentId === channel.parentId)
                .sort((a, b) => a.position - b.position);
            let channelIndex: number;
            for (let i = 0; i < channels.size; i++) {
                if (channels.at(i)?.id === channel!.id) {
                    channelIndex = i;
                    break;
                }
            }
            let nextChannel = channels.at(channelIndex! + 1) ?? null;
            let previousChannel = channels.at(channelIndex! - 1) ?? null;

            const embed = new EmbedBuilder()
                .setColor(bot.colors.true as ColorResolvable)
                .setFooter({
                    iconURL: bot.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'Powered by Aunt Development'
                })
                .setDescription(
                    `<:1422navoteicon:1271775782426902598> - Created the <t:${Math.round(channel?.createdTimestamp! / 1000)}>`
                )
                .addFields(
                    {
                        name: `Useful informations`,
                        value: `<:6442nanewsicon:1271775861938327592> **Name:** \`${channel?.name}\`\n<:1814nafaceawesomeicon:1271775791981789325> **ID:** \`${channel?.id}\`\n<:7506namodcommunityicon:1271775882595536926> **Category:** \`${channel?.parent?.name ?? 'Not found'}\``,
                        inline: true
                    },
                    {
                        name: `Others informations`,
                        value: `<:9326orangestaffbadge:1274037109107196036> **Updatable?** ${channel?.manageable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:14774seniormoderator:1274033639365283975> **Deletable?** ${channel?.deletable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:5726artist:1274033567428513832> **Viewable?** ${channel?.viewable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                        inline: false
                    },
                    {
                        name: `Position [${channel.position}/${channel.guild.channels.cache.filter((c) => c.type === channel.type && c.parentId === channel.parentId).size}]`,
                        value: `${previousChannel ? `<#${previousChannel.id}> > ` : ''}<#${channel.id}>${nextChannel ? ` > <#${nextChannel.id}>` : ''}`,
                        inline: false
                    }
                );

            if (channel.type === ChannelType.GuildCategory) {
                embed.addFields({
                    name: `Children [${(channel as CategoryChannel).children.cache.size}]`,
                    value: `${
                        (channel as CategoryChannel)?.children.cache.size! === 0
                            ? "`No child available for this category :/`"
                            : (channel as CategoryChannel)
                                  ?.children!.cache.map((c) => `<#${c.id}>`)
                                  .slice(0, 9)
                                  .join(', ')
                    } ${(channel as CategoryChannel)?.children!.cache.size! > 10 ? '**and more...**' : ''}`,
                    inline: false
                });
            }

            if (channel.type === ChannelType.GuildForum) {
                embed.addFields({
                    name: `Tags [${(channel as ForumChannel).availableTags.length}]`,
                    value: `${
                        (channel as ForumChannel)?.availableTags.length === 0
                            ? '`No tag available for this forum :/`'
                            : (channel as ForumChannel)?.availableTags
                                  .map(
                                      (c) =>
                                          `<:${interaction.guild?.emojis.cache.find((e) => e.id === c.emoji?.id)?.identifier}>`
                                  )
                                  .slice(0, 9)
                                  .join(', ')
                    } ${(channel as ForumChannel)?.availableTags.length > 10 ? '**and more...**' : ''}`,
                    inline: false
                });
            }

            if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
                embed.addFields(
                    {
                        name: `Internals informations`,
                        value: `<:8614naboosticon:1271775921166221312> **Quality:** \`${(channel as VoiceChannel)?.videoQualityMode === 2 ? 'Maximum' : 'Automatic'}\`\n<:6123nacompassicon:1271775852434034688> **Region:** \`${(channel as VoiceChannel)?.rtcRegion ?? 'Not found'}\`\n<:2470naemeraldicon:1271775812017983488> **Bits rate:** \`${(channel as VoiceChannel).bitrate ?? 0}\`\n<:7824member:1274033616648929310> **limit:** \`${(channel as VoiceChannel).userLimit ?? 'Aucune'}\``,
                        inline: true
                    },
                    {
                        name: `Voice informations`,
                        value: `<:5726artist:1274033567428513832> **Full?** ${(channel as VoiceChannel)?.full ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:9692greedguard:1274033775868645458> **Joinable?** ${(channel as VoiceChannel | StageChannel)?.joinable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:9273memberpink:1274036616910077993> **Speakable?** ${(channel as VoiceChannel)?.speakable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                        inline: false
                    },
                    {
                        name: `Membres [${(channel as StageChannel | VoiceChannel).members.size}]`,
                        value: `${
                            (channel as StageChannel | VoiceChannel)?.members.size === 0
                                ? '`No user in this voice channel :/`'
                                : (channel as StageChannel | VoiceChannel)?.members
                                      .map((c) => `<@${c.id}>`)
                                      .slice(0, 9)
                                      .join(', ')
                        } ${(channel as StageChannel | VoiceChannel)?.members.size > 10 ? '**and more...**' : ''}`,
                        inline: false
                    }
                );
            }

            if ('topic' in channel && channel.topic) {
                embed.addFields({
                    name: 'Topic',
                    value: `\`\`\`${channel?.topic ?? "No topic integrated to this channel."}\`\`\``,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } else if (sub === 'emoji') {
            const str = (interaction as ChatInputCommandInteraction).options.getString('name');

            const foundEmoji: undefined | GuildEmoji = interaction.guild?.emojis.cache.find(
                (e) => e.id === str!.split(':')[2]?.replace('>', '') || e.name === str || e.imageURL() === str
            );

            if (!foundEmoji) {
                let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable);
                embed.setFooter({
                    iconURL: bot.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'Powered by Aunt Development'
                });
                embed.setDescription('This emoji is unvailable for this guild.');

                return void (await interaction.editReply({ embeds: [embed] }));
            }

            const embed = new EmbedBuilder()
                .setColor(bot.colors.true as ColorResolvable)
                .setFooter({
                    iconURL: bot.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'Powered by Aunt Development'
                })
                .setAuthor({ name: `Emoji ${foundEmoji?.name}`, iconURL: foundEmoji?.imageURL() ?? undefined })
                .setDescription(
                    `<:1422navoteicon:1271775782426902598> - Created the <t:${Math.round(foundEmoji?.createdTimestamp! / 1000)}>`
                );

            embed
                .addFields(
                    {
                        name: `Useful informations`,
                        value: `<:6442nanewsicon:1271775861938327592> **Nom:** \`${foundEmoji?.name}\`\n<:1814nafaceawesomeicon:1271775791981789325> **ID:** \`${foundEmoji?.id}\`\n<:9265namaleicon:1271775938857668628> **Usage:** \`<:${foundEmoji?.identifier}>\``,
                        inline: true
                    },
                    {
                        name: `Others informations`,
                        value: `<:9326orangestaffbadge:1274037109107196036> **Modifié?** ${foundEmoji?.managed ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:7761nasparcleicon:1271775902216228915> **Animé?** ${foundEmoji?.animated ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:1814nafaceawesomeicon:1271775791981789325> **Activé?** ${foundEmoji?.available ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                        inline: false
                    },
                    {
                        name: `Linked roles [${foundEmoji?.roles.cache.size}/${foundEmoji?.guild.roles.cache.size}]`,
                        value: `${
                            foundEmoji?.roles.cache.size! === 0
                                ? '`No role linked to this emoji :/`'
                                : foundEmoji
                                      ?.roles!.cache.map((role) => `<@&${role.name}>`)
                                      .slice(0, 9)
                                      .join(', ')
                        } ${foundEmoji?.roles!.cache.size! > 10 ? '**and more...**' : ''}`,
                        inline: false
                    }
                )
                .setThumbnail(foundEmoji?.imageURL() ?? null);

            let button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL(foundEmoji?.imageURL() ?? 'https://discord.com/')
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Download emoji")
            );

            await interaction.editReply({ embeds: [embed], components: [button as ActionRowBuilder<ButtonBuilder>] });
        } else if (sub === 'sticker') {
            const str = (interaction as ChatInputCommandInteraction).options.getString('name');

            const foundSticker: undefined | Sticker = interaction.guild?.stickers.cache.find(
                (e) => e.name === str || e.url === str
            );

            if (!foundSticker) {
                let embed = new EmbedBuilder().setColor(bot.colors.true as ColorResolvable);
                embed.setFooter({
                    iconURL: bot.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'Powered by Aunt Development'
                });
                embed.setDescription('This sticker is unvailable on this server.');

                return void (await interaction.editReply({ embeds: [embed] }));
            }

            const embed = new EmbedBuilder()
                .setColor(bot.colors.true as ColorResolvable)
                .setFooter({
                    iconURL: bot.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'Powered by Aunt Development'
                })
                .setAuthor({ name: `Emoji ${foundSticker?.name}`, iconURL: foundSticker?.url ?? undefined })
                .setDescription(
                    `<:1422navoteicon:1271775782426902598> - Created the <t:${Math.round(foundSticker?.createdTimestamp! / 1000)}>`
                );

            let StickerFormatType = {
                1: 'PNG',
                2: 'APNG',
                3: 'Lottie',
                4: 'GIF'
            };

            embed
                .addFields(
                    {
                        name: `Useful informations`,
                        value: `<:6442nanewsicon:1271775861938327592> **Name:** \`${foundSticker?.name}\`\n<:1814nafaceawesomeicon:1271775791981789325> **ID:** \`${foundSticker?.id}\`\n<:9265namaleicon:1271775938857668628> **Uri:** \`${foundSticker?.url}\``,
                        inline: true
                    },
                    {
                        name: `Others informations`,
                        value: `<:7761nasparcleicon:1271775902216228915> **Format?** \`${StickerFormatType[foundSticker?.format]}\`\n<:1814nafaceawesomeicon:1271775791981789325> **Enabled?** ${foundSticker?.available ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                        inline: false
                    },
                    {
                        name: 'Description',
                        value: `\`\`\`${foundSticker?.description && foundSticker?.description.length > 0 ? foundSticker?.description : 'No description found for this sticker.'}\`\`\``,
                        inline: false
                    }
                )
                .setThumbnail(foundSticker?.url ?? null);

            let button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL(foundSticker?.url ?? 'https://discord.com/')
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Download stickers")
            );

            await interaction.editReply({ embeds: [embed], components: [button as ActionRowBuilder<ButtonBuilder>] });
        } else if (sub === 'user') {
            const member: GuildMember =
                ((interaction as ChatInputCommandInteraction).options.getMember('mention') as GuildMember) ||
                interaction.member;

            const flags = {
                ActiveDeveloper: '<:47676serverdeveloper:1274033685569601599>',
                CertifiedModerator: '<:8020adminbadgeorange:1274037678844809226>',
                Hypesquad: '<:1625eventsbadge:1274033459571986514>',
                Partner: '<:2572verifiedbadge:1274035635681759334>',
                Staff: '<:8584redstaffbadge:1274037239369699418>',
                VerifiedDeveloper: '<:7721botbadge:1274036775417020426>',
                VerifiedBot: '<:63972bot:1274033597715710092>'
            };

            let customFlags = {
                ServerOwner: '<:4992orangeownerbadge:1274036604951855257>',
                Member: '<:8395memberdarkgreen:1274036793817301043>',
                AdminPermissions: '<:9692redguard:1274033795615424582>'
            };

            const status = {
                dnd: '<:4249dndbadge:1274036708676997132>',
                idle: '<:9517idlebadge:1274036496017653844>',
                online: '<:5800onlinebadge:1274037345196183623>',
                offline: '<:2252invisibleofflinebadge:1274036433933308006>',
                invisible: '<:2252invisibleofflinebadge:1274036433933308006>'
            };

            const hypesquad = {
                HypeSquadOnlineHouse1: '<:9913hypesquadbalance:1275511840884916316>',
                HypeSquadOnlineHouse2: '<:14043hypesquadbrilliance:1275511850980868197>',
                HypeSquadOnlineHouse3: '<:14043hypesquadbravery:1275511862318071909>'
            };

            let allFlags = [];
            member.user.flags
                ?.toArray()
                .filter((flag) => flag in flags)
                .map((flag) => {
                    allFlags.push(
                        flags[
                            flag as
                                | 'ActiveDeveloper'
                                | 'CertifiedModerator'
                                | 'Hypesquad'
                                | 'VerifiedDeveloper'
                                | 'Partner'
                                | 'Staff'
                                | 'VerifiedBot'
                        ]
                    );
                });
            if (member.user.id === interaction.guild?.ownerId) allFlags.push(customFlags['ServerOwner']);
            if (member.permissions.has(PermissionsBitField.Flags.Administrator))
                allFlags.push(customFlags['AdminPermissions']);
            allFlags.push(customFlags['Member']);

            let user = await member.user.fetch();

            const embed = new EmbedBuilder()
                .setColor(bot.colors.true as ColorResolvable)
                .setFooter({
                    iconURL: bot.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'Powered by Aunt Development'
                })
                .setImage(user.bannerURL({ size: 2048, forceStatic: false }) ?? null)
                .setThumbnail(member.presence?.activities[member.presence.activities.length - 1]?.assets?.largeImageURL() ?? member.displayAvatarURL())
                .setAuthor({
                    iconURL: member.presence?.activities[member.presence.activities.length - 1]?.assets?.smallImageURL() ?? undefined,
                    name: member.presence?.activities[member.presence.activities.length - 1]?.assets?.smallText ?? 'No current activity...'
                })
                .setDescription(
                    `<:1422navoteicon:1271775782426902598> - Created the <t:${Math.round(member.user?.createdTimestamp! / 1000)}>\n${allFlags.join(', ')}`
                )
                .addFields(
                    {
                        name: `Useful informations`,
                        value: `<:6442nanewsicon:1271775861938327592> **Name:** \`${member?.nickname ?? member.user.username}\`\n<:1814nafaceawesomeicon:1271775791981789325> **ID:** \`${member?.user.id}\`\n<a:1801hypesquadanimated:1275511825026252850> **Hypesquad:** ${
                            member.user.flags
                                ?.toArray()
                                .filter((flag) => flag.startsWith('HypeSquadOnlineHouse'))
                                .map(
                                    (flag) =>
                                        hypesquad[
                                            flag as
                                                | 'HypeSquadOnlineHouse1'
                                                | 'HypeSquadOnlineHouse2'
                                                | 'HypeSquadOnlineHouse3'
                                        ]
                                )
                                .join('') ?? 'No discord house'
                        }\n<:5374red:1274033496469274695> **Status:** ${status[member.presence?.status ?? 'offline']}`,
                        inline: true
                    },
                    {
                        name: `Others informations`,
                        value: `<:7645nabumbicon:1271775891432800298> **Kickable?** ${member.kickable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:9829nasmilefaceicon:1271775970675658803> **Mutable?** ${member.moderatable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:26129adminroleicon:1274033515708678144> **Bannable?** ${member.bannable ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                        inline: false
                    }
                );

            if (member.voice.channel) {
                embed.addFields({
                    name: `Voice stats`,
                    value: `<:7506namodcommunityicon:1271775882595536926> **Where:** ${member.voice.channel}\n<:7645nabumbicon:1271775891432800298> **Muted?** ${member.voice.mute ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:7761nasparcleicon:1271775902216228915> **Deafen?** ${member.voice.deaf ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:8395memberdarkgreen:1274036793817301043> **Video&?** ${member.voice.selfVideo ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}\n<:9659nachessicon:1271775948852957276> **Streaming?** ${member.voice.streaming ? `<:icons_online:1271775659160506378>` : `<:icons_dred:1271775677472968746>`}`,
                    inline: false
                });
            }

            if (member.presence?.activities[0]) {
                embed.addFields({
                    name: `Current activities`,
                    value: `<:1814nafaceawesomeicon:1271775791981789325> **Name:** \`${member.presence?.activities[member.presence.activities.length - 1]?.name ?? 'No current one'}\`\n<:2835verifiedbadgered:1274033477334863872> **State:** ${member.presence?.activities[0]?.emoji ?? ''} \`${member.presence?.activities[0]?.state ?? 'No custom state'}\`\n<:3192nacakeicon:1271775822990151772> **Since:** <t:${Math.round(member.presence?.activities[member.presence.activities.length - 1]?.createdTimestamp ?? 0 / 1000)}:R>\n<:3036bluemodmailbadge:1274033322581819492> **Details:** \`${member.presence?.activities[member.presence.activities.length - 1]?.details ?? 'no details found'}\``,
                    inline: false
                });
            }

            if (member.premiumSince) {
                embed.addFields({
                    name: `Premium informations`,
                    value: `<:6405discordboost:1274033738841456762> **Type:** \`Booster\`\n<:63972booster:1274033542653018263> **Since:** <t:${Math.round(member.premiumSinceTimestamp! / 1000)}:R>`,
                    inline: true
                });
            }

            await interaction.editReply({ embeds: [embed] });
        }
    }
};

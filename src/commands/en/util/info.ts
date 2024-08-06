import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    Channel,
    ChannelType,
    ChatInputCommandInteraction,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    MessageContextMenuCommandInteraction,
    OAuth2Scopes,
    PermissionsBitField,
    PermissionsString,
    Role,
    UserContextMenuCommandInteraction
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
        {name: "role", nameLocalizations: {fr: "rôle"}, description: "Show role's informations.", descriptionLocalizations: {fr: "Affiches les informations d'un rôle."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "mention", nameLocalizations: {fr: "mention"}, description: "Mention of the role.", descriptionLocalizations: {fr: "La mention du rôle."}, type: ApplicationCommandOptionType.Role, required: true}
        ]},
        {name: "client", nameLocalizations: {fr: "client"}, description: "Show client's informations.", descriptionLocalizations: {fr: "Affiches les informations du client."}, type: ApplicationCommandOptionType.Subcommand, options: []},
        {name: "emoji", nameLocalizations: {fr: "émoji"}, description: "Show emoji's informations.", descriptionLocalizations: {fr: "Affiches les informations d'un émoji."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "name", nameLocalizations: {fr: "nom"}, description: "Name of the emoji.", descriptionLocalizations: {fr: "Le nom de l'émoji."}, type: ApplicationCommandOptionType.String, required: true}
        ]},
        {name: "channel", nameLocalizations: {fr: "salon"}, description: "Show channel's informations.", descriptionLocalizations: {fr: "Affiches les informations d'un salon."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "mention", nameLocalizations: {fr: "mention"}, description: "Mention of the channel.", descriptionLocalizations: {fr: "La mention du salon."}, type: ApplicationCommandOptionType.Channel, required: false}
        ]},
        {name: "guild", nameLocalizations: {fr: "serveur"}, description: "Show guild's informations.", descriptionLocalizations: {fr: "Affiches les informations du serveur."}, type: ApplicationCommandOptionType.Subcommand, options: []},
        {name: "sticker", nameLocalizations: {fr: "autocollant"}, description: "Show sticker's informations.", descriptionLocalizations: {fr: "Affiches les informations d'un autocollant."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "name", nameLocalizations: {fr: "nom"}, description: "Name of the sticker.", descriptionLocalizations: {fr: "Le nom de l'autocollant."}, type: ApplicationCommandOptionType.String, required: true}
        ]},
        {name: "user", nameLocalizations: {fr: "utilisateur"}, description: "Show user's informations.", descriptionLocalizations: {fr: "Affiches les informations d'un utilisateur."}, type: ApplicationCommandOptionType.Subcommand, options: [
            {name: "mention", nameLocalizations: {fr: "mention"}, description: "Mention of the user.", descriptionLocalizations: {fr: "La mention de l'utilisateur."}, type: ApplicationCommandOptionType.User, required: false}
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
        const sub = (interaction as ChatInputCommandInteraction).options.getSubcommand();
        if(sub === "role") {
            let role: Role = (interaction as ChatInputCommandInteraction).options.getRole("mention") as Role
            let roles = role!.guild.roles.cache.sort((a, b) => a.position - b.position);
            let roleIndex: number;
            for(let i = 0;i < roles.size;i++) {
                if(roles.at(i)?.id === role!.id){
                    roleIndex = i;
                    break;
                }
            }
            let nextRole = roles.at(roleIndex! - 1) ?? null;
            let previousRole = roles.at(roleIndex! + 1) ?? null   

            let embed = new EmbedBuilder()
            .setColor(role.hexColor ?? bot.colors.true as ColorResolvable)
            .setFooter({text: "Powered by Aunt Development", iconURL: bot.djsClient!.user?.avatarURL({extension: "png", forceStatic: false, size: 2048}) ?? undefined})
            .setThumbnail(role.iconURL() ?? `https://singlecolorimage.com/get/${role.hexColor.replace("#", "")}/1080x1080`)
            .setDescription(`${bot.customEmojis.chat} - Created the  <t:${Math.round(role.createdTimestamp / 1000)}>`)
            .setAuthor({name: `Role ${role.name}`, iconURL: role.iconURL() ?? undefined})
            .addFields(
                {name: "Color", value: `${role.hexColor}`, inline: true},
                {name: "ID", value: `${role.id}`, inline: true},
                {name: "Mentionable", value: `${role.mentionable ? "Yes": "No"}`, inline: false},
                {name: "Hoisted", value: `${role.hoist ? "Yes" : "No"}`, inline: false},
                {name: `Members [${role.members.size}/${role.guild.members.cache.size}]`, value: `${role.members.size === 0 ? "No user have this role :/" : role.members.map((member) => `<@${member.id}>`).slice(0, 9).join(", ")} ${role.members.size > 10 ? `**and more...**` : ""}`, inline: false},
                {name: `Permissions [${role.permissions.toArray().length}/39]`, value: `${role.permissions.toArray().length === 0 ? "No permission are include with this role :/" : role.permissions.toArray().map((permission) => permission).slice(0, 9).join(", ")} ${role.permissions.toArray().length > 10 ? "**and more...**" : ""}`, inline: false},
                {name: `Position [${role.guild.roles.cache.size - role.position}/${role.guild.roles.cache.size}]`, value: `${previousRole ? `<@&${previousRole.id}> > ` : ""}<@&${role.id}>${nextRole ? ` > <@&${nextRole.id}>` : ""}`, inline: false},
            )
            .setImage(`https://singlecolorimage.com/get/${role.hexColor.replace("#", "")}/1440x26`)

            let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setURL(role.iconURL() ?? "https://discord.com/")
                .setDisabled(role.iconURL() ? false : true)
                .setStyle(ButtonStyle.Link)
                .setLabel("Download Icon")
            )

            return void interaction.editReply({embeds: [embed], components: [button as ActionRowBuilder<ButtonBuilder>]})

        } else if(sub === "client") {
            const getGuildInvites = async () => {
                const guildInvites = await Promise.all(bot.djsClient!.guilds.cache.map(async (guild) => {
                    if(!guild.members.me!.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)){
                        return `${guild.name}`
                    } else {
                        let invite = await guild.channels.cache?.filter(channel => channel.type === ChannelType.GuildText)?.random()?.createInvite();
                        return `[${guild.name}](${invite?.url})`;
                    }
                }));
                return guildInvites.slice(0, 9).join(", ");
            };

            let embed = new EmbedBuilder()
            .setTitle(`**${bot.djsClient!.user?.username} (${bot.djsClient!.user?.id})**`)
            .setColor(bot.colors.true as ColorResolvable)
            .setFooter({text: "Powered by Aunt Development.", iconURL: bot.djsClient!.user?.displayAvatarURL({extension: "png", forceStatic: false, size: 2048}) ?? undefined})
            .setThumbnail(bot.djsClient!.user?.displayAvatarURL() ?? null)
            .setDescription(`${bot.customEmojis.chat} - Informations and statistics of the bot.\n**Shard #1 • ${bot.djsClient!.users.cache.size} members • ${bot.djsClient!.guilds.cache.size} guilds • ${(await bot.djsClient!.application?.commands.fetch())!.size} commands**`)
            .addFields(
                {name: "Latency", value: `${bot.djsClient!.ws.ping} millisecondes \`(${Math.round(Date.now() - interaction.createdTimestamp)} millisecondes of executing time)\`.`, inline: false},
                {name: "Owner", value: `<@${process.env.OWNER}>`, inline: true},
                {name: "ID", value: `${bot.djsClient!.user?.id}`, inline: false},
                {name: "guild", value: `${await getGuildInvites()} ${bot.djsClient!.guilds?.cache.size > 10 ? "**and more...**" : ""}`, inline: false},
                {name: "Creation of the bot", value: `<t:${Math.round(bot.djsClient!.user?.createdTimestamp! / 1000)}>`, inline: true},
                {name: "Connected since", value: `<t:${Math.round(bot.djsClient!.readyTimestamp! / 1000)}>`, inline: true},
            )

            let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setURL(bot.djsClient!.generateInvite({scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot], permissions: [PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.UseExternalStickers, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ViewChannel]}))
                .setDisabled(false)
                .setStyle(ButtonStyle.Link)
                .setLabel("Invite the client")
            )

            return void interaction.editReply({embeds: [embed], components: [button as ActionRowBuilder<ButtonBuilder>]})

        } else if(sub === "channel") {
            const channel: Channel = (interaction as ChatInputCommandInteraction).options.getChannel("mention") as Channel || interaction.channel
        

            
        }

    }
};

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    EmbedBuilder,
    StringSelectMenuInteraction
} from 'discord.js';
import Bot from '../../classes/Bot';
import Database from '../../classes/Database';
import { EventType, CustomEvents } from '../../enums/enums';

export = {
    name: CustomEvents.StringSelectMenuExecution,
    type: EventType.Custom,
    once: false,
    execute: async (main: Bot, database: Database, interaction: StringSelectMenuInteraction) => {
        if (interaction.customId !== 'rules') return;
        switch (interaction.values[0]) {
            case 'discord':
                let embed = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. Terms are ALL respected.\n02. Discord licenses are ALL respected.\n03. We do NOT share any datas we get on this server.\n04. Leak of any identities (fakes, your own one, from someone) is NOT ALLOWED.```'
                    )
                    .setFooter({
                        iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                        text: 'You HAVE to respect Discord [terms of services](https://discord.com/terms) & [guide lines](https://discord.com/guidelines).'
                    });
                let component = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Discord Terms of Services')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/terms')
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Discord Guide Lines')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/guidelines')
                    );

                return await interaction.reply({
                    embeds: [embed],
                    components: [component as ActionRowBuilder<ButtonBuilder>],
                    ephemeral: true
                });
                break;
            case 'account':
                let account = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. Your account has to not be shared.\n02. Any acts made by your account with no proof of hacking result in your entire fault.\n03. Sharing informations such as: bot token, app url in supports channels can be VERY dangerous.\n04. Your banner, your avatar have to be respectful and allowed to be seen by 18- users.\n05. Using specials chars in your name result with a rename.\n06. Doubles accounts are banned, can includes your main account.\n07.Accounts with less than 10 days are kicked while they do not pass the 10 days limit.```'
                    );

                interaction.reply({
                    embeds: [account],
                    ephemeral: true
                });
                break;
            case 'together':
                let together = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. You have to be respectful with MEN & WOMEN, Christians & Muslims & Jews...\n02. You have to chat about corrects topics.\n03. You have to be understood, so speak french or english only.\n04. You have to respect channel theme.\n05. +18 content result in a direct ban.\n05. You DO NOT HAVE to contest the staff decisions. Ask admins for any problems in dms.```'
                    );

                interaction.reply({
                    embeds: [together],
                    ephemeral: true
                });
                break;
            case 'contents':
                let contents = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. Spamming in a channel is not allowed, to troll or not.\n02. Critics are welcome when they are here to help to build a better community and with a respectful & correct language.\n03. Sending invite is NOT allowed, 18+ servers, rewards servers... published result on a direct ban.```'
                    );

                interaction.reply({
                    embeds: [contents],
                    ephemeral: true
                });
                break;
            case 'mentions':
                let mentions = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. If a role is mentionable by internal error, directly ask in founders dms.\n02. Founders mentions are allowed for logical questions or if you know them.\n03. Do NOT mention the staff for bad reasons.```'
                    );

                interaction.reply({
                    embeds: [mentions],
                    ephemeral: true
                });
                break;
            case 'voice':
                let voice = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. Insulting users is not allowed.\n02. AFK channel musts be respected, use it when you are in deafen mode.\n03. Recording voice channels is NOT ALLOWED.\n04. Sharing by a stream sensible things is NOT ALLOWED .```'
                    );

                interaction.reply({
                    embeds: [voice],
                    ephemeral: true
                });
                break;
            case 'exhaustiveness':
                let exhaustiveness = new EmbedBuilder()
                    .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
                    .setColor(main.colors.true as ColorResolvable)
                    .setDescription(
                        '```php\n01. Our staff have the last word. They warn you for any reasons that they judge against our rules.\n02. If a staff abused of his permissions, he will be banned and you will be unbanned. Come in admin dms.```'
                    );

                interaction.reply({
                    embeds: [exhaustiveness],
                    ephemeral: true
                });
                break;
            /*case 'terms':
                embed.setDescription(
                    '```php\n01. The bot server aren not filtered, we do not take part in illegal servers who are using the bot.\n02. For any problems with the bot, come on the support.\n03. Before adding the bot you have to respect these articles.\n04. The bot source code, texts, contents or the ownership of TheTesters and are protected by the laws on the author rights. You are not allowed to copy, update or distribute these contents without authorization.\nAll the terms articles can be updated. The support server prevent these updates.\nThese conditions of usage are controled by the french laws.```'
                );
                break;
            case 'policy':
                embed.setDescription(
                    '```php\n01. We collect all the datas you gave us to configure the bot systems, usernames updates, user status updates & your status in the bot database (whitelisted/blacklisted).\n02. We are using the datas to introduce few systems and upgrade servers. When the bot is removed from a guild he continues stocking server datas including server members datas for the 14 next days.\n03. Datas can be removed by reseting systems (will disable them). For server members datas, reseting a system also destroy them. Finally for user datas such as: blacklist, whitelist status or even their previous names can be reset by asking bot owner or by doing "/names reset".\n04. Others commands not included with a system will not stock datas.\n05. Few logs can be stocked, can be destroyed by reseting the system or deleting the channel set.\n06. MongoDB database is used to secure datas with an enforced account where only TheTesters can access.\n07. User can asks in the support for a full reset of his datas in global but also for each guild in common with the bot. If left guild still have their datas, he can set an option to update and destroy even on the guild he left.\n08. Updates will be show on the discord support server.```'
                );
                break; */
        }
    }
};

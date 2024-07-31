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
        let embed = new EmbedBuilder()
            .setTitle(interaction.component.options.find((o) => o.value === interaction.values[0])!.label)
            .setColor(main.colors.true as ColorResolvable);
        let component = new ActionRowBuilder();
        switch (interaction.values[0]) {
            case 'discord':
                embed.setDescription(
                    '```php\n01. Les termes sont tous respectés.\n02. les licenses de Discord sont toutes respectées.\n03. On ne partage aucune donnée du serveur.\n04. Le partage d\'identité telque: le votre, celui concernant quelqu\'un présent ou non ici, une fausse identité semblable à une vraie est interdite.```'
                );
                embed.setFooter({
                    iconURL: main.djsClient!.user?.avatarURL() ?? undefined,
                    text: 'You HAVE to respect Discord [terms of services](https://discord.com/terms) & [guide lines](https://discord.com/guidelines).'
                });
                component
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
                break;
            case 'account':
                embed.setDescription(
                    '```php\n01. Votre compte se doit de ne pas être partagé.\n02. Tout acte fait avec votre compte sans preuves valables comme quoi ce n\'est pas votre faute seront prit en compte.\n03. Le partage d\'informations telsque: un token utilsateur et/ou de bot sont interdits.\n04. Votre pseudonyme, votre bannière, votre icone doivent correspondre aux personnes de 18 ans et moins.\n05. L\'utilisation de caractères spéciaux dans votre pseudonyme conduira à une modification de celui-ci.\n06. Les doubles comptes sont bannis, peut inclure votre compte principal.\n07. Les comptes de moins de 10 jours seront exclus tant qu\'il ne passe pas les 10 jours.```'
                );
                break;
            case 'together':
                embed.setDescription(
                    '```php\n01. Vous devez respecter les sexes, les religions, les origines, les personnes...\n02. Vous devez parler de sujets classiques.\n03. Vous devez être compris, c\'est pourquoi l\'anglais et le français sont les deux seules langues reconnues.\n04. Vous devez respecter le thème des salons.\n05. Le contenu destiné aux personnes de 18 ans et plus est banni.\n05. Vous n\'avez pas à contester les décisions du personnel en publique. Si vous pensez que c\'est une erreur, demander en tickets.```'
                );
                break;
            case 'contents':
                embed.setDescription(
                    '```php\n01. Le spam est interdit, Pour blaguer ou non.\n02. Les critiques sont toutes les bienvenues si elles sont données de manière respectueuse et permettes d\'améliorer le projet.\n03. Les invitations et liens en tout genre sont interdits, ceux à propos de serveur "reward", "NSFW"... sont bannis.```'
                );
                break;
            case 'mentions':
                embed.setDescription(
                    '```php\n01. Si par erreur un rôle est mentionnable, prévenez le staff en privé seulement.\n02. Mentionner les administrateurs est valables si la question est logique et/ou que vous les connaissez.\n03. Aucunes mentions de personnels n\'est autorisé sans raisons valides.```'
                );
                break;
            case 'voice':
                embed.setDescription(
                    '```php\n01. Les insultes sont interdites.\n02. Le salon afk doit être respecté, à utiliser quand vous ne voulez rien entendre.\n03. Enregistrer dans un salon vocal est formellement interdit et peut aller jusqu\'au bannissement de discord.\n04. Diffuser du contenu contraire aux lois françaises et/ou aux termes de Discord est interdit.```'
                );
                break;
            case 'exhaustiveness':
                embed.setDescription(
                    '```php\n01. Notre personnel à le dernier mot.\n02. Si un membre du personnel abuse de ses permissions, veuillez ouvrir un ticket.```'
                );
                break;
            case 'terms':
                embed.setDescription(
                    '```php\n01. The bot server aren not filtered, we do not take part in illegal servers who are using the bot.\n02. For any problems with the bot, come on the support.\n03. Before adding the bot you have to respect these articles.\n04. The bot source code, texts, contents or the ownership of TheTesters and are protected by the laws on the author rights. You are not allowed to copy, update or distribute these contents without authorization.\nAll the terms articles can be updated. The support server prevent these updates.\nThese conditions of usage are controled by the french laws.```'
                );
                break;
            case 'policy':
                embed.setDescription(
                    '```php\n01. We collect all the datas you gave us to configure the bot systems, usernames updates, user status updates & your status in the bot database (whitelisted/blacklisted).\n02. We are using the datas to introduce few systems and upgrade servers. When the bot is removed from a guild he continues stocking server datas including server members datas for the 14 next days.\n03. Datas can be removed by reseting systems (will disable them). For server members datas, reseting a system also destroy them. Finally for user datas such as: blacklist, whitelist status or even their previous names can be reset by asking bot owner or by doing "/names reset".\n04. Others commands not included with a system will not stock datas.\n05. Few logs can be stocked, can be destroyed by reseting the system or deleting the channel set.\n06. MongoDB database is used to secure datas with an enforced account where only TheTesters can access.\n07. User can asks in the support for a full reset of his datas in global but also for each guild in common with the bot. If left guild still have their datas, he can set an option to update and destroy even on the guild he left.\n08. Updates will be show on the discord support server.```'
                );
                break;
        }

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

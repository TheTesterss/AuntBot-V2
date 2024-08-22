import { LangValues } from "../enums/enums";
import { PermissionResolvable } from "discord.js";

type StringPermissionResolvable = Exclude<PermissionResolvable, bigint>;

class PermissionTranslations {
    private static readonly translations: {
        [key in PermissionResolvable as string]?: {
            [key in LangValues]?: string;
        };
    } = {
        CreateInstantInvite: {
            [LangValues.EN]: "Create Instant Invite",
            [LangValues.FR]: "Créer une invitation instantanée"
        },
        KickMembers: {
            [LangValues.EN]: "Kick Members",
            [LangValues.FR]: "Expulser les membres"
        },
        BanMembers: {
            [LangValues.EN]: "Ban Members",
            [LangValues.FR]: "Bannir les membres"
        },
        Administrator: {
            [LangValues.EN]: "Administrator",
            [LangValues.FR]: "Administrateur"
        },
        ManageChannels: {
            [LangValues.EN]: "Manage Channels",
            [LangValues.FR]: "Gérer les canaux"
        },
        ManageGuild: {
            [LangValues.EN]: "Manage Guild",
            [LangValues.FR]: "Gérer le serveur"
        },
        AddReactions: {
            [LangValues.EN]: "Add Reactions",
            [LangValues.FR]: "Ajouter des réactions"
        },
        // Ajoutez d'autres permissions et leurs traductions ici
        AttachFiles: {
            [LangValues.EN]: "Attach Files",
            [LangValues.FR]: "Joindre des fichiers"
        },
        ChangeNickname: {
            [LangValues.EN]: "Change Nickname",
            [LangValues.FR]: "Changer de pseudo"
        },
        Connect: {
            [LangValues.EN]: "Connect",
            [LangValues.FR]: "Se connecter"
        },
        CreateEvents: {
            [LangValues.EN]: "Create Events",
            [LangValues.FR]: "Créer des événements"
        },
        CreateGuildExpressions: {
            [LangValues.EN]: "Create Guild Expressions",
            [LangValues.FR]: "Créer des expressions de guilde"
        },
        CreatePrivateThreads: {
            [LangValues.EN]: "Create Private Threads",
            [LangValues.FR]: "Créer des fils privés"
        },
        CreatePublicThreads: {
            [LangValues.EN]: "Create Public Threads",
            [LangValues.FR]: "Créer des fils publics"
        },
        DeafenMembers: {
            [LangValues.EN]: "Deafen Members",
            [LangValues.FR]: "Rendre muets les membres"
        },
        EmbedLinks: {
            [LangValues.EN]: "Embed Links",
            [LangValues.FR]: "Intégrer des liens"
        },
        ManageEmojisAndStickers: {
            [LangValues.EN]: "Manage Emojis and Stickers",
            [LangValues.FR]: "Gérer les émojis et les stickers"
        },
        ManageEvents: {
            [LangValues.EN]: "Manage Events",
            [LangValues.FR]: "Gérer les événements"
        },
        ManageMessages: {
            [LangValues.EN]: "Manage Messages",
            [LangValues.FR]: "Gérer les messages"
        },
        ManageNicknames: {
            [LangValues.EN]: "Manage Nicknames",
            [LangValues.FR]: "Gérer les pseudos"
        },
        ManageRoles: {
            [LangValues.EN]: "Manage Roles",
            [LangValues.FR]: "Gérer les rôles"
        },
        ManageThreads: {
            [LangValues.EN]: "Manage Threads",
            [LangValues.FR]: "Gérer les fils"
        },
        ManageWebhooks: {
            [LangValues.EN]: "Manage Webhooks",
            [LangValues.FR]: "Gérer les webhooks"
        },
        MentionEveryone: {
            [LangValues.EN]: "Mention Everyone",
            [LangValues.FR]: "Mentionner tout le monde"
        },
        ModerateMembers: {
            [LangValues.EN]: "Moderate Members",
            [LangValues.FR]: "Modérer les membres"
        },
        MoveMembers: {
            [LangValues.EN]: "Move Members",
            [LangValues.FR]: "Déplacer les membres"
        },
        MuteMembers: {
            [LangValues.EN]: "Mute Members",
            [LangValues.FR]: "Rendre muets les membres"
        },
        PrioritySpeaker: {
            [LangValues.EN]: "Priority Speaker",
            [LangValues.FR]: "Orateur prioritaire"
        },
        ReadMessageHistory: {
            [LangValues.EN]: "Read Message History",
            [LangValues.FR]: "Lire l'historique des messages"
        },
        RequestToSpeak: {
            [LangValues.EN]: "Request to Speak",
            [LangValues.FR]: "Demander à parler"
        },
        SendMessages: {
            [LangValues.EN]: "Send Messages",
            [LangValues.FR]: "Envoyer des messages"
        },
        SendMessagesInThreads: {
            [LangValues.EN]: "Send Messages in Threads",
            [LangValues.FR]: "Envoyer des messages dans les fils"
        },
        SendPolls: {
            [LangValues.EN]: "Send Polls",
            [LangValues.FR]: "Envoyer des sondages"
        },
        SendTTSMessages: {
            [LangValues.EN]: "Send TTS Messages",
            [LangValues.FR]: "Envoyer des messages TTS"
        },
        SendVoiceMessages: {
            [LangValues.EN]: "Send Voice Messages",
            [LangValues.FR]: "Envoyer des messages vocaux"
        },
        Speak: {
            [LangValues.EN]: "Speak",
            [LangValues.FR]: "Parler"
        },
        Stream: {
            [LangValues.EN]: "Stream",
            [LangValues.FR]: "Diffuser"
        },
        UseApplicationCommands: {
            [LangValues.EN]: "Use Application Commands",
            [LangValues.FR]: "Utiliser les commandes d'application"
        },
        UseEmbeddedActivities: {
            [LangValues.EN]: "Use Embedded Activities",
            [LangValues.FR]: "Utiliser les activités intégrées"
        },
        UseExternalApps: {
            [LangValues.EN]: "Use External Apps",
            [LangValues.FR]: "Utiliser des applications externes"
        },
        UseExternalEmojis: {
            [LangValues.EN]: "Use External Emojis",
            [LangValues.FR]: "Utiliser des émojis externes"
        },
        UseExternalSounds: {
            [LangValues.EN]: "Use External Sounds",
            [LangValues.FR]: "Utiliser des sons externes"
        },
        UseExternalStickers: {
            [LangValues.EN]: "Use External Stickers",
            [LangValues.FR]: "Utiliser des stickers externes"
        },
        UseSoundboard: {
            [LangValues.EN]: "Use Soundboard",
            [LangValues.FR]: "Utiliser la table de mixage"
        },
        UseVAD: {
            [LangValues.EN]: "Use VAD",
            [LangValues.FR]: "Utiliser la détection de la voix"
        },
        ViewAuditLog: {
            [LangValues.EN]: "View Audit Log",
            [LangValues.FR]: "Voir le journal d'audit"
        },
        ViewChannel: {
            [LangValues.EN]: "View Channel",
            [LangValues.FR]: "Voir le canal"
        },
        ViewCreatorMonetizationAnalytics: {
            [LangValues.EN]: "View Creator Monetization Analytics",
            [LangValues.FR]: "Voir les analyses de monétisation du créateur"
        },
        ViewGuildInsights: {
            [LangValues.EN]: "View Guild Insights",
            [LangValues.FR]: "Voir les analyses de guilde"
        }
    };

    static getTranslation(
        permission: PermissionResolvable,
        lang: (typeof LangValues)[keyof typeof LangValues]
    ): string | undefined {
        return this.translations[permission as string]?.[lang];
    }
}

export default PermissionTranslations;

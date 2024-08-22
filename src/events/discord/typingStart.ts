import { Events, TextChannel, Typing } from "discord.js";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";
import { EventType } from "../../enums/enums";

export = {
    name: Events.TypingStart,
    type: EventType.Classic,
    once: false,
    execute: async (main: Bot, database: Database, typing: Typing) => {
        //! Trouver le fdp
        /* ((await typing.guild?.channels.cache.get('1267642212968173661')) as TextChannel).send({
            content: `<@${typing.user.id}> typed in <#${typing.channel.id}> at <t:${Math.round(typing.startedTimestamp / 1000)}:F>`
        }); */
    }
};

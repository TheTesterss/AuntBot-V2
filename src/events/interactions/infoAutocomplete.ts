import { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from "discord.js";
import { CustomEvents, EventType } from "../../enums/enums";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";

export = {
    name: CustomEvents.AutocompleteExecution,
    type: EventType.Custom,
    once: false,
    execute: async (main: Bot, database: Database, interaction: AutocompleteInteraction) => {
        if (interaction.commandName === 'info' && interaction.options.getSubcommand() === 'emoji') {
            let focus = interaction.options.getFocused();
            let emojis = interaction.client.emojis.cache
            let default_choices: string[] = emojis
                ?.map(emoji => emoji.name)
                .filter(name => name !== null)
                .slice(0, 25)!
            let focused_choices: string[] = emojis
                ?.map(emoji => emoji.name)
                .filter(name => name !== null)
                .filter(name => name?.includes(focus))
                .slice(0, 25)!
            if (focus.length <= 2) interaction.respond(default_choices?.map((value) => ({name: value, value: value})));
            else interaction.respond(focused_choices?.map(value => ({name: value, value: value})));
        }

        if (interaction.commandName === 'info' && interaction.options.getSubcommand() === 'sticker') {
            let focus = interaction.options.getFocused();
            let stickers = [];
            interaction.client.guilds.cache.forEach(g => g.stickers.cache.forEach(s => stickers.push(s)))
            let default_choices: string[] = stickers
                ?.map(sticker => sticker.name)
                .filter(name => name !== null)
                .slice(0, 25)!
            let focused_choices: string[] = stickers
                ?.map(sticker => sticker.name)
                .filter(name => name !== null)
                .filter(name => name?.includes(focus))
                .slice(0, 25)!
            if (focus.length <= 2) interaction.respond(default_choices?.map((value) => ({name: value, value: value})));
            else interaction.respond(focused_choices?.map(value => ({name: value, value: value})));
        }
    }

}

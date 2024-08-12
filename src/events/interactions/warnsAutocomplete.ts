import { AutocompleteInteraction } from "discord.js";
import Bot from "../../classes/Bot";
import Database from "../../classes/Database";
import { EventType, CustomEvents } from "../../enums/enums";
import humanizeTime from "../../utils/functions/humanizeTime";
import Fuse from "fuse.js";

export = {
    name: CustomEvents.AutocompleteExecution,
    type: EventType.Custom,
    once: false,
    execute: async (main: Bot, database: Database, interaction: AutocompleteInteraction) => {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "warns") return;

        // TODO ? : changer ça pour que la langue soit avec la db et non locale (dans handler/juste ici)
        const lang = interaction.locale === "fr" ? "fr" : "en";

        const group = interaction.options.getSubcommandGroup();
        const fullCommandName = group
            ? `${group} ${interaction.options.getSubcommand()}`
            : interaction.options.getSubcommand();

        const guildId = interaction.guildId;
        const thisGuildDb = await database.models.GuildDB.findOne({ id: guildId });

        if (!thisGuildDb) return;

        // #region actions remove
        if (fullCommandName === "actions delete") {
            let response = [];
            const maxLength = 100;

            for (const action of thisGuildDb.mod.warnActions) {
                let actionDescription;
                if (action.actionType === "permban") {
                    actionDescription = lang === "fr" ? "Bannir définitivement" : "Ban permanently";
                } else if (action.actionType === "tempban") {
                    actionDescription = `${lang === "fr" ? "Bannir pendant" : "Ban during"} ${humanizeTime(action.duration as number, "ms", lang)}`;
                } else if (action.actionType === "timeout") {
                    actionDescription = `${lang === "fr" ? "Exclure (Timeout) pendant" : "Timeout during"} ${humanizeTime(action.duration as number, "ms", lang)}`;
                } else {
                    actionDescription = "Action inconnue";
                }

                let name = `${action.warns === 10 ? action.warns : `0${action.warns}`} - ${actionDescription}`;
                if (name.length > maxLength) {
                    name = name.substring(0, maxLength - 3) + "...";
                }

                response.push({ name, value: action.warns });
            }

            response.sort((a, b) => a.value - b.value);

            response =
                response.length === 0
                    ? [{ name: "Aucune action d'avertissement sur ce serveur", value: -1 }]
                    : response;

            await interaction.respond(response);
        }
        // #endregion actions remove
        // #region remove
        else if (fullCommandName === "remove") {
            const warns = thisGuildDb.mod.warns;

            let finalArray;
            if (warns.length === 0) {
                finalArray = [{ name: "Aucun avertissement sur ce serveur", value: -1 }];
            } else {
                const userIds = [...new Set(warns.map((warn) => warn.target))];
                const userPromises = userIds.map((id) => interaction.client.users.fetch(id));
                const users = await Promise.all(userPromises);

                const sortedWarns = warns.sort((a, b) => b.id - a.id);

                const formattedWarnings = sortedWarns.map((warn) => {
                    const user = users.find((u) => u.id === warn.target);
                    const username = user?.username || "???";
                    const reason = warn.reason;

                    const formattedString = `${warn.id} - ${username} - ${reason}`;
                    return formattedString.length > 100 ? `${formattedString.slice(0, 97)}...` : formattedString;
                });

                const focusedTerm = interaction.options.getFocused();
                const fuse = new Fuse(formattedWarnings, { includeScore: true });

                let results;
                if (focusedTerm) {
                    results = fuse.search(focusedTerm);
                } else {
                    results = formattedWarnings.map((item) => ({ item })).slice(0, 25);
                }

                finalArray = results.slice(0, 25).map((result) => ({
                    name: result.item,
                    value: parseInt(result.item.split(" ")[0])
                }));
            }

            await interaction.respond(finalArray);
        }
        // #endregion remoev
    }
};

import mongoose from "mongoose";
import { LangValues } from "../enums/enums";
import { modSchema } from "./subSchemas/Guild";

const guildSchema = new mongoose.Schema({
    id: {
        unique: true,
        required: true,
        type: String
    },
    lang: {
        type: String,
        enum: LangValues,
        default: LangValues.EN
    },
    mod: {
        type: modSchema,
        default: () => ({})
    }
});

export const GuildDB = mongoose.model("Guild", guildSchema);

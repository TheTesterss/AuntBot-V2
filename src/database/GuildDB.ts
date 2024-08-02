import mongoose from 'mongoose';
import { LangValues } from '../enums/enums';

export const GuildDB = mongoose.model(
    'Guild',
    new mongoose.Schema({
        id: {
            unique: true,
            required: true,
            type: String
        },
        lang: {
            type: String,
            enum: LangValues,
            default: LangValues.EN
        }
    })
);

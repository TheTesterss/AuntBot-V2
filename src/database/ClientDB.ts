import mongoose from 'mongoose';
import { Snowflake } from 'discord.js';

export const ClientDB = mongoose.model(
    'Client',
    new mongoose.Schema({
        id: {
            unique: true,
            required: true,
            type: String
        },
        blacklist: Array<Snowflake>,
        whitelist: Array<Snowflake>
    })
);

import mongoose from 'mongoose';
import { previousNameDataSchema, blacklistSchema, whitelistSchemas } from './subSchemas/User';

export const UserDB = mongoose.model(
    'User',
    new mongoose.Schema({
        id: {
            unique: true,
            required: true,
            type: String
        },
        prevnames: previousNameDataSchema,
        blacklist: blacklistSchema,
        whitelist: whitelistSchemas
    })
);

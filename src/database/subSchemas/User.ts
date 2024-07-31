import mongoose from 'mongoose';

const warnOptionSchema = new mongoose.Schema({
    date: BigInt,
    by: String,
    reason: String,
    deleted: Boolean
});

export const previousNameDataSchema = new mongoose.Schema({
    dates: Array<BigInt>,
    names: Array<String>
});

export const blacklistSchema = new mongoose.Schema({
    isBlacklisted: Boolean,
    from: BigInt,
    to: BigInt,
    by: String,
    reason: String,
    def: Boolean,
    warns: Array<typeof warnOptionSchema>
});

export const whitelistSchemas = new mongoose.Schema({
    isWhitelisted: Boolean,
    date: BigInt
});

import mongoose from 'mongoose';

export const MemberDB = mongoose.model(
    'Member',
    new mongoose.Schema({
        id: {
            unique: true,
            required: true,
            type: String
        },
        guild_id: {
            unique: false,
            required: true,
            type: String
        }
    })
);

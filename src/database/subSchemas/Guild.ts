import mongoose from "mongoose";

const modActionSchema = new mongoose.Schema({
    mod: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
        required: true
    }
});

const warnActionSchema = new mongoose.Schema({
    warns: {
        type: Number,
        required: true
    },
    actionType: {
        type: String,
        enum: ["timeout", "tempban", "permban"],
        required: true
    },
    duration: {
        type: Number,
        required: function (this: any) {
            return this.actionType === "timeout" || this.actionType === "tempban";
        }
    }
});

const banSchema = new mongoose.Schema({
    date: {
        type: Number,
        required: true
    },

    mod: {
        type: String,
        required: true
    },

    endDate: {
        type: Number,
        required: false
    }
});

export const modSchema = new mongoose.Schema({
    bans: {
        type: Map,
        of: banSchema,
        default: {}
    },
    warns: {
        type: [modActionSchema],
        default: []
    },
    warnActions: {
        type: [warnActionSchema],
        default: []
    },
    totalWarns: {
        type: Number,
        default: 0
    }
});

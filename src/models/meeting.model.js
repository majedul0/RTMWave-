import mongoose from "mongoose";
const meetingSchema = new mongoose.Schema({
    meetingCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    scheduledAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {timestamps: true});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
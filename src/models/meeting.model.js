import mongoose from "mongoose";
const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {timestamps: true});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
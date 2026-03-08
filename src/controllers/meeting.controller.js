import httpStatus from 'http-status';
import Meeting from '../models/meeting.model.js';

const createMeetingCode = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let index = 0; index < 8; index += 1) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
};

const generateUniqueMeetingCode = async () => {
    let attempts = 0;
    while (attempts < 10) {
        const meetingCode = createMeetingCode();
        const exists = await Meeting.exists({ meetingCode });
        if (!exists) {
            return meetingCode;
        }
        attempts += 1;
    }
    throw new Error('Unable to generate unique meeting code');
};

const createMeeting = async (req, res) => {
    try {
        const { title, description, scheduledAt, hostId } = req.body;

        if (!title) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Meeting title is required' });
        }

        const meetingCode = await generateUniqueMeetingCode();

        const meeting = await Meeting.create({
            meetingCode,
            title,
            description,
            host: hostId || undefined,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        });

        return res.status(httpStatus.CREATED).json({
            message: 'Meeting created successfully',
            meeting,
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

const getMeetingByCode = async (req, res) => {
    try {
        const { meetingCode } = req.params;
        const meeting = await Meeting.findOne({ meetingCode: meetingCode?.toUpperCase() }).populate('host participants', 'name username email');

        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Meeting not found' });
        }

        return res.status(httpStatus.OK).json({ meeting });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

const listMeetings = async (_req, res) => {
    try {
        const meetings = await Meeting.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('host', 'name username email');

        return res.status(httpStatus.OK).json({ meetings });
    } catch (error) {
        console.error('Error listing meetings:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

const joinMeeting = async (req, res) => {
    try {
        const { meetingCode } = req.params;
        const { userId } = req.body;

        const meeting = await Meeting.findOne({ meetingCode: meetingCode?.toUpperCase() });
        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Meeting not found' });
        }

        if (userId && !meeting.participants.some((participant) => participant.toString() === userId)) {
            meeting.participants.push(userId);
            await meeting.save();
        }

        return res.status(httpStatus.OK).json({
            message: 'Joined meeting successfully',
            meeting,
        });
    } catch (error) {
        console.error('Error joining meeting:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
};

export {
    createMeeting,
    getMeetingByCode,
    listMeetings,
    joinMeeting,
};

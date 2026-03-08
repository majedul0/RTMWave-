import { Router } from 'express';
import {
    createMeeting,
    getMeetingByCode,
    joinMeeting,
    listMeetings,
} from '../controllers/meeting.controller.js';

const router = Router();

router.route('/').get(listMeetings).post(createMeeting);
router.route('/:meetingCode').get(getMeetingByCode);
router.route('/:meetingCode/join').post(joinMeeting);

export default router;

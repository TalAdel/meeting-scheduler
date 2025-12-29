import { Router, Request, Response } from "express";
import MeetingRepository from "../repositories/meeting.repository";
import pool from "../config/database";
import MeetingService from "../services/meeting.service";
import validateRequest from "../middlewares/validate-request";
import { MeetingValidation, UpdateMeetingValidation, RsvpValidation } from "../middlewares/validate-meeting";
import authenticate from "../middlewares/auth-request";
import MeetingUsersRepository from "../repositories/meeting-users.repository";
import MeetingUserService from "../services/meeting-user.service";
import UserRepository from "../repositories/user.repository";

const router = Router();
const meetingRepository = new MeetingRepository(pool);
const meetingUsersRepository = new MeetingUsersRepository(pool);
const userRepository = new UserRepository(pool);
const meetingService = new MeetingService(meetingRepository, pool);
const meetingUserService = new MeetingUserService(meetingUsersRepository, meetingService, userRepository);


meetingService.setMeetingUserService(meetingUserService);
//create meeting with participants
router.post('/',
    authenticate,
    [...MeetingValidation], 
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        const { title, startTime, endTime, location, notes, emails, status } = req.body;
        const ownerId = req.userId!;
        
        const result = await meetingService.createMeetingWithParticipants(
            title,
            startTime,
            endTime,
            location,
            notes,
            ownerId,
            emails,
            status
        );

        res.status(201).json(result);
});
 
//get meeting by id
router.get('/:id',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.id;
    const meeting = await meetingService.getMeetingById(meetingId);
    res.status(200).json({ meeting });
});

// Get ALL meetings for authenticated user (owned + invited to)
router.get('/',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const meetings = await meetingService.getUserMeetings(userId);
    res.status(200).json({ meetings });
});

// Get meetings where user is the owner
router.get('/owner/meetings',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const meetings = await meetingService.getAllOwnerMeetings(userId);
    res.status(200).json({ meetings });
});

//update meeting
router.put('/:id',
    authenticate,
    [...UpdateMeetingValidation], 
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.id;
    const userId = req.userId!;
    const userUpdates = req.body;

    const updatedMeeting = await meetingService.updateMeeting(meetingId, userId, userUpdates);
    res.status(200).json({ updatedMeeting });
});

//delete meeting
router.delete('/:id',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
    const meetingId = req.params.id;
    const userId = req.userId!;

    await meetingService.deleteMeeting(meetingId, userId);
    res.status(200).json({ message: 'Meeting deleted successfully' });
});

// User updates theirown status
router.patch('/:meetingId/attend-status',
    authenticate,
    [...RsvpValidation],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
    const { meetingId } = req.params;  // FIXED: was req.params.id
    const userId = req.userId!;  // From JWT token
    const { status } = req.body;
    
    const updated = await meetingUserService.updateMeetingUserStatus(meetingId, userId, status);
    res.status(200).json({ 
        message: `status updated ${status} successfully`,
        status: updated.status 
    });
});

// Owner/admin updates any participant's status
router.patch('/:meetingId/participants/:participantId',
    authenticate,
    [...RsvpValidation],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
    const { meetingId, participantId } = req.params;
    const ownerId = req.userId!;  // The authenticated user (must be owner)
    const { status } = req.body;
    
    // Verify the user is the meeting owner
    const meeting = await meetingService.getMeetingById(meetingId);
    if (!meeting) {
        res.status(404).json({ error: 'Meeting not found' });
        return;
    }
    if (meeting.ownerId !== ownerId) {
        res.status(403).json({ error: 'Only the meeting owner can update participant status' });
        return;
    }
    
    const updated = await meetingUserService.updateMeetingUserStatus(meetingId, participantId, status);
    res.status(200).json({ 
        message: 'Participant status updated',
        participant: updated 
    });
});

export default router;
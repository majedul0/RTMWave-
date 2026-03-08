import { Server } from 'socket.io';

const roomMembers = {};

const getRoomMemberList = (meetingCode) => {
    const members = roomMembers[meetingCode] || {};
    return Object.entries(members).map(([socketId, user]) => ({ socketId, user }));
};

export const connectToSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        socket.on('join-room', ({ meetingCode, user }) => {
            if (!meetingCode) {
                return;
            }

            const roomCode = meetingCode.toUpperCase();
            socket.join(roomCode);
            socket.data.meetingCode = roomCode;
            socket.data.user = user || null;
            socket.data.connectedAt = Date.now();

            if (!roomMembers[roomCode]) {
                roomMembers[roomCode] = {};
            }
            roomMembers[roomCode][socket.id] = user || null;

            const participants = getRoomMemberList(roomCode);

            io.to(socket.id).emit('room-users', participants);
            socket.to(roomCode).emit('user-joined', {
                socketId: socket.id,
                user: user || null,
            });
        });

        socket.on('chat-message', ({ meetingCode, message, sender }) => {
            if (!meetingCode || !message) {
                return;
            }

            io.to(meetingCode.toUpperCase()).emit('chat-message', {
                message,
                sender: sender || null,
                meetingCode: meetingCode.toUpperCase(),
                sentAt: new Date().toISOString(),
            });
        });

        socket.on('webrtc-offer', ({ to, offer, meetingCode, from }) => {
            if (!to || !offer) {
                return;
            }
            io.to(to).emit('webrtc-offer', {
                from: from || socket.id,
                offer,
                meetingCode: meetingCode || socket.data.meetingCode,
            });
        });

        socket.on('webrtc-answer', ({ to, answer, meetingCode, from }) => {
            if (!to || !answer) {
                return;
            }
            io.to(to).emit('webrtc-answer', {
                from: from || socket.id,
                answer,
                meetingCode: meetingCode || socket.data.meetingCode,
            });
        });

        socket.on('webrtc-ice-candidate', ({ to, candidate, meetingCode, from }) => {
            if (!to || !candidate) {
                return;
            }
            io.to(to).emit('webrtc-ice-candidate', {
                from: from || socket.id,
                candidate,
                meetingCode: meetingCode || socket.data.meetingCode,
            });
        });

        socket.on('screen-share-started', ({ meetingCode, by }) => {
            if (!meetingCode) {
                return;
            }
            socket.to(meetingCode.toUpperCase()).emit('screen-share-started', {
                by: by || socket.id,
            });
        });

        socket.on('screen-share-stopped', ({ meetingCode, by }) => {
            if (!meetingCode) {
                return;
            }
            socket.to(meetingCode.toUpperCase()).emit('screen-share-stopped', {
                by: by || socket.id,
            });
        });

        socket.on('leave-room', ({ meetingCode }) => {
            const roomCode = (meetingCode || socket.data.meetingCode || '').toUpperCase();
            if (!roomCode) {
                return;
            }

            socket.leave(roomCode);

            if (roomMembers[roomCode]) {
                delete roomMembers[roomCode][socket.id];
                if (Object.keys(roomMembers[roomCode]).length === 0) {
                    delete roomMembers[roomCode];
                }
            }

            socket.to(roomCode).emit('user-left', {
                socketId: socket.id,
                roomCode,
            });
        });

        socket.on('disconnect', () => {
            const roomCode = socket.data.meetingCode;

            if (!roomCode || !roomMembers[roomCode]) {
                return;
            }

            delete roomMembers[roomCode][socket.id];

            if (Object.keys(roomMembers[roomCode]).length === 0) {
                delete roomMembers[roomCode];
            }

            socket.to(roomCode).emit('user-left', {
                socketId: socket.id,
                roomCode,
            });
        });
    });

    return io;
};




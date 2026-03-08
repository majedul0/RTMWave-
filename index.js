import express from 'express';
import {createServer} from 'node:http';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './src/routes/user.routes.js';
import meetingRoutes from './src/routes/meeting.routes.js';
import { connectToSocket } from './src/controllers/socket.manager.js';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

const server = createServer(app);
connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/plain' }));
app.use((req, _res, next) => {
    if (typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (_error) {
        }
    }
    next();
});
app.use('/', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);



app.get('/', (req, res) => {
    return res.json({message: 'Hello World!'});
});

const start = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rtmwave';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        server.listen(app.get("port"), () => {
            console.log('Server is running on port ' + app.get("port"));
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};

start();
import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

const server = createServer(app);

const io = new Server(server);

app.set("port", process.env.PORT || 8000);



app.get('/', (req, res) => {
    return res.json({message: 'Hello World!'});
});

const start = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb+srv://islam22205101253_db_user:Rtm1971%23@cluster0.nruwfyi.mongodb.net/?appName=Cluster0';
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
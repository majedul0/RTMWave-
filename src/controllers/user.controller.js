import {httpStatus} from 'http-status';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';  

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({message: 'Email and password are required'});
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Invalid email or password'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({message: 'Invalid email or password'});
        }

        return res.status(httpStatus.OK).json({message: 'Login successful'});
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: 'Server error'});    
    }
};



const registerUser = async (req, res) => {
    try {
        const {name, username, email, password} = req.body;

        if (!name || !username || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({message: 'All fields are required'});
        }

        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({message: 'Email or username already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(httpStatus.CREATED).json({message: 'User registered successfully'});
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: 'Server error'});    
    
    }
};

export {registerUser, loginUser};
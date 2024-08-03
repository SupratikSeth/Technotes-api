const User = require('../model/User');
const Note = require('../model/Note');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean();

    if(!users?.length){
        return res.status(400).json({ message: 'No users found' });
    }

    res.json(users);
}


const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body;

    //checking all fields are present or not
    if(!username || !password){
        return res.status(400).json({ message: 'All fields are required' })
    }

    //checking for duplicate
    //using collation to check for case insensitive duplicates
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if(duplicate){
        return res.status(409).json({ message: 'Duplicate username'})
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const userObj = (!Array.isArray(roles) || !roles.length)
                        ? { username, "password": hashedPwd }
                        : { username, "password": hashedPwd, roles }

    const user = await User.create(userObj);

    if(user){
        res.status(201).json({ message: `New user ${username} created` });
    }
    else{
        res.status(400).json({ message: 'Invalid user data received' });
    }
}


const updateUser = async (req, res) => {
    const { id, username, password, roles, active } = req.body;

    //checking all fields are present or not except password
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await User.findById(id).exec();
    if(!user){
        return res.status(400).json({ message: 'User not found' });
    }

    //using collation to check for case insensitive duplicates
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if(password){
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.username} updated` });
}


const deleteUser = async (req, res) => {
    const { id } = req.body;

    if(!id){
        return res.status(400).json({ message: 'User ID required' });
    }

    const note = await Note.findOne({ user: id }).lean().exec();
    if(note){
        return res.status(400).json({ message: 'User is associated with note' });
    }

    const user = await User.findById(id).exec();
    if(!user){
        return res.status(400).json({ message: 'No user found' });
    }

    const result = await user.deleteOne();

    const reply = `Username ${user.username} with ID ${user._id} deleted`;

    res.json(reply);
}


module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
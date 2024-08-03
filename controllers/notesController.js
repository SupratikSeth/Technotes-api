const User = require('../model/User');
const Note = require('../model/Note');
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean();

    if(!notes?.length){
        return res.status(400).json({ message: 'No notes found' });
    }

    const newNotes = [];
    for(let note of notes){
        const { user } = note;
        const foundUser = await User.findOne({ _id: user }).lean().exec();
        const newNote = { ...note, username: foundUser.username };
        newNotes.push(newNote);
    }

    res.json(newNotes);
})


const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    //checking all fields are present or not
    if(!user || !title || !text){
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await Note.findOne({ title }).lean().exec();
    if(duplicate){
        return res.status(409).json({ message: 'Duplicate note title'})
    }

    const noteObj = { user, title, text };

    const note = await Note.create(noteObj);

    if(note){
        res.status(201).json({ message: `New note created` });
    }
    else{
        res.status(400).json({ message: 'Invalid note data received' });
    }
})


const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    if(!id || !user || !title || !text || typeof completed !== 'boolean'){
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec();
    if(!note){
        return res.status(400).json({ message: 'Note not found' });
    }

    const duplicate = await Note.findOne({ title }).lean().exec();
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate note' })
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;

    const updatedNote = await note.save();

    res.json({ message: `${updatedNote.title} updated` });
})


const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if(!id){
        return res.status(400).json({ message: 'Note ID required' });
    }

    const note = await Note.findOne({ _id: id }).exec();
    if(!note){
        return res.status(400).json({ message: 'No note found' });
    }

    const result = await Note.deleteOne({ _id: id });

    const reply = `Username ${note.title} with ID ${note._id} deleted`;

    res.json(reply);
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}
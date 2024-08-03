const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose)
const Schema = mongoose.Schema;

const noteSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

noteSchema.plugin(AutoIncrement, {
    inc_field: 'ticket', //increment field name is ticket which will be present in the Note collection
    id: 'ticketNums', // we wont see this field inside the Note collection, a seperate collection named 'counter' will be created & we can see the id inside the 'counter' collection
    start_seq: 500 //starting sequence number of the notes
})

module.exports = mongoose.model('Note', noteSchema);
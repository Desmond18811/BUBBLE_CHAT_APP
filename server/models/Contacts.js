import mongoose from "mongoose"

const contactSchema = new mongoose .Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }, 
    contactsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        Default: Date.now()
    }
})

contactSchema.index({ userId: 1, contactsId: 1}, {unique:true})

const Contact = mongoose.model('Contact', contactSchema)

export default Contact
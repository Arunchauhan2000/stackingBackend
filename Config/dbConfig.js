const {mongoose} = require('mongoose')


exports.dbConnection = async() =>{
    try {
        await mongoose.connect('mongodb://localhost:27017/staking')
        console.log('MongoDb Connected')
    } catch (error) {
        console.log(error.message)
    }
}
const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            callback(null, true); // first parameter represents error & second parameter represents allowed boolean either true or false
        }
        else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, //sets access control allowed credentials to true
    optionsSuccessStatus: 200
}

module.exports = corsOptions;
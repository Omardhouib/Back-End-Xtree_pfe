const mongoose=require('mongoose');

const LocationSchema = mongoose.Schema(
    {
        SiteName: {
            type : String,
            required : true
        },
        AutomaticIrrigation: {
            type : Boolean,
            required : false,
            default : false
        },
        Description: {
            type : String,
            required : true
        },
        Coordinates: [Number]
        ,
        Created_date: {
            type : Date,
            default : Date.now()
        },
        Sensor_ids: [mongoose.Schema.Types.ObjectId]
        ,
    }
);

module.exports=mongoose.model('Location',LocationSchema);

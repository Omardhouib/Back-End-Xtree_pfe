const mongoose=require('mongoose');
const SensorsSchema= mongoose.Schema({
    name: {
        type : String
    },
    SensorIdentifier: {
        type : String,
        required : true
    },
    SensorType: {
        type : String,
        required : true
    },
    Description: {
        type : String,
    },
    SensorCoordinates: [Number]
    ,
    Created_date: {
        type : Date,
        default : Date.now()
    },
    data: []
    ,
    Rules :[
        {
            Status: {
                type : Boolean,
                default : false
            },
            StartTime: {
                type : Number,
            },
            Tmax: {
                type : Number,
            },
            Tmin: {
                type : Number,
            },
            Notifications : {
                SMS : {type : Boolean  },
                Email : {type : Boolean  },
                Push : {type : Boolean  },
            },
            Realy_ids: []
        }
        
    ],
    uv :{
     type: Number
    },
    status :{
      type: Boolean,
      default : true
    }

});
module.exports=mongoose.model('Sensors',SensorsSchema);

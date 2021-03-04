const express = require('express');
const router =express.Router();
const Sensor  = require('../Models/Sensor');
const Data  = require('../Models/Data');
const User  = require('../Models/User');
const Shared  = require('./shared');
const Location  = require('../Models/Location');
var jwt = require('jsonwebtoken');
const https = require('https');
const querystring = require('querystring');
const socket = require('socket.io');
const mongoose=require('mongoose');
const nodemailer = require('nodemailer');
const fastcsv = require("fast-csv");
const fs = require("fs");
var PythonShell = require('python-shell');
var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * 1 *', async function() {
    console.log('You will see this message every second');
    users = await User.find({});
    users.forEach(async user => {
    console.log("heree");
    for (let item of user.Location_ids) {
      //  console.log("heree 1");
        data = [];
        data2 = [];
        data3 = [];
        locationObject = await Location.findById(item);
        if(locationObject){
            for(let Sens of locationObject.Sensor_ids){
           //     console.log("heree 2");
                if(locationObject){
                let uv= await getWeather(locationObject.Coordinates[0],locationObject.Coordinates[1]);
                sensor = await Sensor.findById(Sens);
                if(sensor && locationObject) {
                    sensor.uv = uv.daily[0]["uvi"];
                    await sensor.save();
                    sensor.data.splice(sensor.data.length-401, sensor.data.length).forEach( d => {
                        if (d){
                            data2.push({loc: locationObject.SiteName, sesnosr: sensor.id, air_temp: d.temperature, uv: sensor.uv, air_humidity: d.humidite, soil_temp: d.temperatureSol});           

                        }
                    })
                }
            }
            }
    
        // data2.push(sensor.data);
        // data3.push({uv:sensor.uv});  
        // data = [...data2, ...data3];
    if(data2.length > 0){
        const ws = fs.createWriteStream("AI/AI.csv");
        console.log("data: ",data2);
        fastcsv
        .write(data2,{ headers: true })
        .pipe(ws)
        .on('end', () => {
            console.log('CSV file successfully processed');
          });
        }
    }
    
    }
    });
  }, null, true, 'America/Los_Angeles');
  job.start();

//module.exports.Email = EmailUser();
function verifyToken(req, res, next) {
    let payload;

    if(req.query.token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    try{payload = jwt.verify(req.query.token, process.env.token_Key);} catch (e) {
        return res.status(400).send('Invalid User');
    }
    if(!payload) {
        return res.status(401).send('Unauthorized request');
    }

    decoded=jwt.decode(req.query.token, {complete: true});
    req.userId = decoded.payload.id;

    next()
}
router.get('/',verifyToken, async (req , res)=>{

        res.json({status:"ok" , response : "dashboard works"});

});

router.post('/onoff',verifyToken, async (req , res)=>{
    const spawn = require('child_process').spawn;
    const ls = spawn('python', ['routes/remote.py',req.query.SensorId, req.query.status]);
    
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    
    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    
    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    console.log('update');
    console.log(req.params.id);
    try {
        sens = await Sensor.findById(req.body.id);
        if (sens && sens.status !== req.body.status){
            sens.status = req.body.status;
            console.log('update1');
            sens = await sens.save();
            console.log('update2');
        }
        res.json({status: "ok", message: 'status Updated'});
    } catch(e)
    {console.log(e)}

});

router.post('/updateSensor',verifyToken,async (req,res) =>
{
    console.log('update');
    console.log(req.body.id);
    try {
        sens = await Sensor.findById(req.body.id);
        if (sens.status !== req.body.status)
            sens.status = req.body.status;
           
        sens = await sens.save();
        console.log(sens);
        res.json({status: "ok", message: 'status Updated'});
    } catch(e)
    {console.log(e)}
});

router.get('/dash',verifyToken,async (req, res) =>
{
    /*
    * send data like this
    *         {
            "SensorIdentifier": "123",
            "humidite":"25",
            "temperature":23,
            "batterie":25,
            "humiditéSol":21
                }
    * */
    user = await User.findById(req.userId);
    // get locations
    var data =[];

    i = 0;
    for (const item of user.Location_ids) {
        var result = {};
        locationss = await Location.findById(item);

        result.location = locationss;
        result.sensor =[];
        for (const element of locationss.Sensor_ids) {
            Sens = await Sensor.findById(element);
            result.sensor.push(Sens);
        }
        data.push(result);
    }
    // Sens = await Sensor.findOne({SensorIdentifier: req.body.SensorIdentifier});


    //console.log(Sens.data);
    //await Sens.save();
    return res.status(200).json({status: "ok", message: data});
});
router.get('/sidenav',verifyToken, async (req , res)=>{
            All_User_Locations_names = [];
            user = await User.findById(req.userId);
            for (const item of user.Location_ids) {
                locationss = await Location.findById(item).select('SiteName Sensor_ids');
            //    console.log(locationss.toString());
            if(locationss){
                All_User_Locations_names.push(locationss);
            }
              
            }


    res.json({status:"ok" , response : All_User_Locations_names});

});
router.get('/profile',verifyToken, async (req , res)=>{
    // await new Promise(resolve => setTimeout(resolve, 5000));
    All_User_Locations = [];
    user = await User.findById(req.userId);
    for (const item of user.Location_ids) {
        locationss = await Location.findById(item).select('SiteName Sensor_ids Created_date').sort({Created_date: 1});
        All_User_Locations.push(locationss);
    }


    res.json({status:"ok" , response : {"user" : user ,"locations": All_User_Locations}});

});
router.post('/UpdateProfile',verifyToken, async (req , res)=>{
    All_User_Locations = [];
    user = await User.findById(req.userId);
    if (user.password === req.body.password)
    {
        if (req.body.FirstName.length > 0 && req.body.FirstName !== user.FirstName ) {
            console.log('true');
            user.FirstName = req.body.FirstName;
        }
        if (req.body.LastName.length > 0 && req.body.LastName !== user.LastName ) {
            console.log('LastName');
            user.LastName = req.body.LastName;
        }
        if (req.body.email.length > 0 && req.body.email !== user.email ) {
            console.log('email');
            user.email = req.body.email;
        }
        if (req.body.newPassword.length > 0 && req.body.newPassword !== user.password ) {
            console.log('true');
            user.password = req.body.newPassword;
        }
        if (req.body.smsNotif !== undefined && req.body.smsNotif !== "" && req.body.smsNotif !== user.Notifications.SMS ) {
            console.log('changing sms notif');
            user.Notifications.SMS= req.body.smsNotif;
        }
        if (req.body.emailNotif !== undefined && req.body.emailNotif !== "" && req.body.emailNotif !== user.Notifications.Email ) {
            console.log('email notif ');
            user.Notifications.Email = req.body.emailNotif;
        }
        if (req.body.pushNotif !== undefined && req.body.pushNotif !== "" && req.body.pushNotif !== user.Notifications.Push ) {
            console.log('push notif');
            user.Notifications.Push= req.body.pushNotif ;
        }
        await user.save();
        return res.json({status:"ok" , message : "Profile Updated \n Plz refrech the page" , response : {"user" : user}});
    } else return res.json({status:"err" , message : "Wrong Password"});
});
//// RelayConfiguration 5465444444444444444444444444444444464654654654654654
router.post('/ProcessConfiguration',verifyToken, async (req , res)=>{
    try {
        console.log('relay Configuration', req.body.ProcessState);
        console.log('relay SensorId', req.body.SensorId);
        Sens = await Sensor.findById(req.body.SensorId);
        if (!Sens) {
            return res.json({status:"err" , message : "No Sensor Found" });
        }
        console.log('Sensor ',Sens.Rules[Sens.Rules.length -1 ].Status);
        Sens.Rules[Sens.Rules.length -1].Status = req.body.ProcessState;
        await Sens.save();
        state = req.body.ProcessState ? ' Started' :' Stopped';
        return res.json({status:"ok" , message : "Process"+state });
    } catch (e) {
        console.log(e.toString());
    }
});



router.get('/SensorsData',verifyToken, async (req , res)=>{
    sensors = [];
    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        locations = await Location.findById(req.query.location_id);
        for (const item of locations.Sensor_ids) {
            Sens = await Sensor.findById(item);
            sensors.push(Sens);
        }
    } catch (e) {
        res.json({status:"err" , response : e.toString()});
    }

    /*for (const item of user.Location_ids) {
        locationss = await Location.findById(item).select('SiteName Sensor_ids');
        All_User_Locations_names.push(locationss);
    }

*/
    res.json({status:"ok" , response : sensors , location : locations});

});
router.get('/notify', async (req , res)=>{

    user = await User.findById(req.body.UserId);
    console.log("notif user",user);
    if (user==={} || user===undefined)
    {return ;}
    if (user.Notifications.Push === true)
    {
        console.log('user id for notification', req.body.UserId);
        Shared.NotifyyUser(req.body.UserId,req.body.data );
    }
    if (user.Notifications.Email === true)
    {
        console.log('user.email ',user.email);
        console.log('req.body.data  ',req.body.data.text );
        Shared.EmailUser(user.email, 'SmailSubject' ,req.body.data.text );
    }
    res.json({status:"ok" , message : "notif sent" });

});
router.get('/3mor', verifyToken ,async (req , res)=>{
  
    try{
        console.log("weither request",req.query);
        locations = await Location.findById(req.query.location_id);
        let uv= await getUV(locations.Coordinates[0],locations.Coordinates[1]);
        return res.status(200).json({ UVforcast : uv[0]['value']});
    } catch (e) {
        console.log('here 5');
        return res.status(400).json({status: "err", message: e.toString()});
    }
})
router.post('/AI', verifyToken, async (req, res) =>{
    user = await User.findById(req.userId);
    console.log(user);
    for (let item of user.Location_ids) {
        locationObject = await Location.findById(item);
        for(let Sens of locationObject.Sensor_ids){
    console.log(locationObject);
        let uv= await getUV(locationObject.Coordinates[0],locationObject.Coordinates[1]);
        sensor = await Sensor.findById(Sens);
        sensor.uv = uv[0]['value'];
        await sensor.save();}}
        return res.status(200).json(sensor);

});



router.get('/weither', verifyToken ,async (req , res)=>{

    try{
        console.log("weither request",req.query);
        locations = await Location.findById(req.query.location_id);
        // const url = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'
        let h = await getWeither(locations.Coordinates[0],locations.Coordinates[1]);
        //console.log('weither data' ,h);
        let uv= await getUV(locations.Coordinates[0],locations.Coordinates[1]);

        return res.status(200).json({status: "ok", message: {weither :h , UVforcast : uv}});
    } catch (e) {
        console.log('here 5');
        return res.status(400).json({status: "err", message: e.toString()});
    }
});

router.get('/getweather/:id', verifyToken ,async (req , res)=>{

    try{
        locations = await Location.findById(req.params.id);
        // const url = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'
        let Weather = await getWeither(locations.Coordinates[0],locations.Coordinates[1]);
        
            return res.json(Weather.daily);
    } catch (e) {
        console.log('here 5');
        return res.status(400).json({status: "err", message: e.toString()});
    }
});
router.get('/getUltraV/:id', verifyToken ,async (req , res)=>{

    try{
        locations = await Location.findById(req.params.id);
        //console.log('weither data' ,h);
        let uv= await getUltraV(locations.Coordinates[0],locations.Coordinates[1]);
        

        return res.json(uv.current);
    } catch (e) {
        console.log('here 5');
        return res.status(400).json({status: "err", message: e.toString()});
    }
});

router.get('/getUV', verifyToken ,async (req , res)=>{

    try{
        locations = await Location.findById(req.query.location_id);
        //console.log('weither data' ,h);
        let uv= await getUltraV(locations.Coordinates[0],locations.Coordinates[1]);

        return res.json(uv);
    } catch (e) {
        console.log('here 5');
        return res.status(400).json({status: "err", message: e.toString()});
    }
});

function getWeather(long,lat ) {
    return new Promise(function (resolve, reject) {
        let data = '';
        let data1 = '';
        // GET parameters
        const parameters = {
            appid: process.env.key,
            lat: lat,//36.717199016072186
            lon: long,//10.215536125104649
            units: 'metric'
        };

// GET parameters as query string : "?id=123&type=post"
        const get_request_args = querystring.stringify(parameters);
        var options = {
            host : 'api.openweathermap.org',
            path:  '/data/2.5/onecall?'+get_request_args,
            json: true,
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            },
        }

        // api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={your api key}    process.env.token_Key
        https.get(options,(resp) => {


            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            //console.log('here 2');
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                //console.log(JSON.parse(data).explanation);
                data1 = JSON.parse(data);
                resolve(data1);
            });
            //console.log('here 3');
        }).on("error", (err) => {
            console.log("Error: " + err.message + err.code);
            reject(err.message)
        });
    });
}
function getUltraV(long,lat) {
    try {
        return new Promise(function (resolve, reject) {
            let data = '';
            let data1 = '';
            // GET parameters
            const parameters = {
                appid: "9c87aea7eb554790a776132131339754",
                lat: lat,//36.717199016072186
                lon: long,
                units: 'metric'
            };
// GET parameters as query string : "?id=123&type=post"
            const get_request_args = querystring.stringify(parameters);
            var options = {
                host: 'api.openweathermap.org',
                path: '/data/2.5/onecall?' + get_request_args,
                json: true,
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
            }
            // api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={your api key}    process.env.token_Key
            https.get(options, (resp) => {
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                //console.log('here 2');
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    console.log(JSON.parse(data).explanation);
                    data1 = JSON.parse(data);
                    resolve(data1);
                });
                //console.log('here 3');
            }).on("error", (err) => {
                console.log("Error: " + err.message + err.code);
                reject(err.message)
            });
        });
    } catch (e) {
        console.log('getUV :',e.toString());
    }
}


function getWeither(long,lat ) {
    return new Promise(function (resolve, reject) {
        let data = '';
        let data1 = '';
        // GET parameters
        const parameters = {
            appid: "9c87aea7eb554790a776132131339754",
            lat: lat,//36.717199016072186
            lon: long,//10.215536125104649
            units: 'metric'
        };

// GET parameters as query string : "?id=123&type=post"
        const get_request_args = querystring.stringify(parameters);
        var options = {
            host : 'api.openweathermap.org',
            path:  '/data/2.5/onecall?'+get_request_args,
            json: true,
            headers: {
                "content-type": "application/json",
                "accept": "application/json"
            },
        }

        // api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={your api key}    process.env.token_Key
        https.get(options,(resp) => {


            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            //console.log('here 2');
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                //console.log(JSON.parse(data).explanation);
                data1 = JSON.parse(data);
                resolve(data1);
            });
            //console.log('here 3');
        }).on("error", (err) => {
            console.log("Error: " + err.message + err.code);
            reject(err.message)
        });
    });
}
function getUV(long,lat) {
    try {
        return new Promise(function (resolve, reject) {
            let data = '';
            let data1 = '';
            // GET parameters
            const parameters = {
                appid: "9c87aea7eb554790a776132131339754",
                lat: lat,//36.717199016072186
                lon: long,//10.215536125104649
            };
// GET parameters as query string : "?id=123&type=post"
            const get_request_args = querystring.stringify(parameters);
            var options = {
                host: 'api.openweathermap.org',
                path: '/data/2.5/uvi/forecast' + get_request_args,
                json: true,
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
            }
            // api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={your api key}    process.env.token_Key
            https.get(options, (resp) => {
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                //console.log('here 2');
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    console.log(JSON.parse(data).explanation);
                    data1 = JSON.parse(data);
                    resolve(data1);
                });
                //console.log('here 3');
            }).on("error", (err) => {
                console.log("Error: " + err.message + err.code);
                reject(err.message)
            });
        });
    } catch (e) {
        console.log('getUV :',e.toString());
    }
}

/******************************* socket io ****************************************/
const chat = io
    .of('/dashboard/IrrigationState')
    .on('connection', (socket) => {
        socket.on('getdata', async (message) => {
            //console.log('message hello ',message);
            //console.log('getdata', await getIrrigationState(message.LocationId, message.Accesstoken));
            socket.emit('getdata',  await getIrrigationState(message.LocationId, message.Accesstoken));
        });

        socket.on('changedata', (message) => {
            //console.log('change data');
            ChangeIrrigationState(message.LocationId , message.Accesstoken, message.NewState);
        });
    });
Notification = [];
const notif = io
    .of('/dashboarddddddd/Notification')
    .on('connection', (socket) => {
        // socket.emit('getNotification', 'hello notification' );
        //console.log('notiy ' , socket.id);
        //console.log('Notification ' , Notification);
        socket.on('getNotification', async (message) => {
            console.log('get notification message',message);
            //console.log('getChartdata', socket.id);
            //console.log('SocketClients length ', SocketClients.length);
            if (Notification.length === 0)
            {
                //console.log('create 1');
                let clientInfo = {};
                clientInfo.socketId = socket.id;
                clientInfo.token = message.Accesstoken;
                clientInfo.UserId = message.UserId;
                Notification.push(clientInfo);
            } else
            {
                let exist = false;
                Notification.forEach(item => {
                    if (item.socketId === socket.id)
                    {
                        console.log('Socket Exists');
                    }
                });
                if (exist === false)
                {
                    console.log('create 2');
                    let clientInfo = {};
                    clientInfo.socketId = socket.id;
                    clientInfo.token = message.Accesstoken;
                    clientInfo.UserId = message.UserId;
                    Notification.push(clientInfo);
                }
            }
            console.log('Notification Clients' , Notification);
            // socket.emit('getNotification', 'hello notification' );
        });
        socket.on('getNotification', (message) => {
            //console.log('change data');
        });
        socket.on('disconnectNotification', (message) => {
            console.log('disconnectNotification' , message);
            let i = 0;
            /*
            Notification.forEach(item => {
                if (item.socketId === socket.id)
                    Notification.splice(i,1);
                i++;
            })*/
        });
        socket.on('disconnect', (message) => {
            //console.log('disconnect' , message);
            let i = 0;
            Notification.forEach(item => {
                if (item.socketId === socket.id)
                    Notification.splice(i,1);
                i++;
            })
        });
    });

async function ChangeIrrigationState(LocationId, AccessToken, NewState) {
    try {
        payload = jwt.verify(AccessToken, process.env.token_Key);
    } catch (e) {
        console.log('token not verified');
        return;
    }
    if (!payload) {
        console.log('empty payload');
        return;
    }
    decoded = jwt.decode(AccessToken, {complete: true});
    user = await User.findById(decoded.payload.id);
    if (!user) {
        console.log('empty user ', user.toString());
        return;
    }
    locationss = await Location.findById(LocationId);
    if (!locationss) {
        console.log('empty locationss ', locationss.toString());
        return;
    }
    locationss.AutomaticIrrigation = NewState;
    await locationss.save();
}
async function getIrrigationState(LocationId, AccessToken) {
try {
    return new Promise(async function(resolve, reject) {
        if (LocationId === 'none here')
        {
            reject(console.log('no location Id'));
            return ;
        }

        payload = jwt.verify(AccessToken, process.env.token_Key);

    if (!payload) {
        console.log('empty payload');
        return;
    }
    decoded = jwt.decode(AccessToken, {complete: true});
    user =  await User.findById(decoded.payload.id);
    if (!user) {
        console.log('empty user ', user);
        return;
    }
    locationss =  await Location.findById(LocationId);
    if (!locationss) {
        console.log('empty locationss ', locationss);
        return;
    }
    console.log('return value', await locationss.AutomaticIrrigation);
            resolve(await locationss.AutomaticIrrigation) // successfully fill promise
    })
} catch (e) {
    console.log('token not verified');
    return;
}
}
function NotifyUser(UserId, data) {
    console.log("UserId" , UserId);
    /****
     * data {
     * icon: 'info','warning',error,success
      title: 'Oops...',
      text: 'resJSON.message,'
      }
     * *******/
    if (!UserId)
    {return;}
    //generate token
    Notification.forEach(item => {
        console.log('item ', item);
        console.log('Notification ', UserId);
        if (item.UserId === UserId) {
            console.log('Needs Update');
            console.log('socket id ' , item.socketId);
            console.log('new data' , data);
            notif.to(item.socketId).emit('getNotification', data);
            // console.log('state' , state);
            // socket.emit('getNotification', 'hello notification' );
        }
    });
}
function EmailUser(Email, data) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Mailer_email,
            pass: process.env.Mailer_pass
        }
    });

    var mailOptions = {
        from: 'SmartIrrigation',
        to: 'fouzai.alaa@gmail.com',
        subject: 'Smart Irrigation',
        text: 'hello555'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = router;

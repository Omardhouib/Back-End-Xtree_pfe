const express = require('express');
const router =express.Router();
const Location = require('../Models/Location');
const User = require('../Models/User');
var jwt = require('jsonwebtoken');

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
    try{
        All_User_Locations = [];
        user = await User.findById(req.userId);
        for (const item of user.Location_ids) {
            locationss = await Location.findById(item);
            if(locationss){
                All_User_Locations.push(locationss);
            }
           
        }
        res.json({status:"ok" , Locations : All_User_Locations});
    }catch (e) {
        res.json({message:e});
    }
});

router.get('/getlocation',verifyToken, async (req , res)=>{
    try{
        All_User_Locations = [];
        user = await User.findById(req.userId);
        for (const item of user.Location_ids) {
            locationss = await Location.findById(item);
            if(locationss){
                All_User_Locations.push(locationss);
            }
            
        }
        res.json(All_User_Locations);
    }catch (e) {
        res.json(e);
    }
});


router.get('/getlastlocation',verifyToken, async (req , res)=>{
    try{
        All_User_Locations = [];
        user = await User.findById(req.userId);
        for (const item of user.Location_ids) {
            locationss = await Location.findById(item);
            if(locationss){
                All_User_Locations.push(locationss);
            }
            
        }
        res.json(All_User_Locations[0]);
    }catch (e) {
        res.json(e);
    }
});

router.get('/getLocationByid/:id', verifyToken, async (req, res) => {
    try {
    user = await User.findById(req.userId);
    if (!user) {
        return res.json({status: "err", message: 'No User Found'});
    }
    Loc = await Location.findOne({_id : req.params.id});
    if (Loc){
        //console.log('your device: ',sens.data);

        return res.json(Loc);
    }
} catch (e) {
    console.log(e);
}
});
router.get('/getLocationSensByid/:id', verifyToken, async (req, res) => {
    try {
    user = await User.findById(req.userId);
    if (!user) {
        return res.json({status: "err", message: 'No User Found'});
    }
    Loc = await Location.findOne({_id : req.params.id});
    if (Loc){
        //console.log('your device: ',sens.data);
        return res.json(Loc.Sensor_ids);
    }
} catch (e) {
    console.log(e);
}
});

router.put('/updateloc',verifyToken,async (req,res) =>
{
    console.log('update');
    console.log(req.body.id);
    try {
        Loc = await Location.findById(req.body.id);
        console.log(Loc);
        if (Loc.SiteName !== req.body.SiteName)
            Loc.SiteName = req.body.SiteName;
        if (Loc.Description !== req.body.Description)
            Loc.Description = req.body.Description;
        console.log(Loc.Coordinates[0] === req.body.Coordinates[0]);
        console.log(req.body.Coordinates[0]);
        console.log(req.body.Coordinates[1]);
            Loc.Coordinates = [req.body.Coordinates[0] , req.body.Coordinates[1] ];
        Loc = await Loc.save();
        console.log(Loc);
        res.json({status: "ok", message: 'Location Updated'});
    } catch(e)
    {console.log(e)}
});


router.post('/Add',verifyToken,async (req,res) =>
{
    console.log(req.userId);
    console.log('check if location exists');
    try{
        user = await User.findById(req.userId);
        let location = new Location();
        location.SiteName=req.body.SiteName;
        location.Coordinates=req.body.Coordinates;
        location.Description=req.body.Description;
        console.log(location._id);
        user.Location_ids.forEach(function (item) {
            if (item.toString() == location._id)
                res.json({status:"err" , message: 'Location already Exists'});
        });
        user.Location_ids.push(location._id);
        await user.save();
        await location.save();
        res.json({status:"ok" , message: 'Location Added', UserData : user});
    }catch (err) {
        res.json({ message:err });
    }
});

router.post('/remouve',verifyToken,async (req,res) =>
{
    console.log('check if location exists');
    Loc = await Location.findById(req.body.LocationId);
    if (! Loc) {
        console.log('location not found');
        console.log(req.body.LocationId);
        res.json({ message:'Location not found' });
    }
    try{
        user = await User.findById(req.userId);
        console.log(Loc);
        Loc.deleteOne();

        const index = user.Location_ids.indexOf(req.body.LocationId);
        console.log(index);
        if (index > -1) {
            user.Location_ids.splice(index, 1);
        }
        user = await user.save();
        console.log(user);
        res.json({status:"ok" , message: 'Location Deleted', UserData : user});
    }catch (e) {
        res.json({ message:e });
        console.log(e);
    }
});

router.post('/update',verifyToken,async (req,res) =>
{
    console.log('update');
    console.log(req.body.id);
    try {
        Loc = await Location.findById(req.body.id);
        console.log(Loc);
        if (Loc.SiteName !== req.body.SiteName)
            Loc.SiteName = req.body.SiteName;
        if (Loc.Description !== req.body.Description)
            Loc.Description = req.body.Description;
        console.log(Loc.Coordinates[0] === req.body.Coordinates[0]);
        console.log(req.body.Coordinates[0]);
        console.log(req.body.Coordinates[1]);
            Loc.Coordinates = [req.body.Coordinates[0] , req.body.Coordinates[1] ];
        Loc = await Loc.save();
        console.log(Loc);
        res.json({status: "ok", message: 'Location Updated'});
    } catch(e)
    {console.log(e)}
});







module.exports = router;

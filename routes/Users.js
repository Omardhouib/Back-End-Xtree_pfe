const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');






router.post('/register',async (req,res) =>
{
    console.log(req.body);
    let user=new User({
        FirstName : req.body.FirstName,
        LastName :req.body.LastName,
        email :req.body.email,
        password :req.body.password,
        enabled :req.body.enabled,
    });
    console.log('FirstName  :',user.FirstName);
    try{
        const NewUser =await User.find({ email : req.body.email });
        if (NewUser === undefined || NewUser.length == 0 )
        {
            var salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
            user = await user.save();
            res.json({status:"ok" , message: 'Account Create ! You can now Login'});
            return ;
        }
        console.log('hello');
        //res.header("Access-Control-Allow-Origin", "*");
        //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"err" , message: 'Email Already Exists'});
    }catch (err) {
        //res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }

});


router.get('/users',async (req , res)=>{
    try{
        const user=await User.find().limit(5);
        res.header("Access-Control-Allow-Headers", "*");
        res.json(user);
    }catch (e) {
        res.json({ message:err.message });
    }
});

router.post('/login',async (req,res) =>
{
    try{
        // await new Promise(resolve => setTimeout(resolve, 5000));
        const NewUser =await User.find({ email : req.body.email  }).limit(1);
        console.log(NewUser.length);
        //await sleep(2000);
        if (NewUser.length < 1)
        {
            await res.json({status: "err", message: 'Email Does not Exists'});
            return ;
        }
        if (!bcrypt.compareSync(req.body.password, NewUser[0].password))
        {
            await res.json({status:"false" , message: 'Wrong Password'});
            return ;
        }
        if (NewUser[0].enabled === 0 )
        {
            await res.json({status:"err" , message: 'User is Disabled'});
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var payload = {
            id: NewUser[0]._id,
        };
        let token = jwt.sign(payload,process.env.token_Key);
        res.json({status:"ok" , message: 'Welcome Back', UserData : NewUser , token});
        console.log("done ")
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }

});
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
router.post('/loginGmail',async (req,res) =>
{

    if (!req.body.resp.email)
    {
        res.json({status:"err" , message: 'email error'});
        console.log(req.body.resp.email);
        return ;
    }
    try{
        // await new Promise(resolve => setTimeout(resolve, 5000));
        const NewUser =await User.find({ email : req.body.resp.email  }).limit(1);
        console.log(NewUser.length);
        if (NewUser.length < 1)
        {
            await res.json({status: "err", message: 'Email Does not Exists'});
            return ;
        }
        if (NewUser[0].enabled === 0 )
        {
            await res.json({status:"err" , message: 'User is Disabled'});
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var payload = {
            id: NewUser[0]._id,
        };
        let token = jwt.sign(payload,process.env.token_Key);
        res.json({status:"ok" , message: 'Welcome Back', UserData : NewUser , token});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
router.post('/RegisterGmail',async (req,res) => {
    console.log('New Request :',req.body);
    if (!req.body.resp.email)
    {
        res.json({status:"err" , message: 'email error'});
        console.log(req.body.resp.email);
        return ;
    }
    const NewUser =await User.find({ email : req.body.resp.email  }).limit(1);
    console.log(NewUser.length);
    if (NewUser.length > 0)
    {
        await res.json({status: "err", message: 'Email Exists'});
        return ;
    }
    let user=new User({
        FirstName : req.body.resp.firstName,
        LastName :req.body.resp.lastName,
        email :req.body.resp.email,
        password : '123123',
        enabled : true,
    });
    try{
        const NewUser =await User.find({ email : req.body.resp.email });
        if (NewUser === undefined || NewUser.length === 0 )
        {
            user=await user.save();
            res.json({status:"ok" , message: 'Account Create ! You can now Login'});
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"err" , message: 'Email Already Exists'});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});


module.exports = router;

const express = require('express');
require('dotenv/config');
const app = express();
var jwt = require('jsonwebtoken');
const mongoose=require('mongoose');
const socket = require('socket.io');
const path = require('path');
mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true , useUnifiedTopology: true } ,() => console.log('connected to BD')).catch(error => handleError(error));
const bodyParser= require('body-parser');

// app.use(express.static(path.join(__dirname, '../frontend/dist/AdminLTE')));


app.use(bodyParser.json());


//const server = app.listen(3000,'0.0.0.0');
const server = app.listen(3000,'0.0.0.0');
global.io = socket.listen(server);
module.exports = io;
const postRouter = require('./routes/posts');
const UserRouter = require('./routes/Users');
const SensorRouter = require('./routes/sensor');
const LocationRouter = require('./routes/location');
const DashboardRouter = require('./routes/dashboard');




app.use('/api/posts',postRouter);
app.use('/api/users',UserRouter);
app.use('/api/sensors',SensorRouter);
app.use('/api/location',LocationRouter);
app.use('/api/dashboard',DashboardRouter);

/*app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, '../frontend/dist/AdminLTE/index.html'))
});*/

app.post('/',(req,res)=>{
    console.log(req.body);
    res.send(req.body);
});
/*
try {
    const fews = io
        .of('/fews')
        .on('connection', (socket) => {
            console.log('news connected');
            socket.emit('Receivenews', 'jhello');
            console.log("emitting");
            io.of('/fews').to(socket.socketId).emit('Receivenews', 'hello back');
            socket.on('join', data => {
                console.log("data :",data.toString());
                io.of('/fews').to(socket.socketId).emit('Receivenews', 'hello back');
                socket.emit('Receivenews', 'jhello');
                console.log(" emitting hello");
            });
        });

} catch (e) {
    console.log(e.toString());
}
*/




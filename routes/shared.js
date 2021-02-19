const express = require('express');
const nodemailer = require('nodemailer');
const socket = require('socket.io');
const querystring = require('querystring');
const router =express.Router();


function SendEmail(Email, Subject ,data) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Mailer_email,
            pass: process.env.Mailer_pass
        }
    });

    var mailOptions = {
        from: 'SmartIrrigation',
        to: Email,
        subject: Subject,
        text: data
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
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
    {   console.log('no user id for notification');
        return;}
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

Notification = [];
const notif = io
    .of('/shared/Notification')
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
            console.log('Notification Clients from Shared' , Notification);
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



module.exports = {
    router : router,
    EmailUser: function (Email , subject , data) {
        SendEmail(Email , subject , data);
    },
    NotifyyUser : function (UserId, data) {
        NotifyUser(UserId, data);
    }
};

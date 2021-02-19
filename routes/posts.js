const express = require('express');
const https = require('https');
var http = require("http");
const querystring = require('querystring');
const router =express.Router();
const Post = require('../Models/Posts');
const kafka = require('kafka-node');
const Dash = require('./dashboard');
router.post('/',async (req,res) => {
    console.log('body' , req.body);
    try{
        res.json({status:"ok" , message: 'Sensor Delete'});
    }catch (err) {
        res.json({ message:err });
    }

});
router.get('/',async (req , res)=>{
    try{
        console.log('body' , req.body);
        res.header("Access-Control-Allow-Headers", "*");
        res.json({status:"ok" , message: 'Sensor Delete'});
    }catch (e) {
        res.json({message:e});
    }
});
router.get('/pingTest',async (req , res)=>{
    try{
        res.header("Access-Control-Allow-Headers", "*");
        await new Promise(resolve => setTimeout(resolve, 5000));
        res.json({status:"ok" , message: 'response'});
    }catch (e) {
        res.json({message:e.toString()});
    }
});
router.get('/weither',async (req , res)=>{

    console.log('here 1');
    try{
        
        //const url = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'
        //let h = await getWeither(long,lat);
        console.log(req);
        return res.status(200).json({status: "ok", message: req.query.lat});
    } catch (e) {
        console.log('here 5');
        return res.status(400).json({status: "err", message: e.toString()});
    }
});
function getWeither(long,lat ) {
    return new Promise(function (resolve, reject) {
        let data = '';
        let data1 = '';
        // GET parameters
        const parameters = {
            appid: process.env.key,
            lat: lat,//36.717199016072186
            lon: long//10.215536125104649
        };

// GET parameters as query string : "?id=123&type=post"
        const get_request_args = querystring.stringify(parameters);
        var options = {
            host : 'api.openweathermap.org',
            path:  '/data/2.5/forecast?'+get_request_args,
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
            console.log('here 2');
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                console.log(JSON.parse(data).explanation);
                data1 = JSON.parse(data);
                resolve(data1);
            });
            console.log('here 3');
        }).on("error", (err) => {
            console.log("Error: " + err.message + err.code);
            reject(err.message)
        });
    });
}

router.get('/kafka/test',async (req , res)=>{
    //console.log('body :',req.body);
    Producer = kafka.Producer,
        client = new kafka.KafkaClient({kafkaHost: process.env.local_kafka_ip}),
        producer = new Producer(client);
        payloads = [
            { topic: process.env.local_kafka_Topic, messages: JSON.stringify(req.body), partition: 0 },
        ];
    producer.on('ready', function () {
        producer.send(payloads, function (err, data) {
            //console.log(data);
        });
    });
        return res.status(200).json({status: "ok", message: 'message sent'});
});
/*
try {
    Consumer = kafka.Consumer,
        client = new kafka.KafkaClient({kafkaHost: process.env.local_kafka_ip}),
        consumer = new Consumer(
            client,
            [
                {topic: 'TestTopic', partition: 0}
            ],
            {
                autoCommit: true
            }
        );
    consumer.on('message', function (message) {
        console.log(message);
        var x = JSON.parse(message.value);
        console.log(x.SensorIdentifier);
    });
    consumer.on('error', function (err) {
        console.log('error', err);
    });
}
catch(e) {
        console.log(e);
    }
*/
module.exports = router;

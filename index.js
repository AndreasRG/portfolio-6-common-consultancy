//npm install cors --save
//npm install express --save
//npm install mongodb --save

const express = require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/common-cultancy";

const client = new MongoClient(uri);

const database = client.db('common-cultancy');

MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true })
    .then((client) => {
        console.log("Connected to MongoDB!");
        database;
    });

const classification = database.collection('classification');
const metrics = database.collection('metrics');
const sourcepop = database.collection('sourcepop');
const time = database.collection('time');

const app = express();
app.use(express.json());
app.use(cors());
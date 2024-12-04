//npm install cors --save
//npm install express --save
//npm install mongodb --save

const express = require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/common-consultancy";
const client = new MongoClient(uri, { useUnifiedTopology: true });

client.connect()
    .then(() => {
        console.log("Connected to MongoDB!");

        const database = client.db('common-consultancy');

        const classification = database.collection('classification');
        const metrics = database.collection('metrics');
        const sourcepop = database.collection('sourcepop');
        const time = database.collection('time');

        const app = express();
        app.use(express.json());
        app.use(cors());

        app.get('/test', (req, res) => {
            res.send('It works!')
        });

        app.get('/denmark', (req, res) => {
            const query = {country: "Denmark"}

            sourcepop.find(query).toArray((err, results) => {
                if (err) {
                    console.error("Failed to execute query:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.send(results);
                res.status(200).json(results);
            });
        });

        app.get('/restofworld', (req, res) => {
            const query = { country: { $ne: "Denmark" } };

            sourcepop.find(query).toArray((err, results) => {
                if (err) {
                    console.error("Failed to execute query:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                console.log(results);
                res.status(200).json(results);
            });
        });


        app.get('/', (req, res) => {
            res.send('It works!')
        });

        // Start the server
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(error => console.error('Failed to connect to MongoDB', error));


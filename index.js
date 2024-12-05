//npm install cors --save
//npm install express --save
//npm install mongodb --save

const express = require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const fs = require("fs");

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

        //Denmark ID get
        app.get('/denmarkID', async (req, res) => {
            const query = { country: "Denmark" };
            const projection = { projection: { ccpageid: 1, _id: 0 } };
            const results = await sourcepop.find(query, projection).toArray();
            res.send(results);
        });

        //ID of rest of world except of Denmark
        app.get('/restofworldID', async (req, res) => {
            const query = { country: { $ne: "Denmark" } };
            const projection = { projection: { ccpageid: 1, _id: 0 } };
            const results = await sourcepop.find(query, projection).toArray();
            res.send(results);
        });

        //Reactions count in denmark
        app.get('/denmarkID/reactions', async (req, res) => {
            const sourcepopQuery = {country: "Denmark"};
            const sourcepopProjection = {projection: {ccpageid: 1, _id: 0}};
            const sourcepopResults = await sourcepop.find(sourcepopQuery, sourcepopProjection).toArray();
            const ccpageids = sourcepopResults.map(doc => doc.ccpageid);

            const metricsQuery = { ccpageid: { $in: ccpageids }, reactions: { $gt: 100 } };
            const metricsProjection = { projection: { reactions: 1, ccpageid: 1, _id: 0 } };
            const metricsResults = await metrics.find(metricsQuery, metricsProjection).toArray();
            res.send(metricsResults)
        });

        //Count of posts per yearquarter
        app.get('/postcount/yearquarter', async (req, res) => {
            try {
                const pipeline = [
                    {
                        $group: {
                            _id: "$yearquarter",
                            count: { $sum: 1 }
                        }
                        },
                        {
                            $sort: { _id: 1 } // Optional: Sort results by yearquarter
                        }
                    ];

                const results = await time.aggregate(pipeline).toArray();
                res.status(200).json(results);
            } catch (err) {
                console.error("Failed to execute aggregation:", err);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });



            app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(error => console.error('Failed to connect to MongoDB', error));

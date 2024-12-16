//npm install cors --save
//npm install express --save
//npm install mongodb --save

const express = require('express');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = "mongodb://localhost:27017/common-cultancy";
const client = new MongoClient(uri, { useUnifiedTopology: true });

client.connect()
.then(() => {
    console.log("Connected to MongoDB");

    const database = client.db("common-consultancy");

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
        const results = await time.find(query, projection).toArray();
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
                    $match: { yearquarter: { $gt: "2022Q1" } }
                },
                {
                    $group: {
                        _id: "$yearquarter",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ];

            const results = await time.aggregate(pipeline).toArray();
            res.status(200).json(results);
        } catch (err) {
            console.error("Failed to execute aggregation:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    //Count of posts per yearquarter in Denmark
    app.get('/postcount/denmark/yearquarter', async (req, res) => {
        try {
            const denmarkDocs = await sourcepop.find({ country: "Denmark" }).toArray();
            const ccpageids = denmarkDocs.map(doc => doc.ccpageid);

            const metricsDocs = await metrics.find({ ccpageid: { $in: ccpageids } }).toArray();
            const ccpostIds = metricsDocs.map(doc => doc.ccpost_id);

            const pipeline = [
                {
                    $match: { ccpost_id: { $in: ccpostIds } }
                },
                {
                    $match: { yearquarter: { $gt: "2022Q1" } }
                },
                {
                    $group: {
                        _id: "$yearquarter",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ];

            const results = await time.aggregate(pipeline).toArray();
            res.status(200).json(results);
        } catch (err) {
            console.error("Failed to execute aggregation:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/postcount/world/yearquarter/category', async (req, res) => {
        try {
            // Step 1: Get all ccpageid and corresponding category from sourcepop
            const sourcepopData = await sourcepop.find({}).project({ ccpageid: 1, category: 1, _id: 0 }).toArray();
            const ccpageidToCategory = sourcepopData.reduce((acc, item) => {
                acc[item.ccpageid] = item.category;
                return acc;
            }, {});

            // Step 2: Find corresponding ccpost_id via ccpageid in metrics
            const ccpageids = sourcepopData.map(item => item.ccpageid);
            const metricsData = await metrics.find({ ccpageid: { $in: ccpageids } }).project({ ccpageid: 1, ccpost_id: 1, _id: 0 }).toArray();
            const ccpost_idToCategory = metricsData.reduce((acc, item) => {
                const category = ccpageidToCategory[item.ccpageid];
                if (category) {
                    acc[item.ccpost_id] = category;
                }
                return acc;
            }, {});

            // Step 3: Find yearquarter in time collection using ccpost_id
            const ccpost_ids = metricsData.map(item => item.ccpost_id);
            const timeData = await time.find({ ccpost_id: { $in: ccpost_ids }, yearquarter: { $gt: "2022Q1" } }).project({ yearquarter: 1, ccpost_id: 1, _id: 0 }).toArray();

            // Step 4: Count posts per yearquarter grouped by category
            const results = timeData.reduce((acc, item) => {
                const category = ccpost_idToCategory[item.ccpost_id];
                if (category) {
                    const key = `${item.yearquarter}_${category}`;
                    acc[key] = (acc[key] || 0) + 1;
                }
                return acc;
            }, {});

            // Transform results into the desired format
            const formattedResults = Object.keys(results).map(key => {
                const [yearquarter, category] = key.split('_');
                return {
                    _id: { yearquarter, category },
                    count: results[key]
                };
            });

            // Sort the results by yearquarter
            formattedResults.sort((a, b) => {
                if (a._id.yearquarter < b._id.yearquarter) return -1;
                if (a._id.yearquarter > b._id.yearquarter) return 1;
                return 0;
            });

            res.status(200).json(formattedResults);
        } catch (err) {
            console.error("Failed to execute aggregation:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/postcount/denmark/yearquarter/category', async (req, res) => {
        try {
            // Step 1: Get all ccpageid and corresponding category from sourcepop where country is Denmark
            const sourcepopData = await sourcepop.find({ country: "Denmark" }).project({ ccpageid: 1, category: 1, _id: 0 }).toArray();
            const ccpageidToCategory = sourcepopData.reduce((acc, item) => {
                acc[item.ccpageid] = item.category;
                return acc;
            }, {});

            // Step 2: Find corresponding ccpost_id via ccpageid in metrics
            const ccpageids = sourcepopData.map(item => item.ccpageid);
            const metricsData = await metrics.find({ ccpageid: { $in: ccpageids } }).project({ ccpageid: 1, ccpost_id: 1, _id: 0 }).toArray();
            const ccpost_idToCategory = metricsData.reduce((acc, item) => {
                const category = ccpageidToCategory[item.ccpageid];
                if (category) {
                    acc[item.ccpost_id] = category;
                }
                return acc;
            }, {});

            // Step 3: Find yearquarter in time collection using ccpost_id
            const ccpost_ids = metricsData.map(item => item.ccpost_id);
            const timeData = await time.find({ ccpost_id: { $in: ccpost_ids }, yearquarter: { $gt: "2022Q1" } }).project({ yearquarter: 1, ccpost_id: 1, _id: 0 }).toArray();

            // Step 4: Count posts per yearquarter grouped by category
            const results = timeData.reduce((acc, item) => {
                const category = ccpost_idToCategory[item.ccpost_id];
                if (category) {
                    const key = `${item.yearquarter}_${category}`;
                    acc[key] = (acc[key] || 0) + 1;
                }
                return acc;
            }, {});

            // Transform results into the desired format
            const formattedResults = Object.keys(results).map(key => {
                const [yearquarter, category] = key.split('_');
                return {
                    _id: { yearquarter, category },
                    count: results[key]
                };
            });

            // Sort the results by yearquarter
            formattedResults.sort((a, b) => {
                if (a._id.yearquarter < b._id.yearquarter) return -1;
                if (a._id.yearquarter > b._id.yearquarter) return 1;
                return 0;
            });

            res.status(200).json(formattedResults);
        } catch (err) {
            console.error("Failed to execute aggregation:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/postcount/forimod/2022q2', async (req, res) => {
        try {
            // Step 1: Get all ccpost_id from 'time' collection where yearquarter is "2022Q2"
            const postIds = await time.find({ yearquarter: "2022Q2" }, { ccpost_id: 1, _id: 0 }).toArray();
            const ccpostIds = postIds.map(doc => doc.ccpost_id);
            console.log('Step 1 - ccpostIds:', ccpostIds);

            // Step 2: Get ccpageid from 'metrics' collection using ccpost_id
            const metricsDocs = await metrics.find({ ccpost_id: { $in: ccpostIds } }, { ccpageid: 1, ccpost_id: 1, _id: 0 }).toArray();
            const ccpageIds = metricsDocs.map(doc => doc.ccpageid);
            console.log('Step 2 - ccpageIds from metrics:', ccpageIds);

            // Step 3: Check the ccpageid in the 'sourcepop' collection for country "Denmark"
            const sourcepopDocs = await sourcepop.find({ ccpageid: { $in: ccpageIds }, country: "Denmark" }, { ccpageid: 1, _id: 0 }).toArray();
            const denmarkCcpageIds = sourcepopDocs.map(doc => doc.ccpageid);
            console.log('Step 3 - Denmark ccpageIds:', denmarkCcpageIds);

            // Step 4: Retain only those ccpost_id which correspond to the filtered ccpageid from metrics
            const denmarkCcpostIds = metricsDocs.filter(doc => denmarkCcpageIds.includes(doc.ccpageid)).map(doc => doc.ccpost_id);
            console.log('Step 4 - Denmark ccpostIds:', denmarkCcpostIds);

            // Step 5: Count all entries in 'classification' collection where ccpost_id is in the collected IDs and group by gpt_ukraine_for_imod
            const pipeline = [
                {
                    $match: { ccpost_id: { $in: denmarkCcpostIds } }
                },
                {
                    $group: {
                        _id: "$gpt_ukraine_for_imod",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ];

            const results = await classification.aggregate(pipeline).toArray();
            console.log('Step 5 - Aggregated Results:', results);

            res.status(200).json(results);
        } catch (err) {
            console.error("Failed to execute aggregation:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get('/postcount/forimod/2024q1', async (req, res) => {
        try {
            // Step 1: Get all ccpost_id from 'time' collection where yearquarter is "2024Q1"
            const postIds = await time.find({ yearquarter: "2024Q1" }, { ccpost_id: 1, _id: 0 }).toArray();
            const ccpostIds = postIds.map(doc => doc.ccpost_id);
            console.log('Step 1 - ccpostIds:', ccpostIds);

            // Step 2: Get ccpageid from 'metrics' collection using ccpost_id
            const metricsDocs = await metrics.find({ ccpost_id: { $in: ccpostIds } }, { ccpageid: 1, ccpost_id: 1, _id: 0 }).toArray();
            const ccpageIds = metricsDocs.map(doc => doc.ccpageid);
            console.log('Step 2 - ccpageIds from metrics:', ccpageIds);

            // Step 3: Check the ccpageid in the 'sourcepop' collection for country "Denmark"
            const sourcepopDocs = await sourcepop.find({ ccpageid: { $in: ccpageIds }, country: "Denmark" }, { ccpageid: 1, _id: 0 }).toArray();
            const denmarkCcpageIds = sourcepopDocs.map(doc => doc.ccpageid);
            console.log('Step 3 - Denmark ccpageIds:', denmarkCcpageIds);

            // Step 4: Retain only those ccpost_id which correspond to the filtered ccpageid from metrics
            const denmarkCcpostIds = metricsDocs.filter(doc => denmarkCcpageIds.includes(doc.ccpageid)).map(doc => doc.ccpost_id);
            console.log('Step 4 - Denmark ccpostIds:', denmarkCcpostIds);

            // Step 5: Count all entries in 'classification' collection where ccpost_id is in the collected IDs and group by gpt_ukraine_for_imod
            const pipeline = [
                {
                    $match: { ccpost_id: { $in: denmarkCcpostIds } }
                },
                {
                    $group: {
                        _id: "$gpt_ukraine_for_imod",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ];

            const results = await classification.aggregate(pipeline).toArray();
            console.log('Step 5 - Aggregated Results:', results);

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

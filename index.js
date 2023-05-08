const express = require('express');
const cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tiu9pax.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const itemsCollection = client.db("Manufacturer-website").collection("Items");
        const bookingCollection = client.db("Manufacturer-website").collection("booking");
        const profileCollection = client.db("Manufacturer-website").collection("profile");

        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const cursor = await itemsCollection.findOne(query);
            res.send(cursor);
        })

        app.post('/booking', async (req, res) => {
            console.log(req.body);
            const doc = req.body;
            const result = await bookingCollection.insertOne(doc);
            res.send(result);
        })

        app.post('/myProfile', async (req, res) => {
            const doc = req?.body;
            const email = doc?.email;
            // console.log(doc);
            const query = { email: email }
            const result = await profileCollection.findOne(query);
            const userEmail = result.email;
            if (userEmail !== email) {
                const insertProfile = await profileCollection.insertOne(doc);
                res.send(insertProfile);
            }
            else{
                res.send({error:'unauthorized'});
            }
        })

        app.put('/myProfile', async (req, res) => {
            const doc = req?.body;
            const email = doc?.email;

            // create a filter for a movie to update
            const filter = {
                email: email
            };
            // this option instructs the method to create a document if no documents match the filter

            const options = { upsert: true };

            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: doc
            };

            const updateProfile = await profileCollection.updateOne(filter, updateDoc);
            res.send(updateProfile);
        })

        app.get('/myProfile/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = await profileCollection.findOne(query);
            res.send(cursor);
        })
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello Worldsssss')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
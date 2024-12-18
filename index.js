const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7vwvj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // create database
    const coffeCollection = client.db("coffeeDB").collection("coffee");
    
    // create coffee
    app.post("/coffee", async(req, res) => {
      const newCoffee = req.body;
      // console.log(newCoffee);
      const result = await coffeCollection.insertOne(newCoffee);
      res.send(result);
    });

    // get single coffee item
    app.get("/coffee/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeCollection.findOne(query);
      res.send(result);
    });

    // read coffee
    app.get("/coffee", async(req, res) => {
      const cursor = coffeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // update coffee
    app.put("/coffee/:id", async(req, res) => {
      const id = req.params.id; 
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedCoffee = req.body;
      const coffee = {
        $set: {
          name:updatedCoffee.name,
          chef:updatedCoffee.chef,
          supplier:updatedCoffee.supplier,
          taste:updatedCoffee.taste,
          category:updatedCoffee.category,
          details:updatedCoffee.details,
          price:updatedCoffee.price,
          photoURL:updatedCoffee.photoURL
        }
      };

      const result = await coffeCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    // delete coffe
    app.delete("/coffee/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeCollection.deleteOne(query);
      res.send(result);
    }); 

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Coffe making server is running...");
});

app.listen(port, () => {
    console.log(`Coffee server is running on port: ${port}`);
});

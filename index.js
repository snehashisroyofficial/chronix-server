const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://chronix-76387.web.app"],
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.VITE_DB_USER}:${process.env.VITE_DB_PASS}@cluster0.8kmx02i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const productCollection = client.db("chronix").collection("allProducts");

    app.post("/add-product", async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.status(201).send("product added successfully");
    });

    app.get("/get-products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.post("/pagination", async (req, res) => {
      try {
        const page = parseInt(req.query.page, 10) || 0;
        const size = parseInt(req.query.size, 10) || 10;

        const { price, sort, search } = req.body;

        const min = parseInt(price?.min, 10) || 0;
        const max = parseInt(price?.max, 10) || Infinity;

        const filter = {
          ...(min >= 0 && max < Infinity
            ? { discounted_price: { $gte: min, $lte: max } }
            : {}),
          ...(search ? { title: { $regex: search, $options: "i" } } : {}), // Search term
        };

        const sortOption =
          sort === "asc"
            ? { discounted_price: 1 }
            : sort === "dsc"
            ? { discounted_price: -1 }
            : {};

        const result = await productCollection
          .find(filter)
          .sort(sortOption)
          .skip(page * size)
          .limit(size)
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error handling /pagination request:", error);
        res.status(500).send("Something went wrong");
      }
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running successfully");
});

app.listen(port, () => {
  console.log(`server running successfully on ${port}`);
});

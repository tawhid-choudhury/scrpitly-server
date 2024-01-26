require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://article-publishing-website-client.vercel.app",
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  return res.send("Scriptly Server Running");
});
app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});

app.use(express.json());

const uri = `${process.env.MDB_URI}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    sameSite: "none",
  },
});
async function run() {
  try {
    const database = client.db("scriptlyDB");
    const articleCollection = database.collection("articleCollection");

    // Send a ping to confirm a successful connection
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/allArticle", async (req, res) => {
      try {
        let query = {};
        const cursor = articleCollection.find({}).sort({ timestamp: -1 });
        const result = await cursor.toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error fetching all articles:", error);
        return res.status(500).send("Internal Server Error");
      }
    });

    app.get("/latestArticles", async (req, res) => {
      try {
        const cursor = articleCollection
          .find({})
          .sort({ timestamp: -1 })
          .limit(3);
        const result = await cursor.toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error fetching latest articles:", error);
        return res.status(500).send("Internal Server Error");
      }
    });

    app.post("/addArticle", async (req, res) => {
      try {
        console.log(req.body);
        const article = req.body;
        article.timestamp = Date.now();
        const result = await articleCollection.insertOne(article);
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error("Error posting article:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
  } finally {
  }
}
run().catch(console.dir);

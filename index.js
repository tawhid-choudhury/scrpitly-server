require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const commentCollection = database.collection("commentCollection");
    const communityPostCollection = database.collection("communityPost");
    const communityCommentsCollection =
      database.collection("communityComments");

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

    app.get("/allCommentsForAnArticle/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const cursor = commentCollection
          .find({ articleId: id })
          .sort({ timestamp: -1 });
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

    app.post("/addComment/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(req.body);
        const comment = req.body;
        console.log(comment, "asdasd");

        comment.timestamp = Date.now();
        comment.articleId = id;
        const result = await commentCollection.insertOne(comment);
        console.log(result);
        console.log(comment);
        return res.send(result);
      } catch (error) {
        console.error("Error posting comment:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
    //**********community section Start *******************

    // community Add post
    app.post("/v1/api/posts", async (req, res) => {
      try {
        console.log(req.body);
        const communityPosts = req.body;
        communityPosts.timestamp = Date.now();
        const result = await communityPostCollection.insertOne(communityPosts);
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error("Error posting article:", error);
        return res.status(500).send("Internal Server Error");
      }
    });

    // community get post
    app.get("/v1/api/posts", async (req, res) => {
      try {
        let query = {};
        const cursor = communityPostCollection.find({}).sort({ timestamp: -1 });
        const result = await cursor.toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error fetching all articles:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
    // community Comment Section
    // community get Comments
    app.post("/v1/api/CommunityComments", async (req, res) => {
      try {
        console.log(req.body);
        const communityComment = req.body;
        communityComment.timestamp = Date.now();
        const result = await communityCommentsCollection.insertOne(
          communityComment
        );
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error("Error posting article:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
    // community get post
    app.get("/v1/api/CommunityComments", async (req, res) => {
      try {
        let query = {};
        const cursor = communityCommentsCollection
          .find({})
          .sort({ timestamp: -1 });
        const result = await cursor.toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error fetching all articles:", error);
        return res.status(500).send("Internal Server Error");
      }
    });

    // like section 
    app.post("/v1/api/posts/:postId/like", async (req, res) => {
      try {
        const postId = req.params.postId;
        // Update the like count in the database for the specified post
        await communityPostCollection.updateOne(
          { _id:new ObjectId(postId) },
          { $inc: { likes: 1 } }
        );
        return res.sendStatus(200);
      } catch (error) {
        console.error("Error liking post:", error);
        return res.status(500).json({ error: error.message }); // Log the error message
      }
    });
    
    
    //**********community section End *******************
  } finally {
  }
}
run().catch(console.dir);

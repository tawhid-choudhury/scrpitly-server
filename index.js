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
    const commentCollection = database.collection("commentCollection");
    const UserCollection = database.collection("UserCollection");
    const likeCollection = database.collection("likeCollection");

    // Send a ping to confirm a successful connection
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
    // get user
    app.get("/all-users", async (req, res) => {
      try {
        const cursor = UserCollection.find();
        const result = await cursor.toArray();
        return res.send(result);
      } catch (error) {
        console.error("Error fetching all User:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
    // post User after checking if the user new or old
    app.post("/post-user", async (req, res) => {
      try {
        const NewUser = req.body;
        const query = { email: NewUser.email }
        const existingUser = await UserCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "User Already Exists", insertedId: null })
        }
        const result = await UserCollection.insertOne(NewUser);
        console.log(result);
        return res.send(result);
      } catch (error) {
        console.error("Error posting article:", error);
        return res.status(500).send("Internal Server Error");
      }
    });


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

    app.get("/checkLike/:id", async (req, res) => {
      try {
        console.log("CHECKING LIKE");
        const id = req.params.id;
        const userEmail = req.query.userEmail; // Assuming userEmail is passed as a query parameter
        console.log(
          "Received parameters - articleId:",
          id,
          "userEmail:",
          userEmail
        );

        const like = await likeCollection.findOne({
          articleId: id,
          userEmail: userEmail,
        });

        if (like) {
          console.log("like found");
          return res.json({ isLiked: true });
        } else {
          console.log("like not found");
          return res.json({ isLiked: false });
        }
      } catch (error) {
        console.error("Error checking like:", error);
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

    app.post("/addLike/:id", async (req, res) => {
      try {
        console.log("ADDING LIKE");
        const id = req.params.id;
        const userEmail = req.body;
        userEmail.timestamp = Date.now();
        userEmail.articleId = id;
        const result = await likeCollection.insertOne(userEmail);

        return res.send(result);
      } catch (error) {
        console.error("Error adding like:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
    app.delete("/deleteLike/:id", async (req, res) => {
      try {
        console.log("DELETING LIKE");
        const id = req.params.id;
        const userEmail = req.body.userEmail;
        console.log(
          "Received parameters - articleId:",
          id,
          "userEmail:",
          userEmail
        );

        const result = await likeCollection.deleteOne({
          articleId: id,
          userEmail: userEmail,
        });
        console.log("Delete result:", result);

        if (result.deletedCount === 1) {
          console.log("Like deleted successfully");
          return res.send("Like deleted successfully");
        } else {
          console.log("Like not found");
          return res.status(404).send("Like not found");
        }
      } catch (error) {
        console.error("Error deleting like:", error);
        return res.status(500).send("Internal Server Error");
      }
    });
  } finally {
  }
}
run().catch(console.dir);

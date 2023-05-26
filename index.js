const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 5000
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const app = express()
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hzcsu4a.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    //  client.connect()
    const toyCollection = client.db("toyDB").collection("toys")

    //get all toy data=======================
    app.get("/toys", async (req, res) => {
      const toys = await toyCollection.find().toArray()
      res.send(toys)
    })

    //get single toy by data=====================
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    //indexing data ==============================
    const indexKeys = { name: 1 }
    const indexOption = { name: "name_1" }
    // toyCollection.collection.dropIndex("name_1");
    const result = await toyCollection.createIndex(indexKeys, indexOption)

    app.get("/toySearch/:text", async (req, res) => {
      const searchText = req.params.text
      const result = await toyCollection
        .find({
          name: { $regex: searchText, $options: "i" },
        })
        .toArray()
      res.send(result)
    })

    //Insert a data====================================
    app.post("/addToy", async (req, res) => {
      const toy = req.body

      const result = await toyCollection.insertOne(toy)
      res.send(result)
    })
    //Find data by user email wise======================
    app.get("/myToy/:sellerEmail", async (req, res) => {
      const value = req.query.value
      const type = value == 1

      const sortObj = {}
      sortObj["price"] = type ? -1 : 1

      const email = req.params.sellerEmail
      const query = { sellerEmail: email }

      const result = await toyCollection.find(query).sort(sortObj).toArray()
      res.send(result)
    })

    //Delete single  toy by id wise================
    app.delete("/myToy/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query)
      res.send(result)
    })

    //get updated data====================================================================================
    app.get("/updateToy/:id", async (req, res) => {
      const id = req.params.id

      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result)
    })

    //now update your toy=============================
    app.patch("/updateToy/:id", async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedToy = req.body
      const toy = {
        $set: {
          available_quantity: updatedToy.available_quantity,
          category: updatedToy.category,
          description: updatedToy.description,
          image: updatedToy.image,
          name: updatedToy.name,
          price: updatedToy.price,
          rating: updatedToy.rating,
          seller: updatedToy.seller,
          sellerEmail: updatedToy.sellerEmail,
        },
      }
      const result = await toyCollection.updateOne(filter, toy)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get("/", (req, res) => {
  res.send("Hello world")
})
app.listen(port, () => {
  console.log("Agency running on port 5000")
})

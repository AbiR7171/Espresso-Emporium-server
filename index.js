const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(cors())
app.use(express.json())



app.get("/" , (req, res)=>{
    res.send("Copy server is ready")
})









const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_CODE}@cluster0.hmmbger.mongodb.net/?retryWrites=true&w=majority`;

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



    const coffeeCollection = client.db("Espresso-emporium").collection("coffee");
    const userCollection = client.db("Espresso-emporium").collection("user");
    const cartCollection = client.db("Espresso-emporium").collection("cart");
    const loveCollection = client.db("Espresso-emporium").collection("love");



    // jwt


    app.post('/jwt', (req, res)=>{
       
          const user = req.body;
          const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
              expiresIn: '1h'
          })
           
          res.send({token})

    })

    // coffees


    app.get("/coffees", async(req, res)=>{ 


        const result = await coffeeCollection.find().toArray()
        res.send(result)
    }) 


    app.get('/coffee/:id', async(req, res)=>{

           const id = req.params.id;
           const query  = {_id: new ObjectId(id)};
           const result = await coffeeCollection.find(query).toArray();
           res.send(result)
    }) 
 

    app.get("/searchApi", async(req, res)=>{
       
               const search = req.query.search;
               
               const query = { coffee_name: {$regex:search, $options:'i'}};

               const result = await coffeeCollection.find(query).toArray();
               res.send(result)
    })  


    // cart 

    app.post("/addToCart", async(req, res)=>{

              const coffee = req.body;
              // console.log(coffee);
              const result = await cartCollection.insertOne(coffee);
              res.send(result)
    }) 




    // love 

    app.post('/addLoveCart', async(req, res)=>{

             const coffee = req.body;
             console.log(coffee);
             const result = await loveCollection.insertOne(coffee);
             res.send(result)
             
    }) 


    app.delete('/removeLoveCart/:id', async(req, res)=>{


            const id = req.params.id;
            console.log(id);
            const query = {coffee_id: id};
            const result = await loveCollection.deleteOne(query);
            res.send(result)
    })


    app.get('/singleUserLoveCart', async(req, res)=>{

             
               const email = req.query.email;

               const query = {email: email};
               const result = await loveCollection.find(query).toArray();
               res.send(result)
               
    })


    // users

    app.post("/user", async(req, res)=>{

           const user  = req.body;
           const result = await userCollection.insertOne(user);
           res.send(result)
           
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
})
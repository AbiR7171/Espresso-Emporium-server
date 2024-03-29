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
    const coffeeRequestCollection = client.db("Espresso-emporium").collection("coffeeRequest");
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


    app.post("/addNewCoffee", async(req, res)=>{
       
          const  coffee = req.body;
          const result = await  coffeeCollection.insertOne(coffee);
          res.send(result)
    })


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


    app.delete("/deleteCoffee/:id", async (req, res)=>{
              
                const id = req.params.id;
                const query = {_id: new ObjectId(id)}
                const result = await coffeeCollection.deleteOne(query)
                res.send(result)
    })


    app.get("/topCoffee", async(req, res)=>{

             const result = await coffeeCollection.find().sort({cart:-1}).limit(5).toArray();
             res.send(result)
    })


    // chef 

    app.post("/coffeeRequest", async(req, res)=>{
       
      const coffee = req.body;
      const result = await coffeeRequestCollection.insertOne(coffee)
      res.send(result)
}) 


     app.get("/myCoffeeRequest", async(req, res)=>{
             const email = req.query.email;
             const query = {chef_email: email};
             const result = await coffeeRequestCollection.find(query).toArray();
             res.send(result)
     }) 


     app.get("/allCoffeeRequest", async(req, res)=>{
       
                const result = await coffeeRequestCollection.find().toArray();
                res.send(result)
     })

     app.get("/myCoffee", async(req, res)=>{
       
             const email = req.query.email;
             const query = {chef_email: email};
             const result = await coffeeCollection.find(query).toArray();
             res.send(result)
     })


     app.put("/rejectCoffeeRequest/:id", async(req, res)=>{

                 const id = req.params.id;
                 const query = {_id: new ObjectId(id)}
                 const updateDoc = req.body

                 console.log(updateDoc);

                 const updateData = {
                       $set: {
                            status:"Rejected",
                            feedback:updateDoc.feedback
                       }
                 }

                 const result = await coffeeRequestCollection.updateOne(query, updateData)
                 res.send(result)
     })


     app.patch("/coffeeAccepted/:id", async(req, res)=>{
       
           const  id = req.params.id;
           const query = {_id: new ObjectId(id)}
           const updateDoc = {
             $set:{
                  status: "Accepted"
             }
           }
           
           const result = await coffeeRequestCollection.updateOne(query, updateDoc);
           res.send(result)
     })



     app.get("/myTopCoffee", async(req, res)=>{
              
               const chef_email = req.query.email;
               const query = {chef_email: chef_email};
               const result = await coffeeCollection.find(query).sort({cart: -1}).limit(5).toArray()
               res.send(result)
     })



  


    // cart 

    app.post("/addToCart", async(req, res)=>{

              const coffee = req.body;
              // console.log(coffee);
              const result = await cartCollection.insertOne(coffee);
              res.send(result)
    })  


    app.get("/userCart", async(req, res)=>{ 

             const userEmail = req.query.email;

             const query = {email: userEmail};

             const result = await cartCollection.find(query).toArray();

             res.send(result)


    })


    app.delete("/removeCart/:id", async(req, res)=>{

            const id = req.params.id;

            const query = {coffee_id: id};

            const result = await cartCollection.deleteOne(query);

            res.send(result)
                
    })



    app.get("/allCart", async(req, res)=>{
       
             const result = await cartCollection.find().toArray();
             res.send(result)
    })




    // love LogoutLogout





    app.post('/addLoveCart', async(req, res)=>{

             const coffee = req.body;
         
             const result = await loveCollection.insertOne(coffee);
             res.send(result)
             
    }) 


    app.delete('/removeLoveCart/:id', async(req, res)=>{


            const id = req.params.id;
     
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
 


    app.patch("/updateRole/:id", async(req,res)=>{

                  const id = req.params.id;
                  const {role} = req.body;
                  const query = {_id: new ObjectId(id)};

                  const updateDoc = {
                              $set: {
                                  role: role
                              }
                  }

                  const result = await userCollection.updateOne(query, updateDoc);
                  res.send(result)


    })


    app.put("/updateLoveCount/:id", async(req, res)=>{

            const id = req.params.id;
            console.log(id);
            const query = {_id: new ObjectId(id)};
            const updateData = req.body;
            console.log(updateData);


      
            const updateDoc = {
              $set:{
                love: updateData?.love + 1
              }
            }


            const result = await coffeeCollection.updateOne(query, updateDoc);

            res.send(result)

    })
    app.put("/updateCartCount/:id", async(req, res)=>{

            const id = req.params.id;
            console.log(id);
            const query = {_id: new ObjectId(id)};
            const updateData = req.body;
            console.log(updateData);


      
            const updateDoc = {
              $set:{
                cart: updateData?.cart + 1
              }
            }


            const result = await coffeeCollection.updateOne(query, updateDoc);

            res.send(result)

    });



    app.get("/allUsers", async(req,res)=>{

             const result = await userCollection.find().toArray();
             res.send(result)

    })


    app.get("/user/:id", async(req, res)=>{
             
               const id = req.params.id;
               const query = { _id: new ObjectId(id)}
               const result = await userCollection.findOne(query)
               res.send(result)
    })



  //  verify user 


  app.get("/isChef", async(req, res)=>{
    
              const  {email}  = req.query;
              console.log(email);
              const query =  {email :  email}
              const user = await userCollection.findOne(query);
              console.log(user);
              const result =  {chef : user?.role ===  "chef"};
              console.log(result);
              res.send(result)

  })


  app.get("/isAdmin", async(req, res) =>{
     
             const {email} = req.query;
             const query = {email : email}
             const user = await userCollection.findOne(query)
             const result =  {admin : user?.role === "admin"}
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
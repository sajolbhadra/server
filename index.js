const express = require('express')
const {MongoClient} = require('mongodb')
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;

//----------MiddleWare------------------
app.use(cors());
app.use(express.json());

    //----------------------Connect to Mongo DB Databse-----------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lubi3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    //----------------------Create Database Connection-------------------
    try{
        await client.connect();
        console.log('database Connected Successfully')
        //-----------------Database--------------------------
        const database = client.db('Baby-Toy');
        //--------------COllection----------------------------
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const ReviewCollection = database.collection('reviews');
        const userCollection = database.collection('users');
        
        //==================Product======================
        //-------------Get All Product----------------
            app.get('/products', async (req, res) => {
                const cursor = productsCollection.find({});
                const product = await cursor.toArray();
                res.send(product);
            })


        //-------------Get Individual Product------------
            app.get('/products/:id', async (req, res) => {
                const id = req.params.id;
                const product = await productsCollection.find({_id: ObjectId(id) }).toArray();
                console.log(req.params.id);
                console.log(product);
                res.send(product[0])        //product[0] or have to send id?
            })


        //------------------POST Product API-----------------
            app.post('/products', async (req, res) => {
                const cursor = req.body;
                const product = await productsCollection.insertOne(cursor);
                console.log('hit the post api' , cursor);
                res.json(product);
            })


        //----------------DELETE Product API------------------------
            app.delete('/product/:id', async(req, res) => {
                const id = req.params.id;
                const cursor = {_id: ObjectId(id)};
                const product = await productsCollection.deleteOne(cursor);
                res.json(id)
            })


            //***********************Order***********************
        //---------------Placed Order API-------------------
            app.post('/place-order', async(req, res) => {
                const order = await orderCollection.insertOne(req.body);
                res.send(order);
            })

        //---------------Get All Placed Order---------------------------
            app.get('/orders', async (req, res) => {
                const orders = await orderCollection.find({}).toArray();
                res.send(orders)
            })
        //---------------Get Individual Placed Order---------------------------
            app.get('/orders/:email', async (req, res) => {
                const email = req.query.email;
                const query = {email: email }
                console.log(query)
                const orders = await orderCollection.find(query).toArray();
                res.send(orders)
            })


        //-----------------Cancle/Delete Order-----------------
            app.delete('/deleteOrder/:id'), async (req, res) => {
                const cursor = await orderCollection.deleteOne({
                    _id: ObjectId(req.params.id)});
                res.send(cursor)
            }

        /***************************************************************
        ---------------------Review-----------------------------------
        *********************************************************/
        //--------------Get Review -------------------- //No need to filter, put or delete this api
            app.get('/reviews', async (req, res) => {
                const cursor = ReviewCollection.find({});
                const review = await cursor.toArray();
                res.send(review);
            })
        
        //----------------Post Review------------------------
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            //console.log('hit the review post api', cursor);
            const result = await ReviewCollection.insertOne(review);
            // console.log(review);
            res.json(result)
        })



        //*******************User s Collection ***************** */

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            console.log(result)
            res.json(result)
        })

        //****************User Update************************* */

        app.put('/users', async(req, res) => {
            const user = req.body; 
            const filter = {email: user.email};
            const options = { upsert: true };
            const updateDoc = {$set: user};
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        app.put('/users/admin', async(req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = {email : user.email};
            const updateDoc = { $set: {role: 'admin'}};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })


    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);



app.get('/', (req, res ) => {
    res.send('Server in Online')
})

app.listen(port, () => {
    console.log('Server in Running on port: ' , port)
})


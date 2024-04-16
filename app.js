const cookieParser = require("cookie-parser");
const express = require(`express`);
const mongoose = require(`mongoose`);
require(`dotenv`).config();
const {requireAuth,checkUser} = require(`./middleware/auth_middleware`);
const authRoute = require("./routes/authRoute");





const URI = process.env.MONGO_DB_URI





const app = express();




app.use(express.json());
app.use(cookieParser());
app.set(`view engine`, `ejs`);

app.use(authRoute); //defines the routes

app.use(checkUser);//this line protects all the route and checks if they are protected from unregistered user

app.use(requireAuth); //im setting this up in the route ,so the delete route can call on it and check if the user is not an admin





//app.get(`*`, checkUser)  // why i didnt use this route protector is becaue it only protects the gets routes the other app.use(checkUser) which is about protects all request methods
app.get(`/`,(req, res)=>{
  res.render(`home`);
})


app.get(`/content`,requireAuth,(req,res)=>{
  res.render(`contents`)
})


mongoose.connect(URI, {useNewUrlParser: true}, {useUnifiedTopology:true}).then(()=>{
    console.log(`connected to database`);
    const PORT = process.env.PORT
    app.listen(PORT,()=>{
        console.log(`server is running on port: ${PORT}`)
    })
}).catch((err)=>{
   console.log(`failed to connnect to database`, err)
})
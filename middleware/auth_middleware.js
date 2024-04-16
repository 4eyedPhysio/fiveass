//this middleware part is for us to be able to protect routes using jwt

const User = require(`../model/users`)

require(`dotenv`).config()

const jwt = require (`jsonwebtoken`);
// we create a require authentication function
const requireAuth = async(req,res, next)=>{
      //now we will have to grab the token from the cookie

  const token = req.cookies.jwt;
  //next is to confirm if the json web token exist and verify it and redirect them if they dont have the valid token

  const secret = process.env.SECRET_KEY

  try {
    if (token) {
        const decodedToken = jwt.verify(token, secret);
        const user = await User.findById(decodedToken.id);
        if (user) {
            req.user = user;
            console.log(user);
            next();
        } else {
            throw new Error("User not found");
        }
    } else {
        throw new Error("Token not present");
    }
} catch (err) {
    console.error(err.message);
    res.status(404).json({message:`please log in`});
}
// } else {
//     res.redirect('/login');
// }
};




// jwt.verify(token, secret, (err, decodedToken)=>{
//     if(err){
//         console.log(err.message);
//         res.redirect(`/login`);


//now we want to create a function that keeps confirming if the user is logged in for every route they enter.


const checkUser = (req,res, next)=>{
//first we need to grab cookie/token and check if it exists
const token = req.cookies.jwt;

const secret = process.env.SECRET_KEY


if(token){
    //token verification
    jwt.verify(token,secret, async(err,decodedToken)=>{
        if(err){
            console.log(err.message);
            res.locals.user= null;
           next();
        }else{
            
            let user = await User.findById(decodedToken.id);// remember that the id in the  database is saved in the decoded token,so this line attaches the objects belonging to that id to the "user"
            console.log(user);
            req.user = user; //the user gotten , we assign it to our req.user method and we also save it to our lo
            res.locals.user=user;
            next();
        }
    })
}else {
   res.locals.user = null;
   next();
}
}

module.exports= {requireAuth,checkUser}; // remember that this middleware is being exported as an object, so if you want to use either of the function individually, you will have to use the dot notation after importing it where you want to use it 


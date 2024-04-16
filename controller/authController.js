const User = require(`../model/users`);
const Post = require(`../model/post`);


const jwt = require(`jsonwebtoken`);
const { json } = require("body-parser");


require (`dotenv`).config();

const secret = process.env.SECRET_KEY;




//trying to create a jwt token to implement in the code, first we import "jsonwebtoken", create the maxAge of the token as in when it will expire, it is always in seconds

const maxAge= 1*24*60*60; //duration of the jwt
//this is us creating the function createToken which takes in an id as an argument

//we also implement the role in the argument that also has the id

const createToken =(id, role)=>{
  //then inorder to create the token, we will need a secret to add to it , id and the role again

  // the sign method creates a jwt token
  return jwt.sign({id, role}, secret , {
    expiresIn: maxAge
  });
}

// module.exports.home_get=(req,res)=>{
//     res.render(`home`)
// }

// module.exports.register_get=(req,res)=>{
//    res.render(`signup`);
// }

// module.exports.login_get =(req, res)=>{
//   res.render(`login`);
// }



module.exports.getAll =async (req,res)=>{
  try {
//over here is me trying out pagination , wish me luck..

const page = req.query.p || 0;//this line gets the preceeding request parameter(the number) and if the user didnt specify number, it returns zero

const contentsPerPage = 10;
//next we want to set the logic behind, its a way to know the amount of content we need to skip by the page number provided (pageNo * contents per page == the number of contents to be skipped)
const skippedPage = page * contentsPerPage;
    //so as we have the number of content we want to skip, we apply the skip method just after our post has returned an object and because we want to limit the amount of books we get back, in this scenario (5), we then use the limit method...meaning the below posts will only have max of 5contents in it per page.
    const posts = await Post.find().skip(skippedPage).limit(contentsPerPage);
    res.status(200).json({posts});
  } catch (err) {
    console.log(err);
    res.status(500).json({message:"an error occured while returning the posts", err})
  }
}


module.exports.get_id = async(req,res)=>{
      const id = req.params.id;
      try {
         const post_id = await Post.findById(id);
         if(!post_id){
          res.status(404).json({message: "post not found"})
         }
         res.status(200).json({post_id});
      } catch (err) {
        console.log(err.message);
        res.status(500).json({message:"error occured while posting by id", err})
      }

      
  }


module.exports.logout_get=(req,res)=>{
  //so what we are doing in this logout is to replace the jwt with an empty string and set the maxage to 1ms
  res.cookie(`jwt`,``,{maxAge: 1})
   res.status(200).json({message:`logged out successfully`});
   console.log(`logged out successfully`);
}



module.exports.register_post =async (req,res)=>{
    const {name, email, password, role} = req.body;
    //this distructures the email and the password out as separate entities including the role

   //importing our user model here and creating an instance of it when the persons registers

   //we will use try catch to help us handle the error if the code fails

   try {
    //heres us creating an instance of User here
      const user = await User.create({name, email,password, role});;

      //we proceed in creating an instance of the token too by calling the token function we defined
      const token = createToken(user._id , user.role);
      //next, we try and save the cookie as a response

      res.cookie(`jwt`,token,{httpOnly:true, maxAge: maxAge*1000});

      //time to send a response if login was successful
      res.status(200).json({ message: 'User registered successfully', user });
    console.log(`${user._id}`,`${user.role}`, "user successfully created");
   } catch (err) {
      res.status(400).json({error:err.message, message:"unable to register"});

      console.log(err);
   }

  }



  module.exports.login_post = async (req,res)=>{
     const {email, password}= req.body;
     try {
       if(!email|| !password){
        return res.status(400).json({errors:{email:"email is required", password: `password is required`}})
       }else{
       // remember we created a static login function in our model, so we will use it here to login
       const user = await User.login(email,password);
       const token = createToken(user._id, user.role);
       res.cookie(`jwt`,token, {httpOnly:true ,maxAge:maxAge*1000});
       res.status(200).json({user:user._id,role:user.role})
      //  res.render(`contents`);
       console.log(`login successful`);
       }
     } catch (err) {
      const errors = handleError(err);
      res.status(400).json({errors})
     }
  }



  module.exports.Content_post =async (req,res)=>{
    const {email,title, body} = req.body;
    
    try {
      const user =await User.findOne({email:email});
      if(!user){
        return res.status(400).json({error:`user not found`})
      }
      const newPost = new Post ({
        title,
        body,
        user:{
           id: user._id // this is the id we had in the database
        }
      });

      await newPost.save(); //this line helps us to save the newPost to the database
      res.status(200).json({message:`post created successfully`, newPost});
      console.log(`post created successfully`);
    } catch (err) {
      console.log(err, `error while creating post`)
      res.status(500).json({error:`posting failed`})
    }
  }



  module.exports.update_put_id =async(req,res)=>{
    const {title, body} = req.body;
    const id = req.params.id;


   if(!req.user){
    return res.status(401).json({message:"the request user is not available"});
   }

    const userId = req.user.id; //we will check if the user id is in here

    try {

       const post = await Post.findById(id);
       if(!post){
        return res.status(404).json({message:"the post was not found"})
       }
       //after locating the post, the next is to create another check

       if(req.user.role!=="admin" && String(userId) !== String(post.user.id) ){
        return res.status(403).json({message:"Unauthorized user"})
       }

       //remember, we arent using the findAndUpdate yet, so we assign the title and body with date and save it

       post.title= title;
       post.body=body;
       post.updatedAt = new Date();

       const updatedPost = await post.save();

       return res.status(200).json({message:"post updated successfully",updatedPost});



      // const update_id = await Post.findByIdAndUpdate(id,{title:title,body:body},{new:true});//after using this method to find the id to update,we destructure what we need to update and add a true tag and remember that the 2nd parameter to be updated must be an object
      // if(!update_id){
      //   return res.status(404).json({message:"post not found"})
      // }
      // const userRole = update_id.user.role
      // if(userRole!=="admin"|| id !== update_id.user.id){
      //   return res.status(403).json({message:"unauthorized to update this post"})
      // }
      //  return res.status(200).json({message:"post updated successfully", update_id});
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({message:"error occured while updating", err});
    }
  }

  module.exports.delete_put_id = async (req, res) => {
    const id = req.params.id;
    
    try {
        const post = await Post.findById(id);
        console.log(post.user.id);
        console.log(req.user._id);
        if (!post) {
            return res.status(404).json({ message: "the post was not found" });
        }

        if (req.user.role !== "admin" && String (req.user._id) !== String(post.user.id)){
            return res.status(403).json({ message: "unauthorized to delete this post" });
        }

        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post could not be deleted" });
        }
        
        // Only one response should be sent here
        return res.status(200).json({ message: "Post was deleted successfully", deletedPost });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "error deleting the post", err });
    }
};



//   module.exports.send_id = async (req,res)=>{
//     const {id}= req.body;
//     try {
//       if(!id){
//        return res.status(400).json({errors:{id:"id is required"}})
//       }else{
//       // remember we created a static login function in our model, so we will use it here to login
//       const user = await Post.findById(id)
//       if(!user){
//         res.status(404).json({message:"id could not be found"});
//       }

//       res.status(200).render(`contents`,{title:user.title,body:user.body})
//      //  res.render(`contents`);
//       console.log(`post exist`);
//       }
//     } catch (err) {
//      const errors = handleError(err);
//      res.status(400).json({errors})
//     }
//  }


  //now we proceed to create the first form of error handling

  const handleError = (err)=>{
    console.log(err.message , err.code);
    //we destructure the type of errors

    let errors ={ email:``, password: ``}

    //incorrect email
    if(err.message ==="incorrect email"){
        errors.email= "Email is not registered "
    }

   //incorrect password
    if (err.message ==="incorrect password"){
      errors.password = "that password is incorrect"
    }
   // dublication error code

   if (err.code ===11000){
    errors.email =`this email is already registered`

    return errors
   }

   //validation errors
   if(err.message.includes(`user validation failed`)){
    Object.values(err.errors).forEach(({properties})=>{
      errors[properties.path]= properties.message;
    });
   }
   return errors;
  }
const mongoose = require(`mongoose`);

const User = require(`../model/users`)


const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    //later on, we will try to populate this user in the middleware
    user:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: `User`, //this make reference to the user model and populate the contents with the user model
            required: true
        },
        name:{
            type: String,
            ref: 'User'
        },
        email:{
            type:String,
            ref:`User`
        },
        role:{
            type:String,
            ref:`User`
        }
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    updatedAt:{
        type:Date,
        default: Date.now
    }
});




//what we want to do in this middleware is to populate the post model we defined in our model, so we populate before we save in the database , and since we will wait for it to populate before moving ahead, we use the async function  and next to move to the next middleware

postSchema.pre(`save`,async function (next){
    //now what do we want to do inside the function, we use the try catch method to check what we have to do,which is populating the users in the post
  
    try {
       const user = await User.findById(this.user.id);
  
       if(user){
          //if a user is found by the id, we take the name and email
  
          this.user.name = user.name;
          this.user.email = user.email;
  
       } //we set the updated timestamp to the current time
       this.updatedAt = new Date();
       // then before we set the created time,we have to check if there is an existing created timestamp, so we use an if statement 
     
       if(!this.createdAt){
         this.createdAt = new Date();
       //dont forget to move it to the next middleware
       //to save the middleware
     }next();
    } catch (err) {
      next(err);
    }
  } )
  
  //next it is to populate the createdAt and updatedAt ...updating the timestamps before saving them
  
  
     
  
  //the next thing we have to do now is to get the post and insert all the data we have gotten into it
  
  //so we call the post schema
  
  postSchema.post(`find`, async function (posts){
      //now what left go through the posts(remember that the database pluralize the model name) (loop) and use the id on them(since the share the same id with the user) and get the name and email and save it using the findById method
  
      for(const post of posts){
          const user = await User.findById(post.user.id)//how it is arranged in the model
          //now we check if the user id exists , and if it does we equate the name and email to the post on the left
  
          if(user){
             post.user.name = user.name;
             post.user.email = user.email;
          }
      }
  })

const Post = mongoose.model(`post`,postSchema);

module.exports= Post;
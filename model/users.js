const mongoose = require(`mongoose`);

const bcrypt = require(`bcrypt`);

const {isEmail}= require (`validator`);

//now we have to create a schema, since it will be an instance we will have to add new

const userSchema = new mongoose.Schema ({
     name:{
       type:String,
       required:[true, "please enter a name"]
     },

    email:{
        type:String,
        required:[true, "please enter an email"],
        unique:true,
        lowercase:true,
        //now is where we use our validator to check for correct email
        validate:[isEmail, "please input a valid email address"]
    },
      password:{
        type:String,
        required:[true,"type in your password"],
        //now we set the length that we want the password to have
        minLength:[6, "minimum password length is six characters"]
      },
      role:{
        type:String,
        enum: [`admin`,`user`], //this part is to define the available roles
        default:`user`  //default role for new users
      },
      updatedAt:{
        type:Date,
        default: Date.now
      },
      createdAt:{
        type:Date,
        default: Date.now
      }
})

//this is for hashing the password
userSchema.pre(`save`, async function(next){
    // the line below is to make sure the password is hashed only when it is modified, so we will not end up harshing an already hashed password

    if(!this.isModified(`password`)){
      return next();
    }
  
  const salt = await bcrypt.genSalt(10)
    //next we want to hash the password, so we do it by creating an instance of the user
    this.password= await bcrypt.hash(this.password,salt)
    next();
})



//this is to create a static method for logging in a user

userSchema.statics.login = async function (email, password){
  
  try {
    //console.log(`awaiting login in with this email:`, email)
    const user = await this.findOne({email});
    // console.log(`User:`, user);
  if(user){
    const auth = await bcrypt.compare(password,user.password)
    if(auth){
      //res.send(`login successful`)
      return user;
    }
    throw new Error(`incorrect password`)
  }
  throw new Error(`incorrect email`)

  } catch (err) {
    throw err
  }
}


// we are done creating our schema and hashing password, now we have to create the model

const User = mongoose.model(`user`, userSchema);//takes 2 args, the name of the database user and the userSchema

//now for us to be able to use the model, we have to export it
module.exports= User;
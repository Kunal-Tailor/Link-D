import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";




// const convertUserDataTOPDF =async (userData)=>{
//     const doc=new PDFDocument();

//     const outputPath=crypto.randomBytes(32).toString('hex') + '.pdf';
//     const stream=fs.createWriteStream("uploads/"+outputPath);

//     doc.pipe(stream);

//     doc.image(`uploads/${userData.userId.profilePicture}`, {align: 'center', width: 100})
//     doc.fontSize(14).text(`Name: ${userData.userId.name}`, {align: 'center'});
//     doc.fontSize(14).text(`Username: ${userData.userId.username}`, {align: 'center'});
//     doc.fontSize(14).text(`Email: ${userData.userId.email}`, {align: 'center'});
//     doc.fontSize(14).text(`Bio: ${userData.bio}`, {align: 'center'});
//     doc.fontSize(14).text(`Current: ${userData.currentPost}`, {align: 'center'});

//     doc.fontSize(14).text("Past Work : ")
//     userData.pastWork.forEach((work, index) => {
//         doc.fontSize(14).text(`company: ${work.company}`);
//         doc.fontSize(14).text(`position: ${work.position}`);
//         doc.fontSize(14).text(`years: ${work.years}`);
//     });

//     doc.end();

//     return outputPath;


// }


import path from "path";
import Comment from "../models/comments.model.js";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();

  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const fullOutputPath = path.resolve("uploads", outputPath);

  const stream = fs.createWriteStream(fullOutputPath);
  doc.pipe(stream);

  // ✅ Check if profile picture exists before using
  if (userData.userId.profilePicture) {
    const imagePath = path.resolve("uploads", userData.userId.profilePicture);
    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, { align: "center", width: 100 });
    } else {
      console.warn("⚠️ Profile picture not found:", imagePath);
      // Optional: add placeholder image instead
    }
  }

  doc.fontSize(14).text(`Name: ${userData.userId.name}`, { align: "center" });
  doc.fontSize(14).text(`Username: ${userData.userId.username}`, { align: "center" });
  doc.fontSize(14).text(`Email: ${userData.userId.email}`, { align: "center" });
  doc.fontSize(14).text(`Bio: ${userData.bio}`, { align: "center" });
  doc.fontSize(14).text(`Current: ${userData.currentPost}`, { align: "center" });

  doc.fontSize(14).text("Past Work : ");
  userData.pastWork.forEach((work) => {
    doc.fontSize(14).text(`Company: ${work.company}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });

  doc.end();

  // Wait until PDF is fully written
  await new Promise((resolve) => stream.on("finish", resolve));

  return fullOutputPath;
};



export const activeCheck=async(req,res)=>{
    return res.status(200).json({message:"Running"})
}


export const register=async(req,res)=>{
    try{
        // console.log(req.body);
        const { name, email, password, username } = req.body;

        if(!name || !email || !password || !username){
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user=await User.findOne({
            email
        });
        if(user){
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();

        const profile=new Profile({userId: newUser._id});
        await profile.save();

        return res.json({message:"user created"})

    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}



export const login=async(req,res)=>{
    try{
        const {email,password}= req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user =await User.findOne({
            email
        });
        if(!user){
            return res.status(400).json({
                message: "User does not exist"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token =crypto.randomBytes(32).toString('hex');

        await User.updateOne({
            _id: user._id
        },{token});

        return res.json({token})


    }catch(err){
         return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


export const uploadProfilePicture = async (req, res) => {
    const {token} = req.body;
    
    try{
        const user = await User.findOne({
           token: token
        });
        if(!user){
            return res.status(400).json({
                message: "User does not exist"
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        user.profilePicture = req.file.filename;
        await user.save();
        return res.json({
            message: "Profile picture uploaded successfully",
            profilePicture: user.profilePicture
        }); 

    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}




export const updateUserProfile = async (req, res) => {
    try{
        const {token, ...newUserData}= req.body;

        const user=await User.findOne({
            token: token
        });

        if(!user){
            return res.status(400).json({
                message: "User does not exist"
            });
        }

        const {username,email}=newUserData;

        if (username || email) {
            const existingUser = await User.findOne({
                $or: [
                    ...(username ? [{ username }] : []),
                    ...(email ? [{ email }] : [])
                ]
            });
            if (existingUser && String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({
                    message: "Username or email already exists"
                });
            }
        }

        Object.assign(user, newUserData);
        await user.save();

        return res.json({
            message: "User profile updated successfully",
            user
        });



    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


// export const getUserAndProfile = async (req, res) => {
//     try{
//         const {token} = req.query;
//         console.log(token);

//         const user = await User.findOne({
//             token: token
//         })

//         if(!user){
//             return res.status(400).json({
//                 message: "User does not exist"
//             });
//         }
//         const userProfile= await Profile.findOne({
//             userId: user._id
//         }).populate("userId",'name email username profilePicture');

//         return res.json(userProfile)


//     }catch(err){
//         return res.status(500).json({
//             message: "Internal Server Error",
//             error: err.message
//         });
//     }
// }

export const getUserAndProfile = async (req, res) => {
  try {
    const token = req.query.token || req.body.token || req.headers.authorization?.split(" ")[1];
    // console.log("Token received:", token);

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const userProfile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name email username profilePicture");

    return res.json(userProfile);
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


export const updateProfileData=async(req,res)=>{

    try{
        const {token, ...newProfileData} = req.body;
        const userProfile=await User.findOne({token: token});

        if(!userProfile){
            return res.status(400).json({
                message: "User does not exist"
            });
        }

        const profile_to_update=await Profile.findOne({userId: userProfile._id});

        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();

        return res.json({
            message: "Profile updated successfully",
            profile: profile_to_update
        });

    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


export const getAllUserProfile=async(req,res)=>{

    try{
        const profiles=await Profile.find().populate("userId", 'name email username profilePicture');

        return res.json({profiles});
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


// export const downloadProfile = async (req, res) => {
//     const user_id = req.query.id;

//     const userProfile = await Profile.findOne({ userId: user_id }).populate("userId", 'name email username profilePicture');

//     if (!userProfile) {
//         return res.status(404).json({ message: "Profile not found for this user" });
//     }

//     let outputPath = await convertUserDataTOPDF(userProfile);
//     return res.json({ message: outputPath });
// };


export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found for this user" });
    }

    let outputPath = await convertUserDataTOPDF(userProfile);

    // ✅ Extract only filename from full path
    const fileName = path.basename(outputPath);

    return res.json({ message: fileName });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


// ---------------- Connections ----------------
export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) return res.status(404).json({ message: "Connection user not found" });

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId,
    });
    if (existingRequest) return res.status(400).json({ message: "Request already sent" });

    const request = new ConnectionRequest({ userId: user._id, connectionId });
    await request.save();

    return res.json({ message: "Request sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyConnectionRequests = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const connections = await ConnectionRequest.find({ userId: user._id }).populate(
      "connectionId",
      "name email username profilePicture"
    );

    return res.json({ message: "My sent requests", connections });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const connections = await ConnectionRequest.find({ connectionId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    return res.json({ message: "Incoming requests", connections });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const connection = await ConnectionRequest.findById(requestId);
    if (!connection) return res.status(400).json({ message: "Connection request not found" });

    connection.status_accepted = action_type === "accept";
    await connection.save();

    return res.json({ message: "Connection updated", connection });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const commentPost = async(req, res)=>{
    const {token, post_id, commentBody} = req.body;

    try {
        const user = await User
        .findOne({token:token}).select("_id");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const post = await Post.findOne({_id:post_id});

        if(!post){
            return res.status(404).json({message:"Post not found"});
        }

        const comment = new Comment({
            userId:user._id,
            postId:post_id,
            body:commentBody
        });


        await comment.save();
        return res.json({message:"Comment added successfully"});


    }catch(error){
        return res.status(500).json({message:error.message})
    }
}




export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
    let { username } = req.query;
  
    console.log("Received username in backend:", username); // ✅ First log
  
    try {
      // Trim and make case-insensitive
      username = username?.trim();
      console.log("Looking for user:", username); // ✅ After trimming
  
      const user = await User.findOne({ 
        username: new RegExp(`^${username}$`, 'i') // case-insensitive exact match
      });
  
      console.log("User found:", user); // ✅ After fetching user
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("Looking for profile of:", user._id); // ✅ Before fetching profile
  
      const userProfile = await Profile.findOne({ userId: user._id })
        .populate('userId', 'name email username profilePicture');
  
      console.log("Profile found:", userProfile); // ✅ After fetching profile
  
      if (!userProfile) {
        return res.status(404).json({ message: "Profile not found for this user" });
      }
  
      return res.json({ profile: userProfile });
  
    } catch (error) {
      console.error("Error in getUserProfileAndUserBasedOnUsername:", error);
      return res.status(500).json({ message: error.message });
    }
  };
  
  

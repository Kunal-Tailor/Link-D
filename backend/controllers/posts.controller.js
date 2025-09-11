import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";


export const activeCheck=async(req,res)=>{
    return res.status(200).json({message:"Running"})
}


export const createPost = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    });

    await post.save();
    return res.status(200).json({
      message: "Post created successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};



export const getAllPosts=async(req,res)=>{
    try{
        const posts=await Post.find().sort({createdAt:-1}).populate("userId","name email username profilePicture");
        return res.json({ posts});
    }catch(err){
        return res.status(500).json({
            message: err.message,
        });
    }
}


export const deletePost=async(req,res)=>{
    const {token,post_id}=req.body;
    try{    
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        
        const post= await Post.findOne({ _id: post_id });

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        if( post.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this post",
            });
        }

        await Post.deleteOne({ _id: post_id });
        return res.status(200).json({
            message: "Post deleted successfully",
        });


    }catch(err){
        return res.status(500).json({
            message: err.message,
        });
    }
}


export const commentPost=async(req,res)=>{
    const { token, post_id, commentBody } = req.body;
    try{
        const user=await User.findOne({ token:token }).select("_id");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const comment=new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody,
        })
        await comment.save();

        return res.status(200).json({
            message: "Comment added successfully",
        });

    }catch(err){
        return res.status(500).json({
            message: err.message,
        });
    }
}

export const get_comments_by_post=async(req,res)=>{
    const { post_id } = req.query;
    try {
        const post= await Post.findOne({ _id: post_id }).select('_id');
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const comments = await Comment.find({ postId: post._id }).sort({ _id: -1 }).populate('userId', 'name email profilePicture');
        return res.json({ comments });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
}

export const delete_comment_of_user=async(req,res)=>{
    const {token,comment_id} = req.body;
    try{
        const user=await User.findOne({ token:token }).select("_id");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const comment = await Comment.findOne({ _id: comment_id });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this comment",
            });
        }

        await Comment.deleteOne({ _id: comment_id });
        return res.status(200).json({
            message: "Comment deleted successfully",
        });



    }catch(err){
        return res.status(500).json({
            message: err.message,
        });
    }
}

// export const increment_likes=async(req,res)=>{
//     try{
//         const {post_id}= req.body;

//         const post = await Post.findOne({ _id: post_id });

//         if (!post) {
//             return res.status(404).json({
//                 message: "Post not found",
//             });
//         }

//         post.likes += 1;
//         await post.save();
//         return res.status(200).json({
//             message: "Post liked successfully",
//             likes: post.likes,
//         });
        

//     }catch(err){
//         return res.status(500).json({
//             message: err.message,
//         });
//     }
// }



   export const toggle_like = async (req, res) => {
    const { post_id, user_id } = req.body;

    try {
        const post = await Post.findById(post_id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Initialize likedByUsers properly if missing
        if (!Array.isArray(post.likedByUsers)) {
            post.likedByUsers = [];
        } else {
            // Remove any accidental null/undefined inside array
            post.likedByUsers = post.likedByUsers.filter(id => id !== null && id !== undefined);
        }

        // Now safely work
        const userIdStr = user_id?.toString();
        const likedUsersStr = post.likedByUsers.map(id => id.toString());

        if (!userIdStr) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (likedUsersStr.includes(userIdStr)) {
            // Unlike
            post.likes = Math.max(0, post.likes - 1);
            post.likedByUsers = post.likedByUsers.filter(id => id.toString() !== userIdStr);
        } else {
            // Like
            post.likes += 1;
            post.likedByUsers.push(user_id);
        }

        await post.save();

        return res.status(200).json({
            message: "Post Like Toggled",
            likes: post.likes
        });

    } catch (error) {
        console.error("Toggle Like Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

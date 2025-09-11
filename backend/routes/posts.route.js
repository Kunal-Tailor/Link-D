import { Router } from "express";
import { activeCheck,createPost,getAllPosts,deletePost,commentPost,get_comments_by_post,delete_comment_of_user, toggle_like } from "../controllers/posts.controller.js";
import multer from "multer";
import crypto from "crypto";


const router=Router();


const storage=multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg","image/png","image/webp","video/mp4","video/quicktime","application/pdf"];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error("Unsupported file type"));
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});



router.route("/").get(activeCheck)
router.route("/post").post(upload.single('media'), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/increment_post_like").post(toggle_like);

export default router;
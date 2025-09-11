import { Router } from "express";
import { register,login,uploadProfilePicture,updateUserProfile,getUserAndProfile,updateProfileData,getAllUserProfile,downloadProfile,sendConnectionRequest,getMyConnectionRequests,whatAreMyConnections,acceptConnectionRequest, getUserProfileAndUserBasedOnUsername } from "../controllers/user.controller.js";
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
        const allowed = ["image/jpeg","image/png","image/webp"];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error("Unsupported file type"));
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});


router.route("/update_profile_picture").post(upload.single('profile_picture'),uploadProfilePicture);




router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile)
router.route("/user/download_resume").get(downloadProfile)

router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequest").get(getMyConnectionRequests);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);

router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername)

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.route.js";
import userRoutes from "./routes/user.route.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(postRoutes);
app.use(userRoutes);

app.use(express.static("uploads"));


const start=async()=>{
    const connection = await mongoose.connect("mongodb+srv://kunalnamdev55_db_user:9yiAKvFAzSNvP0EZ@linkd.dct9bew.mongodb.net/?retryWrites=true&w=majority&appName=LinkD");

    app.listen(9090,()=>{
        console.log("Server started on port 9090");
    })
}

start();
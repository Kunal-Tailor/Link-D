import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "@/config";



export const loginUser=createAsyncThunk("user/login",
    async(user,thunkAPI)=>{
        try{
            const response=await clientServer.post(`/login`,{
                email:user.email,
                password:user.password
            });

            if(response.data.token){
            localStorage.setItem("token",response.data.token);
            }else{
                return thunkAPI.rejectWithValue({message:"token not provided"});
            }

            return thunkAPI.fulfillWithValue(response.data.token);

        }catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const registerUser=createAsyncThunk(
    "user/register",
    async(user,thunkAPI)=>{
        
        try{

            const response=await clientServer.post(`/register`,{
                username:user.username,
                password:user.password,
                email:user.email,
                name:user.name
            })
            return response.data;
        }catch(err){
            return thunkAPI.rejectWithValue(err.response.data);
        }
    }
)



export const getAboutUser = createAsyncThunk("user/getAboutUser", async (user, thunkAPI) => {
    try {
        const response = await clientServer.get("/get_user_and_profile", {
            params:{
                token: user.token
            }
        })

        return thunkAPI.fulfillWithValue(response.data)
        
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data)

    }
})


export const getAllUsers=createAsyncThunk(
    "user/getAllUsers",
    async(_,thunkAPI)=>{
        try{
            const response=await clientServer.get("/user/get_all_users");
            return thunkAPI.fulfillWithValue(response.data);

        }catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

// ✅ SendConnectionRequest
export const sendConnectionRequest = createAsyncThunk("user/sendConnectionRequest",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/user/send_connection_request", {
                token: user.token,
                connectionId: user.user_id
            });

            thunkAPI.dispatch(getConnectionRequest({ token: user.token }));

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { message: "Request failed" });
        }
    }
);

// ✅ GetConnectionRequests (incoming requests for current user)
export const getConnectionRequest = createAsyncThunk("user/getConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/getConnectionRequest", {
                params: { token: user.token }   // ✅ FIXED
            });

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { message: "Request failed" });
        }
    }
);

// ✅ GetMyConnectionRequests (requests sent by current user)
export const getMyConnectionRequest = createAsyncThunk("user/getMyConnectionRequest",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/user_connection_request", {
                params:{
                    token: user.token  
                }
            });

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { message: "Request failed" });
        }
    }
);

// ✅ AcceptConnection
export const AcceptConnection = createAsyncThunk("user/AcceptConnection",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/user/accept_connection_request", {
                token: user.token,
                requestId: user.connectionId,  // ✅ FIXED KEY
                action_type: user.action
            });

            thunkAPI.dispatch(getConnectionRequest({ token: user.token }));
            thunkAPI.dispatch(getMyConnectionRequest({ token: user.token }));

            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { message: "Request failed" });
        }
    }
);

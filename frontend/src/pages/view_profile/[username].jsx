import clientServer, { BASE_URL } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import style from "./index.module.css"
import { getAllPosts } from '@/config/redux/action/postAction';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { getConnectionRequest, getMyConnectionRequest, sendConnectionRequest } from '@/config/redux/action/authAction';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export default function ViewProfilePage({userProfile}) {

     const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  

   
  const [isCurrentUserInConnections, setIsCurrentUserInConnections] = useState(false);


  const [isConnectionNull, setIsConnectionNull] = useState(true);

    const searchParmas = useSearchParams();
    useEffect(() =>{
      console.log(searchParmas.get("username"))
    })

    const getUSerPosts = async () => {
      await dispatch(getAllPosts());
      await dispatch(getConnectionRequest({token:localStorage.getItem("token")}));
      await dispatch(getMyConnectionRequest({token:localStorage.getItem("token")}));
    }

useEffect(() => {
  let post = postReducer.posts.filter((post) =>{
    return post.userId.username === userProfile.userId.username
  })
  setUserPosts(post);
}
, [postReducer?.posts])


// useEffect(() => {
//   console.log("Connections:", authState.connections);
// }, [authState.connections]);


useEffect(() => {
  console.log(  "jhdhd",authState.connections, userProfile.userId._id)
  if(authState.connections.some(user => user.connectionId._id === userProfile.userId._id)){
    setIsCurrentUserInConnections(true);
    if(authState.connections.find(user => user.connectionId._id === userProfile.userId._id).status_accepted === true){
      setIsConnectionNull(false)
  }
}

if(authState.connectionRequest.some(user => user.userId._id === userProfile.userId._id)){
  setIsCurrentUserInConnections(true);
  if(authState.connectionRequest.find(user => user.userId._id === userProfile.userId._id).status_accepted === true){
    setIsConnectionNull(false)
}
}
  }
, [authState.connections, authState.connectionRequests])


useEffect(() => {
  getUSerPosts();
}
, [])
  return (
    <UserLayout>
      <DashboardLayout>
         <div  className={style.container}  >
      <div className={style.backDropContainer}  >
<img   className={style.backDrop} src={`${BASE_URL}/${userProfile.userId.profilePicture}`} alt="" />

      </div>

      <div  className={style.profileContainer_details}>

        <div  className={style.profileContainer_flex} >

          <div style={{flex:"0.8"}} >

            <div style={{display:"flex", gap:"1.2rem", alignItems:"center", width:"fit content"}} >
              <h2>{userProfile.userId.name}</h2>
              <p  style={{color:"gray"}} > {userProfile.userId.username} </p>

            </div>

            <div  style={{display:"flex", alignItems:"center", gap:"1.2rem"}}  >

            {isCurrentUserInConnections  ?
            <button className={style.connectedBotton} >{isConnectionNull ? "Pending" :"Connected"}</button>
            :<button onClick={   async() =>{
             await dispatch(sendConnectionRequest({token:localStorage.getItem("token"), user_id:userProfile.userId._id}))
             
            }}  className={style.connectedBtn} >Connect</button>
            }

            <div  style={{cursor:"pointer"}}  onClick={ async() => {
const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`)

window.open(`${BASE_URL}/${response.data.message}`, "_blank")
            }}>
            <svg  style={{width :"1.2em"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>

            </div>
            </div>
                   
                   <div>
                    <p>{userProfile.bio}</p>
                   </div>

          </div>

          <div style={{flex:"0.2"}} >

            <h3>Recent Activity</h3>
             {userPosts.map((post) => {
              
              

              return(
                <div  key={post._id} className={style.postCard}  >
<div className={style.card}>
  <div className={style.card_profileContainer}  > 
  


    {post.media !=="" ? <img src={`${BASE_URL}/${post.media}`} alt="" />
     :
      <div style={{width:"3.4rem", height:"3.4rem"}}> </div> }

  </div>

  <p>{post.body}</p>

</div>



                </div>
              )
             })}
            

            </div>

        </div>

      </div>

  <div className={style.workHistoryCard}>
  <h4>Work History</h4>
  <div className={style.workHistoryContainer}>
    {
      userProfile.pastWork?.map((work, index) => {
        return (
          <div key={index} className={style.workHistoryCard}>
            <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem" }}>
              {work.company} - {work.position}
            </p>
            <p>{work.years}</p>
          </div>
        )
      })
    }
  </div>
</div>




     
    </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export async function getServerSideProps(context) {
  console.log("From view")
  console.log(context.query.username)
  const request=await clientServer.get("/user/get_profile_based_on_username",{
    params:{
      username:context.query.username
    }
  })
  const response=await request.data;
  console.log(response);
  return { props: {userProfile:request.data.profile} };
}

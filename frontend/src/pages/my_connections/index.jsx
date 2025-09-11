import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React from 'react'
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { AcceptConnection, getMyConnectionRequest } from '@/config/redux/action/authAction';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

import style from "./style.module.css"
import { BASE_URL } from '@/config';

function MyConnectionsPage() {
 
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth)

useEffect(() =>{
  dispatch(getMyConnectionRequest({token:localStorage.getItem("token")}))


  
}, [])

useEffect(() => {
if(authState.connectionRequest.length !=0){
  console.log("Connection Request:", authState.connectionRequest)
}
}, [authState.connectionRequest])


  return (
    
       <UserLayout>
   <DashboardLayout>
<div  style={{display:"flex", flexDirection:"column", gap:"1.7rem"}} >
   

<h4 className={style.sectionTitle}>My Connections</h4>

    {authState.connectionRequest.length ==0 && <h1 style={{textAlign:"center"}} >No Connection Requests  Pending</h1>}

{  authState.connectionRequest.length !=0 && authState.connectionRequest.filter((connection) =>connection.status_accepted === null).map((user, index) => {
  return(
    <div onClick={() =>{
      router.push(`/view_profile/${user.userId.username}`)
    }}
    key={index}  className={style.userCard}  >
      <div style={{display:"flex", alignItems:"center", gap:"1.3rem"}}  >
        <div className={style.profilePicture} >
          <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt={user.name} />

        </div>

        <div className={style.userCardInfo} >

          <h2 >{user.userId.name}</h2>
          <p >{user.userId.username}</p>

        </div>
        <button onClick={(e) =>{
  e.stopPropagation();
  dispatch(AcceptConnection({
    connectionId:user._id,
    token:localStorage.getItem("token"),
    action:"accept"
  }))
        }}
         className={style.connectedButton} >Accept</button>

      </div>
      
    </div>
  )
}
)}

<h4 className={style.sectionTitle}>My Network</h4>


{authState.connectionRequest.filter((connection) =>connection.status_accepted !== null).map((user, index) => {
  return(
  <div onClick={() =>{
    router.push(`/view_profile/${user.userId.username}`)
  }}
  key={index}  className={style.userCard}  >
    <div style={{display:"flex", alignItems:"center", gap:"1.3rem"}}  >
      <div className={style.profilePicture} >
        <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt={user.name} />

      </div>

      <div className={style.userCardInfo} >

        <h2 >{user.userId.name}</h2>
        <p >{user.userId.username}</p>

      </div>
      

    </div>
    
  </div>
  )

})}


</div>


   </DashboardLayout>



    </UserLayout>


    
  )
  
}

export default MyConnectionsPage
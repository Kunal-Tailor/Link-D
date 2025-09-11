import { BASE_URL } from '@/config'
import { getAllUsers } from '@/config/redux/action/authAction'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { use, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { useRouter } from 'next/router'

function Discoverpage() {

    const authState=useSelector((state)=>state.auth)

    const dispatch=useDispatch();

    useEffect(()=>{
        if(!authState.all_profiles_fetched){
            dispatch(getAllUsers());
        }
    },[])

    const router=useRouter();




  return (
    <UserLayout>
  
      {/* <p>Welcome, {authState.user.userId.name}</p> */}
      <DashboardLayout>
        <div>
            <h1>Discover</h1>
            <div className={styles.userProfile}>
              {authState.all_profiles_fetched && authState.all_users.map((user)=>{
                return(
                  <div 
                  onClick={()=>{
                    router.push(`/view_profile/${user.userId.username}`)
                  }} className={styles.userCard}>
                    <img 
        className={styles.userCard_img} 
        src={`${BASE_URL}/${user.userId.profilePicture}`} 
        alt={user.userId.name || 'User'} 
      />
      <div>
        <h2>{user.userId.name}</h2>
        <p>{user.userId.username}</p>
      </div>
                  </div>
                )
              })}
            </div>

        </div>
      </DashboardLayout>

    </UserLayout>
  )
}

export default Discoverpage
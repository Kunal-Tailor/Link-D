import { BASE_URL } from '@/config'
import { getAllUsers } from '@/config/redux/action/authAction'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import React, { use, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { useRouter } from 'next/router'
import { useTheme } from '@/contexts/ThemeContext'

function Discoverpage() {

    const authState=useSelector((state)=>state.auth)
    const { colors } = useTheme();

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
        <div className={styles.container}>
            <h1 className={styles.discoverHeading} style={{color: colors.text}}>Discover</h1>
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
      <div className={styles.userInfo}>
        <h2 style={{color: colors.text}}>{user.userId.name}</h2>
        <p style={{color: colors.textSecondary}}>{user.userId.username}</p>
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
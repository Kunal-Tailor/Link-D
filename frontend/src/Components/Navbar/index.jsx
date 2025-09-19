import React from 'react'
import styles from './style.module.css'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { reset } from '@/config/redux/reducer/authReducer'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/Components/ThemeToggle'

function NavBarComponent() {

  const router = useRouter()
  const authState=useSelector((state)=>state.auth)
  const dispatch=useDispatch();
  const { colors } = useTheme();


  return (
    <div className={styles.container}>
        <nav className={styles.navBar}>
            <h1 style={{cursor: "pointer"}} onClick={() => {router.push("/")}}>Pro Connect</h1>

            <div className={styles.navBarOptionContainer}>

                {authState.profileFetched && 
                <div>
                  <div style={{display:"flex",gap:"1.2rem", alignItems:"center"}}>
                    <p style={{color: colors.text}}>Hey, {authState.user.userId.name}</p>
                    <ThemeToggle />
                  <p onClick={()=>{
                    router.push("/profile")
                  }} style={{fontWeight:"bold",cursor:"pointer", color: colors.primary}}>Profile</p> 

                    <p onClick={()=>{
                        localStorage.removeItem("token");
                        router.push("/login");
                        dispatch(reset())
                    }} style={{fontWeight:"bold",cursor:"pointer", color: colors.error}}>Logout</p>

                  </div>

                  

                </div>}

                {!authState.profileFetched && <div onClick={()=>{
                    router.push("/login")
                }} className={styles.buttonJoin}>
                    <p>Be a part</p>
                </div>
                }

            </div>
        </nav>
    </div>
  )
}

export default NavBarComponent
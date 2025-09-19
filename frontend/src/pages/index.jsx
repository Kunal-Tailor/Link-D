import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/Components/ThemeToggle';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const { colors } = useTheme();
    const router=useRouter();

  return (


    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h1 style={{color: colors.text, fontSize: '2.5rem', fontWeight: '700'}}>Pro Connect</h1>
              <ThemeToggle />
            </div>
            <p style={{color: colors.text, fontSize: '1.5rem', marginBottom: '1rem'}}>Connect with friends without Exaggeration</p>

            <p style={{color: colors.textSecondary, fontSize: '1.1rem', marginBottom: '2rem'}}>A True social media platform , with stories no blufs ! </p>

           <div onClick={()=>{
            router.push("/login")
          }} className={styles.buttonJoin}>
            <p>Join Now</p>
          </div>

          </div>

          <div className={styles.mainContainer_right}>
            <img src="images/homemain_connection.webp" alt="" />
          </div>
        </div>
      </div>

    </UserLayout>
  );
}

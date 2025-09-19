import clientServer, { BASE_URL } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect, useState } from 'react';
import style from "./index.module.css";
import { getAllPosts } from '@/config/redux/action/postAction';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { getConnectionRequest, getMyConnectionRequest, sendConnectionRequest } from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { posts } = useSelector((state) => state.postReducer);
    const { connections, connectionRequest } = useSelector((state) => state.auth);

    const [userPosts, setUserPosts] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connect'); // connect, pending, connected

    useEffect(() => {
        dispatch(getAllPosts());
        dispatch(getConnectionRequest({ token: localStorage.getItem("token") }));
        dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
    }, [dispatch]);

    useEffect(() => {
        const filteredPosts = posts.filter(post => post.userId.username === userProfile.userId.username);
        setUserPosts(filteredPosts);
    }, [posts, userProfile.userId.username]);

    useEffect(() => {
        const inConnections = connections.some(user => user.connectionId._id === userProfile.userId._id && user.status_accepted === true);
        const inRequests = connectionRequest.some(user => user.userId._id === userProfile.userId._id && user.status_accepted === true);

        if (inConnections || inRequests) {
            setConnectionStatus('connected');
        } else {
            const pendingRequest = connections.some(user => user.connectionId._id === userProfile.userId._id && user.status_accepted === null);
            if (pendingRequest) {
                setConnectionStatus('pending');
            } else {
                setConnectionStatus('connect');
            }
        }
    }, [connections, connectionRequest, userProfile.userId._id]);

    const handleConnect = async () => {
        await dispatch(sendConnectionRequest({ token: localStorage.getItem("token"), user_id: userProfile.userId._id }));
        setConnectionStatus('pending');
    };

    const handleDownloadResume = async () => {
        const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`);
        window.open(`${BASE_URL}/${response.data.message}`, "_blank");
    };

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={style.container}>
                    <div className={style.backDropContainer}>
                        <img className={style.profilePicture} src={`${BASE_URL}/${userProfile.userId.profilePicture}`} alt={`${userProfile.userId.name}'s profile`} />
                    </div>

                    <div className={style.profileDetails}>
                        <div className={style.profileHeader}>
                            <div className={style.userInfo}>
                                <h2>{userProfile.userId.name}</h2>
                                <p>@{userProfile.userId.username}</p>
                            </div>
                            <div className={style.profileActions}>
                                {connectionStatus === 'connect' && <button onClick={handleConnect} className={style.connectButton}>Connect</button>}
                                {connectionStatus === 'pending' && <button className={style.pendingButton} disabled>Pending</button>}
                                {connectionStatus === 'connected' && <button className={style.connectedButton} disabled>Connected</button>}
                                <div onClick={handleDownloadResume} className={style.downloadResume}>
                                    <svg style={{ width: "1.5em" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className={style.bioSection}>
                            <p>{userProfile.bio}</p>
                        </div>
                    </div>

                    <div className={style.mainContent}>
                        <div className={style.workHistory}>
                            <h4>Work History</h4>
                            {userProfile.pastWork?.length > 0 ? (
                                userProfile.pastWork.map((work, index) => (
                                    <div key={index} className={style.workHistoryCard}>
                                        <p><strong>{work.company}</strong> - {work.position}</p>
                                        <p>{work.years}</p>
                                    </div>
                                ))
                            ) : <p>No work history available.</p>}
                        </div>

                        <div className={style.recentActivity}>
                            <h3>Recent Activity</h3>
                            {userPosts.length > 0 ? (
                                userPosts.map(post => (
                                    <div key={post._id} className={style.postCard}>
                                        {post.media && <img src={`${BASE_URL}/${post.media}`} alt="Post media" />}
                                        <p>{post.body}</p>
                                    </div>
                                ))
                            ) : <p>No recent activity.</p>}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}

export async function getServerSideProps(context) {
    const { username } = context.query;
    try {
        const response = await clientServer.get("/user/get_profile_based_on_username", { params: { username } });
        if (response.data.profile) {
            return { props: { userProfile: response.data.profile } };
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
    return { notFound: true }; // Or handle error as appropriate
}

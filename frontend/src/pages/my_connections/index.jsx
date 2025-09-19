import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { AcceptConnection, getMyConnectionRequest } from '@/config/redux/action/authAction';
import style from "./style.module.css";
import { BASE_URL } from '@/config';

function MyConnectionsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'network'

    const { connectionRequest } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getMyConnectionRequest({ token: localStorage.getItem("token") }));
    }, [dispatch]);

    const connectionRequests = connectionRequest.filter(conn => conn.status_accepted === null);
    const myNetwork = connectionRequest.filter(conn => conn.status_accepted !== null);

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={style.container}>
                    <div className={style.tabContainer}>
                        <div
                            className={`${style.tab} ${activeTab === 'requests' ? style.activeTab : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Connection Requests
                        </div>
                        <div
                            className={`${style.tab} ${activeTab === 'network' ? style.activeTab : ''}`}
                            onClick={() => setActiveTab('network')}
                        >
                            My Network
                        </div>
                    </div>

                    {activeTab === 'requests' && (
                        <div>
                            <h4 className={style.sectionTitle}>Pending Requests</h4>
                            {connectionRequests.length === 0 ? (
                                <p className={style.emptyMessage}>No pending connection requests.</p>
                            ) : (
                                connectionRequests.map((user, index) => (
                                    <div key={index} className={style.userCard}>
                                        <div className={style.userCardInfoContainer} onClick={() => router.push(`/view_profile/${user.userId.username}`)}>
                                            <div className={style.profilePicture}>
                                                <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt={user.userId.name} />
                                            </div>
                                            <div className={style.userCardInfo}>
                                                <h2>{user.userId.name}</h2>
                                                <p>@{user.userId.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(AcceptConnection({
                                                    connectionId: user._id,
                                                    token: localStorage.getItem("token"),
                                                    action: "accept"
                                                }));
                                            }}
                                            className={style.connectedButton}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div>
                            <h4 className={style.sectionTitle}>Your Connections</h4>
                            {myNetwork.length === 0 ? (
                                <p className={style.emptyMessage}>You haven't made any connections yet.</p>
                            ) : (
                                myNetwork.map((user, index) => (
                                    <div key={index} className={style.userCard} onClick={() => router.push(`/view_profile/${user.userId.username}`)}>
                                         <div className={style.userCardInfoContainer}>
                                            <div className={style.profilePicture}>
                                                <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt={user.userId.name} />
                                            </div>
                                            <div className={style.userCardInfo}>
                                                <h2>{user.userId.name}</h2>
                                                <p>@{user.userId.username}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}

export default MyConnectionsPage;

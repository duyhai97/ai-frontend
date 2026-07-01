import { useEffect, useState } from "react";

import Header from "./components/Header";
import type { AppTab } from "./components/Header";

import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import VideoGenerator from "./components/video/VideoGenerator.tsx";
import VideoHistory from "./components/VideoHistory";
import MyPurchases from "./components/MyPurchases";
import AdminPurchases from "./components/AdminPurchases";
import AdminUsers from "./components/AdminUsers";

import { useAuth } from "./hooks/useAuth";
import { getStyles } from "./styles/theme";

export default function App() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeTab, setActiveTab] = useState<AppTab>("video");

    const auth = useAuth();

    useEffect(() => {
        const resize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    useEffect(() => {
        if (!auth.token) return;

        if (
            !auth.isAdmin &&
            (activeTab === "admin" || activeTab === "purchases")
        ) {
            setActiveTab("video");
        }
    }, [auth.token, auth.isAdmin, activeTab]);

    const styles = getStyles(isMobile);

    if (!auth.token) {
        return (
            <LoginPage
                isMobile={isMobile}
                styles={styles}
                onLoginSuccess={(data) => {
                    auth.login(data);
                    setActiveTab("video");
                }}
            />
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <Header
                    username={auth.username}
                    roles={auth.roles}
                    activeTab={activeTab}
                    isAdmin={auth.isAdmin}
                    onChangeTab={setActiveTab}
                    onLogout={() => {
                        auth.logout();
                        setActiveTab("video");
                    }}
                    styles={styles}
                />

                {activeTab === "dashboard" && (
                    <Dashboard
                        username={auth.username}
                        roles={auth.roles}
                        isAdmin={auth.isAdmin}
                        styles={styles}
                    />
                )}

                {activeTab === "video" && (
                    <VideoGenerator
                        token={auth.token}
                        isMobile={isMobile}
                        styles={styles}
                    />
                )}

                {activeTab === "history" && (
                    <VideoHistory
                        token={auth.token}
                        styles={styles}
                    />
                )}

                {activeTab === "myPurchases" && (
                    <MyPurchases
                        token={auth.token}
                        styles={styles}
                    />
                )}

                {activeTab === "purchases" && auth.isAdmin && (
                    <AdminPurchases
                        token={auth.token}
                        styles={styles}
                    />
                )}

                {activeTab === "admin" && auth.isAdmin && (
                    <AdminUsers
                        token={auth.token}
                        active
                        isMobile={isMobile}
                        styles={styles}
                    />
                )}
            </div>
        </div>
    );
}
import { useEffect, useState } from "react";

import Header from "./components/Header";
import type { AppTab } from "./components/Header";

import LoginPage from "./components/LoginPage";
import VideoGenerator from "./components/VideoGenerator";
import VideoHistory from "./components/VideoHistory";
import AdminUsers from "./components/AdminUsers";

import { useAuth } from "./hooks/useAuth";
import { getStyles } from "./styles/theme";

export default function App() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeTab, setActiveTab] = useState<AppTab>("video");

    const auth = useAuth();

    useEffect(() => {
        const resize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    const styles = getStyles(isMobile);

    if (!auth.token) {
        return (
            <LoginPage
                isMobile={isMobile}
                styles={styles}
                onLoginSuccess={auth.login}
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
                    onLogout={auth.logout}
                    styles={styles}
                />

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
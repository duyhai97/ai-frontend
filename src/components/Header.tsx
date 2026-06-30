import type React from "react";

export type AppTab = "video" | "history" | "admin";

type Props = {
    username: string;
    roles: string[];
    activeTab: AppTab;
    isAdmin: boolean;
    onChangeTab: (tab: AppTab) => void;
    onLogout: () => void;
    styles: Record<string, React.CSSProperties>;
};

export default function Header({
                                   username,
                                   roles,
                                   activeTab,
                                   isAdmin,
                                   onChangeTab,
                                   onLogout,
                                   styles: s,
                               }: Props) {
    return (
        <div style={s.header}>
            <div>
                <div style={s.badge}>TikTok Affiliate Tool</div>
                <h1 style={s.title}>AI Video Generator</h1>
                <p style={s.subtitle}>
                    Xin chào <b>{username}</b> · Role:{" "}
                    <b>{roles.join(", ") || "USER"}</b>
                </p>
            </div>

            <div style={s.headerActions}>
                <TabButton
                    label="Video"
                    active={activeTab === "video"}
                    onClick={() => onChangeTab("video")}
                    styles={s}
                />

                <TabButton
                    label="History"
                    active={activeTab === "history"}
                    onClick={() => onChangeTab("history")}
                    styles={s}
                />

                {isAdmin && (
                    <TabButton
                        label="Admin"
                        active={activeTab === "admin"}
                        onClick={() => onChangeTab("admin")}
                        styles={s}
                    />
                )}

                <button type="button" onClick={onLogout} style={s.logoutButton}>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

function TabButton({
                       label,
                       active,
                       onClick,
                       styles: s,
                   }: {
    label: string;
    active: boolean;
    onClick: () => void;
    styles: Record<string, React.CSSProperties>;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                ...s.tabButton,
                background: active
                    ? "rgba(236,72,153,0.24)"
                    : "rgba(255,255,255,0.08)",
            }}
        >
            {label}
        </button>
    );
}
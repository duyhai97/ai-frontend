import type React from "react";

type Props = {
    username: string;
    roles: string[];
    isAdmin: boolean;
    styles: Record<string, React.CSSProperties>;
};

export default function Dashboard({ username, roles, isAdmin, styles: s }: Props) {
    return (
        <div style={s.card}>
            <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Dashboard</h2>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                }}
            >
                <StatCard title="Tài khoản" value={username} />
                <StatCard title="Role" value={roles.join(", ") || "USER"} />
                <StatCard title="Tạo video" value="Sẵn sàng" />
                <StatCard title="Quyền admin" value={isAdmin ? "Có" : "Không"} />
            </div>

            <div
                style={{
                    marginTop: 22,
                    padding: 18,
                    borderRadius: 18,
                    background: "#020617",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#cbd5e1",
                    lineHeight: 1.7,
                }}
            >
                <b>Gợi ý thao tác:</b>
                <br />
                - Vào tab <b>Video</b> để tạo video mới.
                <br />
                - Vào tab <b>History</b> để xem video đã tạo.
                <br />
                {isAdmin && (
                    <>
                        - Vào tab <b>Purchases</b> để duyệt đơn mua lượt.
                        <br />
                        - Vào tab <b>Admin</b> để tạo user mới.
                    </>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div
            style={{
                padding: 18,
                borderRadius: 18,
                background: "#020617",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <div
                style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    marginBottom: 8,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: "white",
                    fontSize: 22,
                    fontWeight: 900,
                    wordBreak: "break-word",
                }}
            >
                {value}
            </div>
        </div>
    );
}
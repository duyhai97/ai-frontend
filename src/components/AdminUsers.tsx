import { useEffect, useState } from "react";
import { createUserApi, getUsersApi } from "../api/userApi";
import type { UserResponse } from "../types/user";
import type React from "react";

type Props = {
    token: string;
    active: boolean;
    isMobile: boolean;
    styles: Record<string, React.CSSProperties>;
};

export default function AdminUsers({ token, active, isMobile, styles: s }: Props) {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("123456");
    const [newFullName, setNewFullName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState("USER");
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminMessage, setAdminMessage] = useState("");

    const loadUsers = async () => {
        try {
            setAdminLoading(true);
            setAdminMessage("");

            const data = await getUsersApi(token);
            setUsers(data);
        } catch (e: any) {
            setAdminMessage(e.message || "Lỗi tải user");
        } finally {
            setAdminLoading(false);
        }
    };

    const handleCreateUser = async () => {
        try {
            if (!newUsername.trim()) return alert("Nhập username");
            if (!newPassword.trim()) return alert("Nhập password");

            setAdminLoading(true);
            setAdminMessage("");

            await createUserApi(token, {
                username: newUsername,
                password: newPassword,
                fullName: newFullName,
                email: newEmail,
                roles: [newRole],
            });

            setAdminMessage("Tạo user thành công");
            setNewUsername("");
            setNewPassword("123456");
            setNewFullName("");
            setNewEmail("");
            setNewRole("USER");

            await loadUsers();
        } catch (e: any) {
            setAdminMessage(e.message || "Tạo user thất bại");
        } finally {
            setAdminLoading(false);
        }
    };

    useEffect(() => {
        if (active) loadUsers();
    }, [active]);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "420px 1fr",
                gap: 24,
                alignItems: "start",
            }}
        >
            <div style={{ ...s.card, padding: isMobile ? 18 : 28 }}>
                <div style={blockHeader}>
                    <div>
                        <h2 style={blockTitle}>Tạo user mới</h2>
                        <p style={blockSub}>Tạo tài khoản để user đăng nhập và tạo video.</p>
                    </div>
                </div>

                <Field label="Username">
                    <input
                        style={inputStyle}
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="user1"
                    />
                </Field>

                <Field label="Password">
                    <input
                        style={inputStyle}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="123456"
                    />
                </Field>

                <Field label="Full name">
                    <input
                        style={inputStyle}
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                    />
                </Field>

                <Field label="Email">
                    <input
                        style={inputStyle}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="user@example.com"
                    />
                </Field>

                <Field label="Role">
                    <select
                        style={inputStyle}
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </Field>

                {adminMessage && <div style={messageStyle}>{adminMessage}</div>}

                <button
                    disabled={adminLoading}
                    onClick={handleCreateUser}
                    style={{
                        ...primaryButton,
                        opacity: adminLoading ? 0.6 : 1,
                        cursor: adminLoading ? "not-allowed" : "pointer",
                    }}
                >
                    {adminLoading ? "Đang xử lý..." : "Tạo user"}
                </button>
            </div>

            <div style={{ ...s.card, padding: isMobile ? 18 : 28 }}>
                <div style={listHeader}>
                    <div>
                        <h2 style={blockTitle}>Danh sách user</h2>
                        <p style={blockSub}>Quản lý tài khoản đang có trong hệ thống.</p>
                    </div>

                    <button onClick={loadUsers} style={refreshButton}>
                        Refresh
                    </button>
                </div>

                <div style={userListStyle}>
                    {users.length === 0 ? (
                        <div style={emptyStyle}>Chưa có user</div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} style={userItemStyle}>
                                <div style={avatarStyle}>
                                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={userTopLine}>
                                        <div style={userNameStyle}>{user.username}</div>
                                        <div style={roleBadge(user.roles.includes("ADMIN"))}>
                                            {user.roles.join(", ")}
                                        </div>
                                    </div>

                                    <div style={userMetaStyle}>
                                        {user.fullName || "No name"}
                                        <span style={dotStyle}>•</span>
                                        {user.email || "No email"}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({
                   label,
                   children,
               }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label style={fieldStyle}>
            <span style={labelStyle}>{label}</span>
            {children}
        </label>
    );
}

const blockHeader: React.CSSProperties = {
    marginBottom: 22,
};

const listHeader: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 22,
};

const blockTitle: React.CSSProperties = {
    margin: 0,
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: -0.6,
    color: "#f8fafc",
};

const blockSub: React.CSSProperties = {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 1.5,
};

const fieldStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 8,
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 50,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "#020617",
    color: "white",
    padding: "0 16px",
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
    width: "100%",
    height: 52,
    border: 0,
    borderRadius: 18,
    background: "linear-gradient(90deg,#db2777,#f97316)",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    boxShadow: "0 18px 40px rgba(219,39,119,0.22)",
};

const refreshButton: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: "12px 18px",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
};

const messageStyle: React.CSSProperties = {
    margin: "8px 0 16px",
    color: "#bfdbfe",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.22)",
    padding: 12,
    borderRadius: 14,
    fontSize: 13,
};

const userListStyle: React.CSSProperties = {
    display: "grid",
    gap: 14,
};

const userItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 22,
    background: "linear-gradient(180deg, rgba(2,6,23,0.95), rgba(2,6,23,0.78))",
    border: "1px solid rgba(255,255,255,0.08)",
};

const avatarStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(236,72,153,0.16)",
    color: "#f9a8d4",
    fontWeight: 950,
    fontSize: 18,
    flexShrink: 0,
};

const userTopLine: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
};

const userNameStyle: React.CSSProperties = {
    fontWeight: 950,
    fontSize: 18,
    color: "#f8fafc",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

const userMetaStyle: React.CSSProperties = {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

const dotStyle: React.CSSProperties = {
    margin: "0 7px",
    color: "#64748b",
};

const emptyStyle: React.CSSProperties = {
    height: 180,
    borderRadius: 22,
    border: "1px dashed rgba(255,255,255,0.12)",
    background: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
};

function roleBadge(isAdmin: boolean): React.CSSProperties {
    return {
        flexShrink: 0,
        borderRadius: 999,
        padding: "6px 12px",
        background: isAdmin
            ? "rgba(236,72,153,0.16)"
            : "rgba(34,197,94,0.13)",
        color: isAdmin ? "#f9a8d4" : "#86efac",
        fontWeight: 950,
        fontSize: 12,
        letterSpacing: 0.5,
    };
}
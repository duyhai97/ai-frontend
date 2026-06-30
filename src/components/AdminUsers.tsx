import { useEffect, useState } from "react";
import { createUserApi, getUsersApi } from "../api/userApi";
import type { UserResponse } from "../types/user";
import type React from "react";

type Props = {
    token: string;
    isMobile: boolean;
    active: boolean;
    styles: Record<string, React.CSSProperties>;
};

export default function AdminUsers({ token, active, styles: s }: Props) {
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
        if (active) {
            loadUsers();
        }
    }, [active]);

    return (
        <div style={s.adminGrid}>
            <div style={s.card}>
                <h2 style={s.sectionTitle}>Tạo user</h2>

                <label style={s.label}>Username</label>
                <input
                    style={s.input}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="user1"
                />

                <label style={s.label}>Password</label>
                <input
                    style={s.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="123456"
                />

                <label style={s.label}>Full name</label>
                <input
                    style={s.input}
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                />

                <label style={s.label}>Email</label>
                <input
                    style={s.input}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                />

                <label style={s.label}>Role</label>
                <select
                    style={s.input}
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>

                {adminMessage && <div style={s.adminMessage}>{adminMessage}</div>}

                <button
                    disabled={adminLoading}
                    onClick={handleCreateUser}
                    style={{
                        ...s.button,
                        width: "100%",
                        marginTop: 18,
                        opacity: adminLoading ? 0.6 : 1,
                    }}
                >
                    {adminLoading ? "Đang xử lý..." : "Tạo user"}
                </button>
            </div>

            <div style={s.card}>
                <div style={s.sectionHeader}>
                    <h2 style={s.sectionTitle}>Danh sách user</h2>

                    <button onClick={loadUsers} style={s.logoutButton}>
                        Refresh
                    </button>
                </div>

                <div style={s.userList}>
                    {users.length === 0 ? (
                        <div style={s.emptyVideo}>Chưa có user</div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} style={s.userItem}>
                                <div>
                                    <div style={s.userName}>{user.username}</div>
                                    <div style={s.userSub}>
                                        {user.fullName || "No name"} ·{" "}
                                        {user.email || "No email"}
                                    </div>
                                </div>

                                <div style={s.userRoles}>
                                    {user.roles.join(", ")}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
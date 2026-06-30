import { useEffect, useState } from "react";

type VideoJob = {
    jobId: string;
    productName: string;
    affiliateLink: string;
    status: string;
    imagePaths?: string[];
    script?: string;
    videoUrl?: string;
    progress?: number;
    currentStep?: string;
    error?: string;
};

type LoginResponse = {
    token: string;
    username: string;
    roles: string[];
};

type UserResponse = {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
    enabled: boolean;
    roles: string[];
};

function App() {
    const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [roles, setRoles] = useState<string[]>(
        JSON.parse(localStorage.getItem("roles") || "[]")
    );

    const [loginUsername, setLoginUsername] = useState("admin");
    const [loginPassword, setLoginPassword] = useState("123456");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [activeTab, setActiveTab] = useState<"video" | "admin">("video");

    const [productName, setProductName] = useState("");
    const [affiliateLink, setAffiliateLink] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [job, setJob] = useState<VideoJob | null>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const [users, setUsers] = useState<UserResponse[]>([]);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("123456");
    const [newFullName, setNewFullName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState("USER");
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminMessage, setAdminMessage] = useState("");

    const isAdmin = roles.includes("ADMIN");

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    useEffect(() => {
        if (token && isAdmin && activeTab === "admin") {
            loadUsers();
        }
    }, [token, activeTab]);

    const s = getStyles(isMobile);

    const addLog = (msg: string) => {
        setLogs((old) => [`${new Date().toLocaleTimeString()} - ${msg}`, ...old]);
    };

    const authHeaders = () => ({
        Authorization: `Bearer ${token}`,
    });

    const handleLogin = async () => {
        try {
            setLoginLoading(true);
            setLoginError("");

            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: loginUsername,
                    password: loginPassword,
                }),
            });

            if (!res.ok) {
                throw new Error("Sai tài khoản hoặc mật khẩu");
            }

            const data = (await res.json()) as LoginResponse;

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("roles", JSON.stringify(data.roles || []));

            setToken(data.token);
            setUsername(data.username);
            setRoles(data.roles || []);
            setActiveTab("video");
        } catch (e: any) {
            setLoginError(e.message || "Đăng nhập thất bại");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("roles");

        setToken("");
        setUsername("");
        setRoles([]);
        setJob(null);
        setLogs([]);
        setUsers([]);
        clearImages();
    };

    const uploadImages = async (files: File[]) => {
        if (files.length === 0) return [];

        setUploading(true);
        addLog(`Bắt đầu upload ${files.length} ảnh`);

        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await fetch(`${API}/api/videos/upload`, {
                method: "POST",
                headers: authHeaders(),
                body: formData,
            });

            if (res.status === 401 || res.status === 403) {
                throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
            }

            if (!res.ok) {
                throw new Error("Upload ảnh thất bại");
            }

            const data = await res.json();
            const paths: string[] = data.imagePaths || data.images || [];

            setUploadedImagePaths(paths);
            addLog(`Upload hoàn tất ${paths.length} ảnh`);

            return paths;
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        previewUrls.forEach((url) => URL.revokeObjectURL(url));

        setImageFiles(files);
        setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
        setUploadedImagePaths([]);

        addLog(`Đã chọn ${files.length} ảnh`);

        if (files.length > 0) {
            try {
                await uploadImages(files);
            } catch (err: any) {
                addLog(err.message || "Upload ảnh lỗi");
                alert(err.message || "Upload ảnh lỗi");
            }
        }
    };

    const removeImage = async (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);

        const nextFiles = imageFiles.filter((_, i) => i !== index);
        const nextPreviewUrls = previewUrls.filter((_, i) => i !== index);

        setImageFiles(nextFiles);
        setPreviewUrls(nextPreviewUrls);
        setUploadedImagePaths([]);

        addLog(`Đã xoá ảnh ${index + 1}`);

        if (nextFiles.length > 0) {
            try {
                await uploadImages(nextFiles);
            } catch (err: any) {
                addLog(err.message || "Upload lại ảnh lỗi");
                alert(err.message || "Upload lại ảnh lỗi");
            }
        }
    };

    const clearImages = () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setImageFiles([]);
        setPreviewUrls([]);
        setUploadedImagePaths([]);
    };

    const createJob = async (imagePaths: string[]) => {
        const res = await fetch(`${API}/api/videos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
            },
            body: JSON.stringify({ productName, affiliateLink, imagePaths }),
        });

        if (res.status === 401 || res.status === 403) {
            throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        }

        if (!res.ok) {
            throw new Error("Tạo job lỗi");
        }

        return (await res.json()) as VideoJob;
    };

    const pollJob = (jobId: string) => {
        const timer = setInterval(async () => {
            try {
                const res = await fetch(`${API}/api/videos/${jobId}`, {
                    headers: authHeaders(),
                });

                if (res.status === 401 || res.status === 403) {
                    throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
                }

                if (!res.ok) {
                    throw new Error("Không lấy được trạng thái job");
                }

                const current = (await res.json()) as VideoJob;
                setJob(current);

                if (current.currentStep) addLog(current.currentStep);

                if (current.status === "DONE") {
                    addLog("Video đã tạo xong");
                    clearInterval(timer);
                    setLoading(false);
                }

                if (current.status === "FAILED") {
                    addLog(current.error || "Tạo video thất bại");
                    clearInterval(timer);
                    setLoading(false);
                }
            } catch (e: any) {
                addLog(e.message || "Polling lỗi");
                clearInterval(timer);
                setLoading(false);
            }
        }, 2000);
    };

    const handleCreateVideo = async () => {
        try {
            if (!productName.trim()) return alert("Nhập tên sản phẩm");
            if (imageFiles.length === 0) return alert("Chọn ít nhất 1 ảnh");
            if (uploading) return alert("Ảnh đang upload, đợi upload xong đã");

            setLoading(true);
            setJob(null);

            let imagePaths = uploadedImagePaths;

            if (imagePaths.length !== imageFiles.length) {
                imagePaths = await uploadImages(imageFiles);
            }

            if (imagePaths.length === 0) {
                throw new Error("Chưa upload được ảnh");
            }

            addLog(`Tạo job video với ${imagePaths.length} ảnh`);

            const createdJob = await createJob(imagePaths);
            setJob(createdJob);

            addLog(`Job ID: ${createdJob.jobId}`);
            pollJob(createdJob.jobId);
        } catch (e: any) {
            addLog(e.message || "Có lỗi xảy ra");
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setAdminLoading(true);
            setAdminMessage("");

            const res = await fetch(`${API}/api/admin/users`, {
                headers: authHeaders(),
            });

            if (!res.ok) {
                throw new Error("Không tải được danh sách user");
            }

            const data = (await res.json()) as UserResponse[];
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

            const res = await fetch(`${API}/api/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                    fullName: newFullName,
                    email: newEmail,
                    roles: [newRole],
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Tạo user thất bại");
            }

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

    const videoSrc = job?.videoUrl ? `${API}${job.videoUrl}` : "";
    const progress = job?.progress ?? 0;
    const currentStep = job?.currentStep || "Đang chờ xử lý";

    if (!token) {
        return (
            <div style={s.loginPage}>
                <div style={s.loginCard}>
                    <div style={s.badge}>TikTok Affiliate Tool</div>
                    <h1 style={s.loginTitle}>Đăng nhập</h1>
                    <p style={s.subtitle}>Đăng nhập để tạo video AI TikTok Affiliate.</p>

                    <label style={s.label}>Tài khoản</label>
                    <input
                        style={s.input}
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="admin"
                    />

                    <label style={s.label}>Mật khẩu</label>
                    <input
                        style={s.input}
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="123456"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleLogin();
                        }}
                    />

                    {loginError && <div style={s.error}>{loginError}</div>}

                    <button
                        disabled={loginLoading}
                        onClick={handleLogin}
                        style={{
                            ...s.button,
                            width: "100%",
                            marginTop: 20,
                            opacity: loginLoading ? 0.6 : 1,
                            cursor: loginLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    <div style={s.loginHint}>Admin mặc định: admin / 123456</div>
                </div>
            </div>
        );
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                <div style={s.header}>
                    <div>
                        <div style={s.badge}>TikTok Affiliate Tool</div>
                        <h1 style={s.title}>AI Video Generator</h1>
                        <p style={s.subtitle}>
                            Xin chào <b>{username}</b> · Role: <b>{roles.join(", ")}</b>
                        </p>
                    </div>

                    <div style={s.headerActions}>
                        <button
                            type="button"
                            onClick={() => setActiveTab("video")}
                            style={{
                                ...s.tabButton,
                                background: activeTab === "video" ? "rgba(236,72,153,0.24)" : "rgba(255,255,255,0.08)",
                            }}
                        >
                            Video
                        </button>

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("admin")}
                                style={{
                                    ...s.tabButton,
                                    background: activeTab === "admin" ? "rgba(236,72,153,0.24)" : "rgba(255,255,255,0.08)",
                                }}
                            >
                                Admin
                            </button>
                        )}

                        <button type="button" onClick={handleLogout} style={s.logoutButton}>
                            Đăng xuất
                        </button>

                        {!isMobile && activeTab === "video" && (
                            <button
                                disabled={loading || uploading}
                                onClick={handleCreateVideo}
                                style={{
                                    ...s.button,
                                    opacity: loading || uploading ? 0.55 : 1,
                                    cursor: loading || uploading ? "not-allowed" : "pointer",
                                }}
                            >
                                {uploading ? "Đang upload ảnh..." : loading ? "Đang tạo..." : "🚀 Generate Video"}
                            </button>
                        )}
                    </div>
                </div>

                {activeTab === "admin" && isAdmin ? (
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
                                                    {user.fullName || "No name"} · {user.email || "No email"}
                                                </div>
                                            </div>
                                            <div style={s.userRoles}>{user.roles.join(", ")}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={s.grid}>
                        <div style={s.card}>
                            <label style={s.label}>Tên sản phẩm</label>
                            <input
                                style={s.input}
                                placeholder="Ví dụ: Áo bóng đá Bồ Đào Nha"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />

                            <label style={s.label}>Link Affiliate</label>
                            <input
                                style={s.input}
                                placeholder="https://..."
                                value={affiliateLink}
                                onChange={(e) => setAffiliateLink(e.target.value)}
                            />

                            <label style={s.label}>Ảnh sản phẩm</label>
                            <label style={s.uploadBox}>
                                <div style={{ fontSize: isMobile ? 28 : 34 }}>📸</div>
                                <div style={{ fontWeight: 800, marginTop: 8 }}>Chọn nhiều ảnh</div>
                                <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                                    PNG, JPG, WEBP
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </label>

                            {previewUrls.length > 0 && (
                                <div style={{ marginTop: 18 }}>
                                    <div style={s.previewHeader}>
                                        <span>Preview ảnh</span>
                                        <div style={s.previewActions}>
                                            <span style={s.count}>{previewUrls.length} ảnh</span>
                                            <span
                                                style={{
                                                    ...s.count,
                                                    background:
                                                        uploadedImagePaths.length === previewUrls.length
                                                            ? "rgba(34,197,94,0.12)"
                                                            : "rgba(249,115,22,0.12)",
                                                    color:
                                                        uploadedImagePaths.length === previewUrls.length
                                                            ? "#86efac"
                                                            : "#fdba74",
                                                }}
                                            >
                                                {uploading ? "Đang upload..." : `Đã upload ${uploadedImagePaths.length}`}
                                            </span>
                                            <button type="button" onClick={clearImages} style={s.clearButton}>
                                                Xoá tất cả
                                            </button>
                                        </div>
                                    </div>

                                    <div style={s.previewGrid}>
                                        {previewUrls.map((url, index) => (
                                            <div key={url} style={s.thumb}>
                                                <img src={url} style={s.thumbImg} />
                                                <div style={s.index}>{index + 1}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    style={s.removeButton}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isMobile && (
                                <button
                                    disabled={loading || uploading}
                                    onClick={handleCreateVideo}
                                    style={{
                                        ...s.button,
                                        width: "100%",
                                        marginTop: 18,
                                        opacity: loading || uploading ? 0.55 : 1,
                                        cursor: loading || uploading ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {uploading ? "Đang upload ảnh..." : loading ? "Đang tạo..." : "🚀 Generate Video"}
                                </button>
                            )}

                            {job && (
                                <div style={s.jobBox}>
                                    <div style={s.small}>Job ID</div>
                                    <div style={s.jobId}>{job.jobId}</div>

                                    <div style={s.progressHeader}>
                                        <span>{currentStep}</span>
                                        <b>{progress}%</b>
                                    </div>

                                    <div style={s.progressBar}>
                                        <div style={{ ...s.progressFill, width: `${progress}%` }} />
                                    </div>

                                    <div style={s.small}>Status</div>
                                    <div
                                        style={{
                                            ...s.status,
                                            color:
                                                job.status === "DONE"
                                                    ? "#22c55e"
                                                    : job.status === "FAILED"
                                                        ? "#ef4444"
                                                        : "#f472b6",
                                        }}
                                    >
                                        {job.status}
                                    </div>

                                    {job.error && <div style={s.error}>{job.error}</div>}
                                </div>
                            )}
                        </div>

                        <div style={s.main}>
                            <div style={s.videoCard}>
                                <div style={s.sectionHeader}>
                                    <h2 style={s.sectionTitle}>Video Preview</h2>
                                    {videoSrc && (
                                        <a href={videoSrc} target="_blank" rel="noreferrer" style={s.link}>
                                            Mở video
                                        </a>
                                    )}
                                </div>

                                {videoSrc ? (
                                    <video controls autoPlay src={videoSrc} style={s.video} />
                                ) : (
                                    <div style={s.emptyVideo}>Video sẽ hiển thị ở đây</div>
                                )}
                            </div>

                            <div style={s.sideGrid}>
                                <div style={s.panel}>
                                    <h3 style={s.panelTitle}>Script</h3>
                                    <div style={s.script}>{job?.script || "Chưa có script"}</div>
                                </div>

                                <div style={s.panel}>
                                    <h3 style={s.panelTitle}>Logs</h3>
                                    <div style={s.logBox}>
                                        {logs.length === 0
                                            ? "Chưa có log"
                                            : logs.map((item, i) => <div key={i}>{item}</div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
    const card = cardStyle(isMobile);

    return {
        loginPage: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
                "radial-gradient(circle at top left, rgba(236,72,153,0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(249,115,22,0.18), transparent 32%), #070711",
            color: "white",
            fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
            padding: 18,
            boxSizing: "border-box",
        },
        loginCard: {
            width: "100%",
            maxWidth: 440,
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 28,
            padding: isMobile ? 22 : 30,
            boxShadow: "0 30px 90px rgba(0,0,0,0.42)",
            boxSizing: "border-box",
        },
        loginTitle: {
            margin: "8px 0 0",
            fontSize: 42,
            lineHeight: 1,
            fontWeight: 950,
            letterSpacing: -1.5,
        },
        loginHint: {
            marginTop: 16,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 13,
        },
        page: {
            minHeight: "100vh",
            width: "100%",
            overflowX: "hidden",
            background:
                "radial-gradient(circle at top left, rgba(236,72,153,0.18), transparent 30%), #070711",
            color: "white",
            fontFamily:
                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
        container: {
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            padding: isMobile ? "18px 14px 32px" : "32px 24px",
            boxSizing: "border-box",
        },
        header: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: isMobile ? 16 : 24,
            alignItems: isMobile ? "stretch" : "flex-end",
            marginBottom: isMobile ? 18 : 28,
        },
        headerActions: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: isMobile ? "space-between" : "flex-end",
        },
        tabButton: {
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: "13px 18px",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
        },
        badge: {
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(236,72,153,0.12)",
            border: "1px solid rgba(236,72,153,0.35)",
            color: "#f9a8d4",
            fontSize: 13,
            marginBottom: 12,
        },
        title: {
            margin: 0,
            fontSize: isMobile ? 36 : 56,
            lineHeight: 1,
            fontWeight: 950,
            letterSpacing: isMobile ? -1 : -2,
        },
        subtitle: {
            marginTop: 12,
            color: "#94a3b8",
            fontSize: isMobile ? 15 : 18,
            lineHeight: 1.5,
        },
        button: {
            border: 0,
            borderRadius: 18,
            padding: "15px 22px",
            background: "linear-gradient(90deg,#db2777,#f97316)",
            color: "white",
            fontWeight: 900,
            fontSize: 16,
            boxShadow: "0 20px 50px rgba(219,39,119,0.25)",
        },
        logoutButton: {
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
        },
        grid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "420px 1fr",
            gap: isMobile ? 18 : 24,
            alignItems: "start",
            width: "100%",
        },
        adminGrid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "420px 1fr",
            gap: 24,
            alignItems: "start",
        },
        card,
        main: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
            gap: isMobile ? 18 : 24,
            minWidth: 0,
        },
        videoCard: card,
        panel: card,
        label: {
            display: "block",
            color: "#94a3b8",
            fontSize: 13,
            marginBottom: 8,
            marginTop: 14,
        },
        input: {
            width: "100%",
            height: 48,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#020617",
            color: "white",
            padding: "0 14px",
            outline: "none",
            fontSize: 16,
            boxSizing: "border-box",
        },
        uploadBox: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: isMobile ? 118 : 130,
            borderRadius: 22,
            border: "2px dashed rgba(255,255,255,0.12)",
            background: "#020617",
            cursor: "pointer",
        },
        previewHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#94a3b8",
            fontSize: 13,
            marginBottom: 10,
            gap: 10,
            flexWrap: "wrap",
        },
        previewActions: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
        },
        count: {
            background: "rgba(236,72,153,0.12)",
            color: "#f9a8d4",
            borderRadius: 999,
            padding: "2px 10px",
        },
        clearButton: {
            border: 0,
            borderRadius: 999,
            padding: "4px 10px",
            background: "rgba(239,68,68,0.15)",
            color: "#fecaca",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
        },
        previewGrid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(4, minmax(0, 1fr))" : "repeat(4, 1fr)",
            gap: 8,
        },
        thumb: {
            aspectRatio: "1/1",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "black",
            position: "relative",
            minWidth: 0,
        },
        thumbImg: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
        },
        index: {
            position: "absolute",
            top: 5,
            left: 5,
            background: "rgba(0,0,0,0.7)",
            borderRadius: 999,
            padding: "2px 7px",
            fontSize: 11,
        },
        removeButton: {
            position: "absolute",
            top: 5,
            right: 5,
            width: 24,
            height: 24,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.75)",
            color: "white",
            fontSize: 18,
            lineHeight: "20px",
            cursor: "pointer",
        },
        jobBox: {
            marginTop: 18,
            background: "#020617",
            borderRadius: 18,
            padding: 14,
            border: "1px solid rgba(255,255,255,0.08)",
        },
        small: {
            color: "#64748b",
            fontSize: 12,
            textAlign: "center",
        },
        jobId: {
            fontSize: 13,
            wordBreak: "break-all",
            marginBottom: 10,
            textAlign: "center",
        },
        progressHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#cbd5e1",
            fontSize: 13,
            marginTop: 14,
            marginBottom: 8,
            gap: 12,
        },
        progressBar: {
            width: "100%",
            height: 10,
            borderRadius: 999,
            background: "#1e293b",
            overflow: "hidden",
            marginBottom: 14,
        },
        progressFill: {
            height: "100%",
            borderRadius: 999,
            background: "linear-gradient(90deg,#22c55e,#06b6d4)",
            transition: "width 0.35s ease",
        },
        status: {
            fontWeight: 900,
            fontSize: 22,
            textAlign: "center",
        },
        error: {
            marginTop: 10,
            color: "#fecaca",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            padding: 10,
            borderRadius: 12,
            fontSize: 13,
        },
        adminMessage: {
            marginTop: 14,
            color: "#bfdbfe",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.22)",
            padding: 10,
            borderRadius: 12,
            fontSize: 13,
        },
        sectionHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
        },
        sectionTitle: {
            margin: 0,
            fontSize: isMobile ? 22 : 24,
        },
        link: {
            color: "white",
            textDecoration: "none",
            background: "rgba(255,255,255,0.1)",
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: 13,
            flexShrink: 0,
        },
        video: {
            width: "100%",
            maxHeight: isMobile ? 560 : 760,
            borderRadius: 22,
            background: "black",
            display: "block",
        },
        emptyVideo: {
            height: isMobile ? 180 : 260,
            borderRadius: 22,
            border: "1px dashed rgba(255,255,255,0.12)",
            background: "#020617",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            textAlign: "center",
            padding: 20,
            boxSizing: "border-box",
        },
        sideGrid: {
            display: "grid",
            gap: isMobile ? 18 : 24,
            minWidth: 0,
        },
        panelTitle: {
            margin: "0 0 12px",
            fontSize: 18,
            textAlign: "center",
        },
        script: {
            background: "#020617",
            borderRadius: 16,
            padding: 14,
            color: "#cbd5e1",
            minHeight: isMobile ? 120 : 180,
            maxHeight: isMobile ? 220 : 260,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            boxSizing: "border-box",
        },
        logBox: {
            background: "#000",
            borderRadius: 16,
            padding: 14,
            color: "#4ade80",
            height: isMobile ? 180 : 260,
            overflow: "auto",
            fontFamily: "monospace",
            fontSize: 12,
            lineHeight: 1.6,
            boxSizing: "border-box",
        },
        userList: {
            display: "grid",
            gap: 12,
        },
        userItem: {
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            padding: 14,
            borderRadius: 16,
            background: "#020617",
            border: "1px solid rgba(255,255,255,0.08)",
        },
        userName: {
            fontWeight: 900,
            fontSize: 16,
        },
        userSub: {
            color: "#94a3b8",
            fontSize: 13,
            marginTop: 4,
        },
        userRoles: {
            color: "#f9a8d4",
            fontWeight: 900,
            fontSize: 13,
            whiteSpace: "nowrap",
        },
    };
}

function cardStyle(isMobile: boolean): React.CSSProperties {
    return {
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: isMobile ? 22 : 28,
        padding: isMobile ? 16 : 22,
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
    };
}

export default App;
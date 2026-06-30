import { useState } from "react";
import { loginApi } from "../api/authApi";
import { saveAuth } from "../utils/storage";
import type { LoginResponse } from "../types/auth";
import type React from "react";

type Props = {
    isMobile: boolean;
    styles: Record<string, React.CSSProperties>;
    onLoginSuccess: (data: LoginResponse) => void;
};

export default function LoginPage({ styles: s, onLoginSuccess }: Props) {
    const [loginUsername, setLoginUsername] = useState("admin");
    const [loginPassword, setLoginPassword] = useState("123456");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const handleLogin = async () => {
        try {
            setLoginLoading(true);
            setLoginError("");

            const data = await loginApi(loginUsername, loginPassword);

            saveAuth(data.token, data.username, data.roles || []);
            onLoginSuccess(data);
        } catch (e: any) {
            setLoginError(e.message || "Đăng nhập thất bại");
        } finally {
            setLoginLoading(false);
        }
    };

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
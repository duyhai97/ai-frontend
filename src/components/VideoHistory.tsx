import { useEffect, useState } from "react";
import { API } from "../api/config";
import { getVideoHistoryApi } from "../api/videoApi";
import type { VideoJob } from "../types/video";
import type React from "react";

type Props = {
    token: string;
    styles: Record<string, React.CSSProperties>;
};

export default function VideoHistory({ token, styles: s }: Props) {
    const [videos, setVideos] = useState<VideoJob[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const loadHistory = async () => {
        try {
            setLoading(true);
            setMessage("");

            const data = await getVideoHistoryApi(token, page, size);

            setVideos(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (e: any) {
            setMessage(e.message || "Lỗi tải lịch sử video");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [page]);

    return (
        <div style={s.card}>
            <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Lịch sử video</h2>

                <button onClick={loadHistory} style={s.logoutButton}>
                    Refresh
                </button>
            </div>

            {message && <div style={s.error}>{message}</div>}

            {loading ? (
                <div style={s.emptyVideo}>Đang tải...</div>
            ) : videos.length === 0 ? (
                <div style={s.emptyVideo}>Chưa có video nào</div>
            ) : (
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            tableLayout: "fixed",
                        }}
                    >
                        <thead>
                        <tr>
                            <Th label="Sản phẩm" width="22%" />
                            <Th label="Người tạo" width="14%" />
                            <Th label="Ngày tạo" width="22%" />
                            <Th label="Status" width="12%" />
                            <Th label="Progress" width="12%" />
                            <Th label="Video" width="18%" />
                        </tr>
                        </thead>

                        <tbody>
                        {videos.map((item) => {
                            const videoUrl = buildVideoUrl(item.videoUrl);

                            return (
                                <tr key={item.jobId}>
                                    <Td>{item.productName || "-"}</Td>
                                    <Td>{item.createdBy || "-"}</Td>
                                    <Td>{formatDate(item.createdAt)}</Td>
                                    <Td>
                                            <span style={statusStyle(item.status)}>
                                                {item.status}
                                            </span>
                                    </Td>
                                    <Td>{item.progress ?? 0}%</Td>
                                    <Td>
                                        {videoUrl ? (
                                            <a
                                                href={videoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={s.link}
                                            >
                                                Xem video
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </Td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            <div
                style={{
                    marginTop: 18,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 14,
                }}
            >
                <button
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{
                        ...s.logoutButton,
                        opacity: page <= 0 ? 0.5 : 1,
                        cursor: page <= 0 ? "not-allowed" : "pointer",
                    }}
                >
                    Previous
                </button>

                <span style={{ color: "#cbd5e1", fontWeight: 800 }}>
                    Page {page + 1} / {Math.max(totalPages, 1)}
                </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                        ...s.logoutButton,
                        opacity: page + 1 >= totalPages ? 0.5 : 1,
                        cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function buildVideoUrl(videoUrl?: string): string {
    if (!videoUrl) return "";

    if (videoUrl.startsWith("http")) {
        return videoUrl;
    }

    if (videoUrl.startsWith("/")) {
        return `${API}${videoUrl}`;
    }

    return `${API}/${videoUrl}`;
}

function Th({ label, width }: { label: string; width: string }) {
    return (
        <th
            style={{
                width,
                textAlign: "left",
                color: "#94a3b8",
                fontSize: 13,
                padding: "12px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td
            style={{
                padding: "16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#e5e7eb",
                fontSize: 14,
                verticalAlign: "middle",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </td>
    );
}

function formatDate(value?: string) {
    if (!value) return "-";

    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch {
        return value;
    }
}

function statusStyle(status: string): React.CSSProperties {
    const color =
        status === "DONE"
            ? "#22c55e"
            : status === "FAILED"
                ? "#ef4444"
                : "#f472b6";

    return {
        color,
        fontWeight: 900,
    };
}
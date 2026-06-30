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
                            textAlign: "left",
                        }}
                    >
                        <colgroup>
                            <col style={{ width: "22%" }} />
                            <col style={{ width: "14%" }} />
                            <col style={{ width: "22%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "18%" }} />
                        </colgroup>

                        <thead>
                        <tr>
                            <Th label="Sản phẩm" />
                            <Th label="Người tạo" />
                            <Th label="Ngày tạo" />
                            <Th label="Status" />
                            <Th label="Progress" />
                            <Th label="Video" />
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
                                                style={videoButtonStyle}
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

            <div style={paginationStyle}>
                <button
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{
                        ...s.logoutButton,
                        opacity: page <= 0 ? 0.45 : 1,
                        cursor: page <= 0 ? "not-allowed" : "pointer",
                    }}
                >
                    Previous
                </button>

                <span style={pageTextStyle}>
                    Page {page + 1} / {Math.max(totalPages, 1)}
                </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                        ...s.logoutButton,
                        opacity: page + 1 >= totalPages ? 0.45 : 1,
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

function Th({ label }: { label: string }) {
    return (
        <th
            style={{
                textAlign: "left",
                color: "#94a3b8",
                fontSize: 13,
                padding: "12px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
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
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#e5e7eb",
                fontSize: 14,
                verticalAlign: "middle",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left",
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
        textAlign: "left",
    };
}

const videoButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    padding: "8px 16px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontWeight: 800,
    textDecoration: "none",
};

const paginationStyle: React.CSSProperties = {
    marginTop: 22,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
};

const pageTextStyle: React.CSSProperties = {
    color: "#e5e7eb",
    fontWeight: 900,
    fontSize: 18,
};
import { useEffect, useState } from "react";
import { API } from "../api/config";
import { getVideoHistoryApi } from "../api/videoApi";
import type { VideoJob } from "../types/video";

type Props = {
    token: string;
    styles: Record<string, React.CSSProperties>;
};

export default function VideoHistory({ token }: Props) {
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
        <div style={card}>
            <div style={header}>
                <h2 style={{ margin: 0 }}>Lịch sử video</h2>

                <button onClick={loadHistory} style={button}>
                    Refresh
                </button>
            </div>

            {message && <div style={errorBox}>{message}</div>}

            {loading ? (
                <div style={empty}>Đang tải...</div>
            ) : videos.length === 0 ? (
                <div style={empty}>Chưa có video nào</div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table style={table}>
                        <thead>
                        <tr>
                            <th style={th}>Sản phẩm</th>
                            <th style={th}>Người tạo</th>
                            <th style={th}>Ngày tạo</th>
                            <th style={th}>Status</th>
                            <th style={th}>Progress</th>
                            <th style={th}>Video</th>
                        </tr>
                        </thead>

                        <tbody>
                        {videos.map((item) => {
                            const videoUrl = item.videoUrl ? `${API}${item.videoUrl}` : "";

                            return (
                                <tr key={item.jobId}>
                                    <td style={td}>{item.productName || "-"}</td>
                                    <td style={td}>{item.createdBy || "-"}</td>
                                    <td style={td}>
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                                            : "-"}
                                    </td>
                                    <td style={td}>
                                        <span style={statusBadge(item.status)}>{item.status}</span>
                                    </td>
                                    <td style={td}>{item.progress ?? 0}%</td>
                                    <td style={td}>
                                        {videoUrl ? (
                                            <a href={videoUrl} target="_blank" rel="noreferrer" style={link}>
                                                Xem video
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={pagination}>
                <button
                    disabled={page <= 0}
                    onClick={() => setPage((p) => p - 1)}
                    style={button}
                >
                    Previous
                </button>

                <span>
          Page {page + 1} / {Math.max(totalPages, 1)}
        </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={button}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 28,
    padding: 22,
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
};

const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
};

const table: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 820,
};

const th: React.CSSProperties = {
    textAlign: "left",
    color: "#94a3b8",
    fontSize: 13,
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
};

const td: React.CSSProperties = {
    padding: "14px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    fontSize: 14,
};

const button: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "10px 14px",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
};

const empty: React.CSSProperties = {
    height: 180,
    borderRadius: 22,
    border: "1px dashed rgba(255,255,255,0.12)",
    background: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
};

const pagination: React.CSSProperties = {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
};

const link: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
    background: "rgba(236,72,153,0.18)",
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
};

const errorBox: React.CSSProperties = {
    marginBottom: 14,
    color: "#fecaca",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    padding: 10,
    borderRadius: 12,
    fontSize: 13,
};

function statusBadge(status: string): React.CSSProperties {
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
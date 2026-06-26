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

function App() {
    const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [productName, setProductName] = useState("");
    const [affiliateLink, setAffiliateLink] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [job, setJob] = useState<VideoJob | null>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

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

    const s = getStyles(isMobile);

    const addLog = (msg: string) => {
        setLogs((old) => [`${new Date().toLocaleTimeString()} - ${msg}`, ...old]);
    };

    const uploadImages = async (files: File[]) => {
        if (files.length === 0) {
            return [];
        }

        setUploading(true);
        addLog(`Bắt đầu upload ${files.length} ảnh`);

        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await fetch(`${API}/api/videos/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload ảnh thất bại");
            }

            const data = await res.json();

            const paths: string[] = data.imagePaths || data.images || [];

            if (paths.length !== files.length) {
                addLog(`Cảnh báo: chọn ${files.length} ảnh nhưng backend trả ${paths.length} ảnh`);
            }

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
        addLog("Đã xoá toàn bộ ảnh");
    };

    const createJob = async (imagePaths: string[]) => {
        const res = await fetch(`${API}/api/videos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productName, affiliateLink, imagePaths }),
        });

        if (!res.ok) {
            throw new Error("Tạo job lỗi");
        }

        return (await res.json()) as VideoJob;
    };

    const pollJob = (jobId: string) => {
        const timer = setInterval(async () => {
            try {
                const res = await fetch(`${API}/api/videos/${jobId}`);

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

    const videoSrc = job?.videoUrl ? `${API}${job.videoUrl}` : "";
    const progress = job?.progress ?? 0;
    const currentStep = job?.currentStep || "Đang chờ xử lý";

    return (
        <div style={s.page}>
            <div style={s.container}>
                <div style={s.header}>
                    <div>
                        <div style={s.badge}>TikTok Affiliate Tool</div>
                        <h1 style={s.title}>AI Video Generator</h1>
                        <p style={s.subtitle}>
                            Upload ảnh sản phẩm, AI tạo script, voice và render video tự động.
                        </p>
                    </div>

                    {!isMobile && (
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
                                            {uploading
                                                ? "Đang upload..."
                                                : `Đã upload ${uploadedImagePaths.length}`}
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
            </div>
        </div>
    );
}

function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
    return {
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
        grid: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "420px 1fr",
            gap: isMobile ? 18 : 24,
            alignItems: "start",
            width: "100%",
        },
        card: cardStyle(isMobile),
        main: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
            gap: isMobile ? 18 : 24,
            minWidth: 0,
        },
        videoCard: cardStyle(isMobile),
        panel: cardStyle(isMobile),
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
            height: isMobile ? 380 : 640,
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
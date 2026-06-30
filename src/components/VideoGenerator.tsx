import { useState } from "react";
import { API } from "../api/config";
import { useUpload } from "../hooks/useUpload";
import { useVideoJob } from "../hooks/useVideoJob";
import ProgressPanel from "./ProgressPanel";
import type React from "react";

type Props = {
    token: string;
    isMobile: boolean;
    styles: Record<string, React.CSSProperties>;
    onStateChange?: (state: { loading: boolean; uploading: boolean; createVideo: () => void }) => void;
};

export default function VideoGenerator({
                                           token,
                                           isMobile,
                                           styles: s,
                                           onStateChange,
                                       }: Props) {
    const [productName, setProductName] = useState("");
    const [affiliateLink, setAffiliateLink] = useState("");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs((old) => [`${new Date().toLocaleTimeString()} - ${msg}`, ...old]);
    };

    const {
        imageFiles,
        previewUrls,
        uploadedImagePaths,
        uploading,
        uploadImages,
        handleFileChange,
        removeImage,
        clearImages,
    } = useUpload(token, addLog);

    const { job, loading, setLoading, createJob } = useVideoJob(token, addLog);

    const handleCreateVideo = async () => {
        try {
            if (!productName.trim()) return alert("Nhập tên sản phẩm");
            if (imageFiles.length === 0) return alert("Chọn ít nhất 1 ảnh");
            if (uploading) return alert("Ảnh đang upload, đợi upload xong đã");

            let imagePaths = uploadedImagePaths;

            if (imagePaths.length !== imageFiles.length) {
                imagePaths = await uploadImages(imageFiles);
            }

            if (imagePaths.length === 0) {
                throw new Error("Chưa upload được ảnh");
            }

            await createJob(productName, affiliateLink, imagePaths);
        } catch (e: any) {
            addLog(e.message || "Có lỗi xảy ra");
            setLoading(false);
        }
    };

    if (onStateChange) {
        onStateChange({
            loading,
            uploading,
            createVideo: handleCreateVideo,
        });
    }

    const videoSrc = job?.videoUrl ? `${API}${job.videoUrl}` : "";

    return (
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

                                <button
                                    type="button"
                                    onClick={clearImages}
                                    style={s.clearButton}
                                >
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
                        {uploading
                            ? "Đang upload ảnh..."
                            : loading
                                ? "Đang tạo..."
                                : "🚀 Generate Video"}
                    </button>
                )}

                <ProgressPanel job={job} styles={s} />
            </div>

            <div style={s.main}>
                <div style={s.videoCard}>
                    <div style={s.sectionHeader}>
                        <h2 style={s.sectionTitle}>Video Preview</h2>

                        {videoSrc && (
                            <a
                                href={videoSrc}
                                target="_blank"
                                rel="noreferrer"
                                style={s.link}
                            >
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
    );
}
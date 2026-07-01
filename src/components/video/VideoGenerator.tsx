import { API } from "../../api/config.ts";
import { useVideoCreator } from "../../hooks/video/useVideoCreator.ts";

import ProductForm from "./ProductForm.tsx";
import ProgressPanel from "./ProgressPanel.tsx";
import QuotaBox from "./QuotaBox.tsx";

import type React from "react";

type Props = {
    token: string;
    isMobile: boolean;
    styles: Record<string, React.CSSProperties>;
};

export default function VideoGenerator({
                                           token,
                                           isMobile,
                                           styles: s,
                                       }: Props) {
    const {
        productName,
        setProductName,
        affiliateLink,
        setAffiliateLink,
        style,
        setStyle,
        category,
        setCategory,
        logs,
        quota,
        upload,
        videoJob,
        handleCreateVideo,
    } = useVideoCreator(token);

    const {
        previewUrls,
        uploadedImagePaths,
        uploading,
        handleFileChange,
        removeImage,
        clearImages,
    } = upload;

    const { job, loading } = videoJob;

    const videoSrc = job?.videoUrl ? buildVideoUrl(job.videoUrl) : "";

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "430px 1fr",
                gap: isMobile ? 18 : 24,
                alignItems: "start",
            }}
        >
            <div style={s.card}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 18,
                    }}
                >
                    <div>
                        <h2 style={{ ...s.sectionTitle, marginBottom: 6 }}>
                            Tạo video mới
                        </h2>
                        <div style={{ color: "#94a3b8", fontSize: 13 }}>
                            Upload ảnh sản phẩm, AI sẽ tạo script + voice + video.
                        </div>
                    </div>

                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg, rgba(236,72,153,0.28), rgba(249,115,22,0.20))",
                            border: "1px solid rgba(255,255,255,0.12)",
                            fontSize: 24,
                        }}
                    >
                        🎬
                    </div>
                </div>

                <QuotaBox quota={quota} styles={s} />

                <ProductForm
                    productName={productName}
                    affiliateLink={affiliateLink}
                    style={style}
                    category={category}
                    setProductName={setProductName}
                    setAffiliateLink={setAffiliateLink}
                    setStyle={setStyle}
                    setCategory={setCategory}
                    styles={s}
                />

                <label style={s.label}>Ảnh sản phẩm</label>

                <label
                    style={{
                        ...s.uploadBox,
                        minHeight: isMobile ? 130 : 150,
                        border:
                            previewUrls.length > 0
                                ? "2px dashed rgba(34,197,94,0.35)"
                                : "2px dashed rgba(255,255,255,0.14)",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(2,6,23,1))",
                    }}
                >
                    <div style={{ fontSize: isMobile ? 30 : 38 }}>📸</div>
                    <div style={{ fontWeight: 900, marginTop: 8 }}>
                        Chọn nhiều ảnh
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                        PNG, JPG, WEBP · Nên chọn 4-8 ảnh
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
                            <span style={{ fontWeight: 800 }}>Preview ảnh</span>

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

                        <div
                            style={{
                                ...s.previewGrid,
                                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                            }}
                        >
                            {previewUrls.map((url, index) => (
                                <div
                                    key={url}
                                    style={{
                                        ...s.thumb,
                                        boxShadow:
                                            "0 10px 24px rgba(0,0,0,0.22)",
                                    }}
                                >
                                    <img
                                        src={url}
                                        style={s.thumbImg}
                                        alt={`preview-${index}`}
                                    />

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

                <button
                    disabled={loading || uploading}
                    onClick={handleCreateVideo}
                    style={{
                        ...s.button,
                        width: "100%",
                        marginTop: 20,
                        opacity: loading || uploading ? 0.55 : 1,
                        cursor: loading || uploading ? "not-allowed" : "pointer",
                        height: 54,
                        fontSize: 17,
                    }}
                >
                    {uploading
                        ? "Đang upload ảnh..."
                        : loading
                            ? "Đang tạo video..."
                            : `🚀 Generate Video (${style})`}
                </button>

                <ProgressPanel job={job} styles={s} />
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateRows: "auto auto",
                    gap: isMobile ? 18 : 24,
                    minWidth: 0,
                }}
            >
                <div style={s.videoCard}>
                    <div style={s.sectionHeader}>
                        <div>
                            <h2 style={s.sectionTitle}>Video Preview</h2>
                            <div
                                style={{
                                    color: "#94a3b8",
                                    fontSize: 13,
                                    marginTop: 6,
                                }}
                            >
                                Video sau khi render xong sẽ hiển thị tại đây.
                            </div>
                        </div>

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
                        <video
                            controls
                            autoPlay
                            src={videoSrc}
                            style={{
                                ...s.video,
                                boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                ...s.emptyVideo,
                                minHeight: isMobile ? 240 : 420,
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <div style={{ fontSize: 42 }}>🎞️</div>
                            <div>Video sẽ hiển thị ở đây</div>
                            <div style={{ fontSize: 13, color: "#475569" }}>
                                Sau khi job hoàn tất, bạn có thể mở hoặc tải video.
                            </div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: isMobile ? 18 : 24,
                        minWidth: 0,
                    }}
                >
                    <div style={s.panel}>
                        <h3 style={s.panelTitle}>Script AI</h3>
                        <div
                            style={{
                                ...s.script,
                                minHeight: 220,
                            }}
                        >
                            {job?.script || "Chưa có script"}
                        </div>
                    </div>

                    <div style={s.panel}>
                        <h3 style={s.panelTitle}>Logs</h3>
                        <div
                            style={{
                                ...s.logBox,
                                minHeight: 220,
                            }}
                        >
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

function buildVideoUrl(videoUrl: string): string {
    if (videoUrl.startsWith("http")) return videoUrl;
    if (videoUrl.startsWith("/")) return `${API}${videoUrl}`;
    return `${API}/${videoUrl}`;
}
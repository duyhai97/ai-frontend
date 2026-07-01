import { useEffect, useState } from "react";

import { getVideoQuotaApi } from "../../api/videoApi";
import { useUpload } from "../useUpload";
import { useVideoJob } from "../useVideoJob";

import type {
    VideoCategory,
    VideoQuota,
    VideoStyle,
} from "../../types/video";

export function useVideoCreator(token: string) {
    const [productName, setProductName] = useState("");
    const [affiliateLink, setAffiliateLink] = useState("");
    const [style, setStyle] = useState<VideoStyle>("REVIEW");
    const [category, setCategory] = useState<VideoCategory>("GENERAL");
    const [logs, setLogs] = useState<string[]>([]);
    const [quota, setQuota] = useState<VideoQuota | null>(null);

    const addLog = (msg: string) => {
        setLogs((old) => [`${new Date().toLocaleTimeString()} - ${msg}`, ...old]);
    };

    const upload = useUpload(token, addLog);
    const videoJob = useVideoJob(token, addLog);

    const loadQuota = async () => {
        try {
            const data = await getVideoQuotaApi(token);
            setQuota(data);
        } catch (e: any) {
            addLog(e.message || "Không tải được quota");
        }
    };

    useEffect(() => {
        loadQuota();
    }, []);

    const handleCreateVideo = async () => {
        try {
            if (!productName.trim()) return alert("Nhập tên sản phẩm");
            if (upload.imageFiles.length === 0) return alert("Chọn ít nhất 1 ảnh");
            if (upload.uploading) return alert("Ảnh đang upload, đợi upload xong đã");

            if (quota && quota.dailyLimit !== -1 && quota.remainingToday <= 0) {
                return alert("Bạn đã hết lượt tạo video hôm nay. Vui lòng mua thêm lượt.");
            }

            let imagePaths = upload.uploadedImagePaths;

            if (imagePaths.length !== upload.imageFiles.length) {
                imagePaths = await upload.uploadImages(upload.imageFiles);
            }

            if (imagePaths.length === 0) {
                throw new Error("Chưa upload được ảnh");
            }

            await videoJob.createJob(
                productName,
                affiliateLink,
                imagePaths,
                style,
                category
            );

            await loadQuota();
        } catch (e: any) {
            addLog(e.message || "Có lỗi xảy ra");
            alert(e.message || "Có lỗi xảy ra");
            videoJob.setLoading(false);
            await loadQuota();
        }
    };

    return {
        productName,
        setProductName,

        affiliateLink,
        setAffiliateLink,

        style,
        setStyle,

        category,
        setCategory,

        logs,
        addLog,

        quota,
        loadQuota,

        upload,
        videoJob,

        handleCreateVideo,
    };
}
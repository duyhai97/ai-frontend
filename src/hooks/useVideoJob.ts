import { useState } from "react";
import { createVideoApi, getVideoJobApi } from "../api/videoApi";
import type {
    VideoCategory,
    VideoJob,
    VideoStyle,
} from "../types/video";

export function useVideoJob(token: string, addLog: (msg: string) => void) {
    const [job, setJob] = useState<VideoJob | null>(null);
    const [loading, setLoading] = useState(false);

    const pollJob = (jobId: string) => {
        const timer = setInterval(async () => {
            try {
                const current = await getVideoJobApi(token, jobId);
                setJob(current);

                if (current.currentStep) {
                    addLog(current.currentStep);
                }

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

    const createJob = async (
        productName: string,
        affiliateLink: string,
        imagePaths: string[],
        style: VideoStyle = "REVIEW",
        category: VideoCategory = "GENERAL"
    ) => {
        setLoading(true);
        setJob(null);

        addLog(`Tạo job video với ${imagePaths.length} ảnh`);
        addLog(`Style: ${style} · Category: ${category}`);

        const createdJob = await createVideoApi(
            token,
            productName,
            affiliateLink,
            imagePaths,
            style,
            category
        );

        setJob(createdJob);
        addLog(`Job ID: ${createdJob.jobId}`);

        pollJob(createdJob.jobId);

        return createdJob;
    };

    const resetJob = () => {
        setJob(null);
        setLoading(false);
    };

    return {
        job,
        loading,
        setLoading,
        createJob,
        resetJob,
    };
}
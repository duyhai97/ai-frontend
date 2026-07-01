import type React from "react";
import type { VideoJob } from "../../types/video.ts";

type Props = {
    job: VideoJob | null;
    styles: Record<string, React.CSSProperties>;
};

export default function ProgressPanel({
                                          job,
                                          styles: s,
                                      }: Props) {
    if (!job) return null;

    const progress = job.progress ?? 0;
    const currentStep = job.currentStep || "Đang chờ xử lý";

    return (
        <div style={s.jobBox}>
            <div style={s.small}>Job ID</div>
            <div style={s.jobId}>{job.jobId}</div>

            <div style={s.progressHeader}>
                <span>{currentStep}</span>
                <b>{progress}%</b>
            </div>

            <div style={s.progressBar}>
                <div
                    style={{
                        ...s.progressFill,
                        width: `${progress}%`,
                    }}
                />
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

            {job.error && (
                <div style={s.error}>
                    {job.error}
                </div>
            )}
        </div>
    );
}
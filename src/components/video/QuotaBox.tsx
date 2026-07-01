import type React from "react";
import type { VideoQuota } from "../../types/video.ts";

type Props = {
    quota: VideoQuota | null;
    styles: Record<string, React.CSSProperties>;
};

export default function QuotaBox({ quota, styles: s }: Props) {
    if (!quota) {
        return (
            <div style={s.jobBox}>
                <div style={s.small}>Quota hôm nay</div>
                <div style={s.status}>Đang tải...</div>
            </div>
        );
    }

    if (quota.dailyLimit === -1) {
        return (
            <div style={s.jobBox}>
                <div style={s.small}>Quota hôm nay</div>
                <div style={s.status}>Không giới hạn</div>
            </div>
        );
    }

    return (
        <div style={s.jobBox}>
            <div style={s.small}>Quota hôm nay</div>

            <div style={s.status}>
                Còn {quota.remainingToday}/{quota.totalToday}
            </div>

            <div style={s.progressHeader}>
                <span>Đã dùng</span>
                <b>{quota.usedToday}</b>
            </div>

            <div style={s.progressHeader}>
                <span>Miễn phí/ngày</span>
                <b>{quota.dailyLimit}</b>
            </div>

            <div style={s.progressHeader}>
                <span>Mua thêm</span>
                <b>{quota.extraToday}</b>
            </div>
        </div>
    );
}
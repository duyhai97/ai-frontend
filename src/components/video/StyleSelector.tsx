import type { CSSProperties } from "react";
import type { VideoCategory, VideoStyle } from "../../types/video";

type Props = {
    style: VideoStyle;
    category: VideoCategory;
    onStyleChange: (v: VideoStyle) => void;
    onCategoryChange: (v: VideoCategory) => void;
    styles: Record<string, CSSProperties>;
};

const styles: { value: VideoStyle; label: string }[] = [
    { value: "VIRAL", label: "🔥 Viral" },
    { value: "REVIEW", label: "⭐ Review" },
    { value: "STORY", label: "📖 Story" },
    { value: "EXPERT", label: "🎓 Expert" },
    { value: "EMOTIONAL", label: "❤️ Emotional" },
    { value: "LIVESTREAM", label: "🛒 Livestream" },
];

const categories: { value: VideoCategory; label: string }[] = [
    { value: "GENERAL", label: "Chung" },
    { value: "HOME", label: "Gia dụng" },
    { value: "FASHION", label: "Thời trang" },
    { value: "BEAUTY", label: "Làm đẹp" },
    { value: "BABY", label: "Mẹ & Bé" },
    { value: "FOOD", label: "Thực phẩm" },
    { value: "ELECTRONICS", label: "Điện tử" },
    { value: "SPORT", label: "Thể thao" },
    { value: "BOOK", label: "Sách" },
    { value: "PET", label: "Thú cưng" },
];

export default function StyleSelector({
                                          style,
                                          category,
                                          onStyleChange,
                                          onCategoryChange,
                                          styles: s,
                                      }: Props) {
    return (
        <>
            <label style={s.label}>Phong cách</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {styles.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onStyleChange(item.value)}
                        style={{
                            padding: 12,
                            borderRadius: 14,
                            color: "#fff",
                            cursor: "pointer",
                            border:
                                style === item.value
                                    ? "2px solid #22c55e"
                                    : "1px solid rgba(255,255,255,.12)",
                            background:
                                style === item.value
                                    ? "rgba(34,197,94,.14)"
                                    : "rgba(255,255,255,.04)",
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <label style={s.label}>Ngành hàng</label>
            <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as VideoCategory)}
                style={s.input}
            >
                {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
        </>
    );
}
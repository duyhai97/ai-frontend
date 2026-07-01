import type React from "react";
import StyleSelector from "./StyleSelector";
import type { VideoCategory, VideoStyle } from "../../types/video";

type Props = {
    productName: string;
    affiliateLink: string;
    style: VideoStyle;
    category: VideoCategory;
    setProductName: (v: string) => void;
    setAffiliateLink: (v: string) => void;
    setStyle: (v: VideoStyle) => void;
    setCategory: (v: VideoCategory) => void;
    styles: Record<string, React.CSSProperties>;
};

export default function ProductForm({
                                        productName,
                                        affiliateLink,
                                        style,
                                        category,
                                        setProductName,
                                        setAffiliateLink,
                                        setStyle,
                                        setCategory,
                                        styles: s,
                                    }: Props) {
    return (
        <>
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

            <StyleSelector
                style={style}
                category={category}
                onStyleChange={setStyle}
                onCategoryChange={setCategory}
                styles={s}
            />
        </>
    );
}
import { useEffect, useState } from "react";
import {
    generateVideo10QrApi,
    getMyPurchaseQrApi,
    getMyPurchasesApi,
} from "../api/purchaseApi";
import type { PurchaseOrder, PurchaseQrResponse } from "../types/purchase";
import type React from "react";

type Props = {
    token: string;
    styles: Record<string, React.CSSProperties>;
};

export default function MyPurchases({ token, styles: s }: Props) {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [qr, setQr] = useState<PurchaseQrResponse | null>(null);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            setMessage("");

            const data = await getMyPurchasesApi(token, page, size);

            setOrders(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (e: any) {
            setMessage(e.message || "Lỗi tải lịch sử mua");
        } finally {
            setLoading(false);
        }
    };

    const buyVideo10 = async () => {
        try {
            setLoading(true);
            setMessage("");

            const data = await generateVideo10QrApi(token);
            setQr(data);
            setMessage("Đã tạo QR. Vui lòng chuyển khoản đúng nội dung.");

            await loadOrders();
        } catch (e: any) {
            setMessage(e.message || "Tạo QR thất bại");
        } finally {
            setLoading(false);
        }
    };

    const openQr = async (orderId: string) => {
        try {
            setLoading(true);
            const data = await getMyPurchaseQrApi(token, orderId);
            setQr(data);
        } catch (e: any) {
            setMessage(e.message || "Không lấy được QR");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [page]);

    return (
        <div style={s.card}>
            <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Lịch sử mua lượt</h2>

                <button onClick={buyVideo10} style={s.button}>
                    Mua thêm 10 video
                </button>
            </div>

            {message && <div style={s.adminMessage}>{message}</div>}

            {qr && (
                <div
                    style={{
                        marginBottom: 20,
                        padding: 18,
                        borderRadius: 20,
                        background: "#020617",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "grid",
                        gridTemplateColumns: "220px 1fr",
                        gap: 18,
                        alignItems: "center",
                    }}
                >
                    <img
                        src={qr.qrUrl}
                        alt="QR thanh toán"
                        style={{
                            width: 220,
                            height: 220,
                            borderRadius: 16,
                            background: "white",
                        }}
                    />

                    <div style={{ color: "#cbd5e1", lineHeight: 1.8 }}>
                        <div><b>Gói:</b> {qr.packageCode}</div>
                        <div><b>Cộng thêm:</b> {qr.extraVideos} video</div>
                        <div><b>Số tiền:</b> {formatMoney(qr.amount)}</div>
                        <div><b>Nội dung CK:</b> {qr.transferContent}</div>

                        <button
                            onClick={() => setQr(null)}
                            style={{ ...s.logoutButton, marginTop: 12 }}
                        >
                            Đóng QR
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={s.emptyVideo}>Đang tải...</div>
            ) : orders.length === 0 ? (
                <div style={s.emptyVideo}>Chưa có đơn mua</div>
            ) : (
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            tableLayout: "fixed",
                        }}
                    >
                        <thead>
                        <tr>
                            <Th label="Gói" width="14%" />
                            <Th label="Video" width="10%" />
                            <Th label="Tiền" width="14%" />
                            <Th label="Nội dung CK" width="26%" />
                            <Th label="Status" width="14%" />
                            <Th label="Ngày tạo" width="14%" />
                            <Th label="Action" width="14%" />
                        </tr>
                        </thead>

                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <Td>{order.packageCode}</Td>
                                <Td>+{order.extraVideos}</Td>
                                <Td>{formatMoney(order.amount)}</Td>
                                <Td>{order.transferContent}</Td>
                                <Td>
                                        <span style={statusStyle(order.status)}>
                                            {order.status}
                                        </span>
                                </Td>
                                <Td>{formatDate(order.createdAt)}</Td>
                                <Td>
                                    {order.status === "PENDING" ? (
                                        <button
                                            onClick={() => openQr(order.id)}
                                            style={s.logoutButton}
                                        >
                                            Xem QR
                                        </button>
                                    ) : (
                                        "Đã thanh toán"
                                    )}
                                </Td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div
                style={{
                    marginTop: 18,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 14,
                }}
            >
                <button
                    disabled={page <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{ ...s.logoutButton, opacity: page <= 0 ? 0.5 : 1 }}
                >
                    Previous
                </button>

                <span style={{ color: "#cbd5e1", fontWeight: 800 }}>
                    Page {page + 1} / {Math.max(totalPages, 1)}
                </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                        ...s.logoutButton,
                        opacity: page + 1 >= totalPages ? 0.5 : 1,
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function Th({ label, width }: { label: string; width: string }) {
    return (
        <th
            style={{
                width,
                textAlign: "left",
                color: "#94a3b8",
                fontSize: 13,
                padding: "12px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return (
        <td
            style={{
                padding: "16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#e5e7eb",
                fontSize: 14,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </td>
    );
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatDate(value?: string) {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
}

function statusStyle(status: string): React.CSSProperties {
    const color =
        status === "PAID"
            ? "#22c55e"
            : status === "CANCELLED"
                ? "#ef4444"
                : "#f472b6";

    return {
        color,
        fontWeight: 900,
    };
}
import { useEffect, useState } from "react";
import { getAdminPurchasesApi, markPurchasePaidApi } from "../api/purchaseApi";
import type { PurchaseOrder } from "../types/purchase";
import type React from "react";

type Props = {
    token: string;
    styles: Record<string, React.CSSProperties>;
};

export default function AdminPurchases({ token, styles: s }: Props) {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [status, setStatus] = useState("PENDING");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            setMessage("");

            const data = await getAdminPurchasesApi(token, page, size, status || undefined);

            setOrders(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (e: any) {
            setMessage(e.message || "Lỗi tải đơn mua");
        } finally {
            setLoading(false);
        }
    };

    const markPaid = async (orderId: string) => {
        if (!confirm("Xác nhận đơn này đã thanh toán?")) return;

        try {
            setLoading(true);
            await markPurchasePaidApi(token, orderId);
            setMessage("Đã duyệt đơn thành công");
            await loadOrders();
        } catch (e: any) {
            setMessage(e.message || "Duyệt đơn thất bại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [page, status]);

    return (
        <div style={s.card}>
            <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Danh sách đơn mua</h2>

                <div style={{ display: "flex", gap: 10 }}>
                    <select
                        style={s.input}
                        value={status}
                        onChange={(e) => {
                            setPage(0);
                            setStatus(e.target.value);
                        }}
                    >
                        <option value="">Tất cả</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <button onClick={loadOrders} style={s.logoutButton}>
                        Refresh
                    </button>
                </div>
            </div>

            {message && <div style={s.adminMessage}>{message}</div>}

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
                            <Th label="User" width="12%" />
                            <Th label="Gói" width="12%" />
                            <Th label="Video" width="10%" />
                            <Th label="Tiền" width="12%" />
                            <Th label="Nội dung CK" width="24%" />
                            <Th label="Status" width="12%" />
                            <Th label="Action" width="18%" />
                        </tr>
                        </thead>

                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <Td>{order.username}</Td>
                                <Td>{order.packageCode}</Td>
                                <Td>{order.extraVideos}</Td>
                                <Td>{formatMoney(order.amount)}</Td>
                                <Td>{order.transferContent}</Td>
                                <Td>
                                        <span style={statusStyle(order.status)}>
                                            {order.status}
                                        </span>
                                </Td>
                                <Td>
                                    {order.status === "PENDING" ? (
                                        <button
                                            onClick={() => markPaid(order.id)}
                                            style={s.logoutButton}
                                        >
                                            Duyệt PAID
                                        </button>
                                    ) : (
                                        "Đã xử lý"
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
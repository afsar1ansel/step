"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useToast, Badge } from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const GameSubscriptionPayments = () => {
    const baseUrl = process.env.NEXT_PUBLIC_GAME_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
    const [rowData, setRowData] = useState<any[]>([]);
    const toast = useToast();

    const columnDefs: ColDef[] = [
        {
            headerName: "User",
            field: "app_user_name",
            filter: true,
            floatingFilter: true,
            cellStyle: { textAlign: "left" },
        },
        {
            headerName: "Subscription",
            field: "display_name",
            filter: true,
            floatingFilter: true,
            cellStyle: { textAlign: "left" },
        },
        {
            headerName: "Transaction ID",
            field: "razorpay_payment_id",
            filter: true,
            floatingFilter: true,
        },
        {
            headerName: "Amount",
            field: "amount_inr",
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                return `₹${params.value || 0}`;
            },
        },
        {
            headerName: "Payment Method",
            field: "payment_method",
            filter: true,
            maxWidth: 150,
        },
        {
            headerName: "Date",
            field: "created_date",
            filter: true,
            maxWidth: 150,
            cellRenderer: (params: { value: any; data: any }) => {
                if (!params.value) return "-";
                const date = new Date(params.value);
                const options: Intl.DateTimeFormatOptions = {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                };
                return (
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                        <div>{date.toLocaleDateString("en-IN", options)}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                            {params.data.created_time}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "Status",
            field: "payment_status",
            filter: false,
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                const status = params.value;
                let colorScheme = "gray";
                let label = "Unknown";

                if (status === 1 || status === "success") {
                    colorScheme = "green";
                    label = "Success";
                } else if (status === 0 || status === "failed") {
                    colorScheme = "red";
                    label = "Failed";
                } else if (status === "pending") {
                    colorScheme = "yellow";
                    label = "Pending";
                }

                return <Badge colorScheme={colorScheme}>{label}</Badge>;
            },
        },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${baseUrl}/admin/subscriptions/payments/${token}`,
                { method: "GET" }
            );

            const data = await response.json();

            if (data.errFlag === 0 && Array.isArray(data.payments)) {
                setRowData(data.payments);
            } else if (Array.isArray(data)) {
                setRowData(data);
            } else {
                setRowData([]);
            }
        } catch (error) {
            setRowData([]);
            toast({
                title: "Error",
                description: "Failed to fetch payment data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    return (
        <div style={{ width: "100%", height: "auto" }}>
            <div
                style={{
                    height: "60px",
                    width: "100%",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px 10px 0px 0px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <p style={{ fontSize: "16px", fontWeight: "600" }}>
                    Game Subscription Payments
                </p>
            </div>
            <div style={{ height: "100%", width: "100%" }}>
                <AgGridReact
                    rowData={rowData}
                    rowHeight={60}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={50}
                    paginationPageSizeSelector={false}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        floatingFilter: true,
                        resizable: true,
                        flex: 1,
                        filterParams: {
                            debounceMs: 0,
                            buttons: ["reset"],
                        },
                    }}
                    domLayout="autoHeight"
                    suppressCellFocus={true}
                />
            </div>
        </div>
    );
};

export default GameSubscriptionPayments;

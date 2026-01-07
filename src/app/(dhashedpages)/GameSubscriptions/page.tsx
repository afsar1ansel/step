"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useToast, Select, Box, Flex, Badge } from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const GameSubscriptions = () => {
    const baseUrl = "https://step-game-app-jvzwm.ondigitalocean.app";
    const [rowData, setRowData] = useState<any[]>([]);
    const toast = useToast();
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const columnDefs: ColDef[] = [
        {
            headerName: "User",
            field: "app_user_name",
            filter: true,
            floatingFilter: true,
            cellStyle: { textAlign: "left" },
        },
        {
            headerName: "Subscription Type",
            field: "display_name",
            filter: true,
            floatingFilter: true,
            cellStyle: { textAlign: "left" },
        },
        {
            headerName: "Mode",
            field: "type",
            filter: true,
            maxWidth: 150,
            cellRenderer: (params: { value: any }) => {
                const type = params.value;
                let label = type;
                if (type === "single_3m") label = "Single Player";
                else if (type === "dual_3m") label = "Single + Dual";
                else if (type === "free_trial") label = "Free Trial";
                else if (type === "coupon_7d") label = "Coupon";
                else if (type === "referral_15d") label = "Referral";
                return <span>{label}</span>;
            },
        },
        {
            headerName: "Start Date",
            field: "from_date",
            filter: true,
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                if (!params.value) return "-";
                const date = new Date(params.value);
                return date.toLocaleDateString("en-IN");
            },
        },
        {
            headerName: "End Date",
            field: "to_date",
            filter: true,
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                if (!params.value) return "-";
                const date = new Date(params.value);
                return date.toLocaleDateString("en-IN");
            },
        },
        {
            headerName: "Matches",
            field: "matches_used",
            maxWidth: 100,
            cellRenderer: (params: { value: any; data: any }) => {
                const used = params.value || 0;
                const limit = params.data.match_limit;
                if (limit) {
                    return `${used}/${limit}`;
                }
                return "Unlimited";
            },
        },
        {
            headerName: "Price",
            field: "price_inr",
            maxWidth: 100,
            cellRenderer: (params: { value: any }) => {
                const price = params.value;
                if (price === 0 || !price) return "Free";
                return `₹${price}`;
            },
        },
        {
            headerName: "Status",
            field: "current_status",
            filter: false,
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                const status = params.value;
                let colorScheme = "gray";
                let label = status;

                if (status === "active") {
                    colorScheme = "green";
                    label = "Active";
                } else if (status === "expired") {
                    colorScheme = "red";
                    label = "Expired";
                } else if (status === "used") {
                    colorScheme = "yellow";
                    label = "Used";
                }

                return <Badge colorScheme={colorScheme}>{label}</Badge>;
            },
        },
    ];

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    async function fetchData() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${baseUrl}/admin/subscriptions/list/${token}?status=${statusFilter}`,
                { method: "GET" }
            );

            const data = await response.json();

            if (data.errFlag === 0 && Array.isArray(data.subscriptions)) {
                setRowData(data.subscriptions);
            } else if (Array.isArray(data)) {
                setRowData(data);
            } else {
                setRowData([]);
                if (data.message) {
                    toast({
                        title: "Info",
                        description: data.message,
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        } catch (error) {
            setRowData([]);
            toast({
                title: "Error",
                description: "Failed to fetch subscription data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
    };

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
                    Game Active Subscriptions
                </p>
                <Flex align="center" gap={2}>
                    <Box fontSize="14px" fontWeight="500">
                        Status:
                    </Box>
                    <Select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        width="150px"
                        size="sm"
                    >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="used">Used</option>
                    </Select>
                </Flex>
            </div>
            <div style={{ height: "100%", width: "100%" }}>
                <AgGridReact
                    rowData={rowData}
                    rowHeight={50}
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

export default GameSubscriptions;

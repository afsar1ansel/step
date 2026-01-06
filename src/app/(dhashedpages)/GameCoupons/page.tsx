"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
    useToast,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    useDisclosure,
    Badge,
    Switch,
    Flex,
    Box,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const GameCoupons = () => {
    const baseUrl = process.env.NEXT_PUBLIC_GAME_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
    const [rowData, setRowData] = useState<any[]>([]);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Form state for new coupon
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_percent: 0,
        subscription_days: 7,
        status: 1,
    });

    const columnDefs: ColDef[] = [
        {
            headerName: "Coupon Code",
            field: "coupon_code",
            filter: true,
            floatingFilter: true,
            cellStyle: { textAlign: "left", fontWeight: "600" },
        },
        {
            headerName: "Discount %",
            field: "discount_percent",
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                return `${params.value || 0}%`;
            },
        },
        {
            headerName: "Subscription Days",
            field: "subscription_days",
            maxWidth: 150,
            cellRenderer: (params: { value: any }) => {
                return `${params.value || 7} days`;
            },
        },
        {
            headerName: "Times Used",
            field: "times_used",
            maxWidth: 120,
        },
        {
            headerName: "Created Date",
            field: "created_date",
            filter: true,
            maxWidth: 150,
            cellRenderer: (params: { value: any }) => {
                if (!params.value) return "-";
                const date = new Date(params.value);
                return date.toLocaleDateString("en-IN");
            },
        },
        {
            headerName: "Status",
            field: "status",
            filter: false,
            maxWidth: 120,
            cellRenderer: (params: { value: any }) => {
                const status = params.value;
                const isActive = status === 1;
                return (
                    <Badge colorScheme={isActive ? "green" : "red"}>
                        {isActive ? "Active" : "Disabled"}
                    </Badge>
                );
            },
        },
        {
            headerName: "Actions",
            field: "id",
            maxWidth: 150,
            cellRenderer: (params: { value: any; data: any }) => {
                const isActive = params.data.status === 1;
                return (
                    <Button
                        size="sm"
                        colorScheme={isActive ? "red" : "green"}
                        onClick={() => toggleCouponStatus(params.value, isActive ? 0 : 1)}
                    >
                        {isActive ? "Disable" : "Enable"}
                    </Button>
                );
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
                `${baseUrl}/admin/subscriptions/coupons/${token}`,
                { method: "GET" }
            );

            const data = await response.json();

            if (data.errFlag === 0 && Array.isArray(data.coupons)) {
                setRowData(data.coupons);
            } else if (Array.isArray(data)) {
                setRowData(data);
            } else {
                setRowData([]);
            }
        } catch (error) {
            setRowData([]);
            toast({
                title: "Error",
                description: "Failed to fetch coupon data",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    async function createCoupon() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${baseUrl}/admin/subscriptions/coupons/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    ...newCoupon,
                }),
            });

            const data = await response.json();

            if (data.errFlag === 0) {
                toast({
                    title: "Success",
                    description: "Coupon created successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
                setNewCoupon({ code: "", discount_percent: 0, subscription_days: 7, status: 1 });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to create coupon",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create coupon",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    async function toggleCouponStatus(couponId: number, newStatus: number) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${baseUrl}/admin/subscriptions/coupons/toggle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    coupon_id: couponId,
                    status: newStatus,
                }),
            });

            const data = await response.json();

            if (data.errFlag === 0) {
                toast({
                    title: "Success",
                    description: `Coupon ${newStatus === 1 ? "enabled" : "disabled"} successfully`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchData();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to update coupon",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update coupon status",
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
                    Game Coupon Codes
                </p>
                <Button colorScheme="teal" size="sm" onClick={onOpen}>
                    + Create Coupon
                </Button>
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

            {/* Create Coupon Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Coupon</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={4}>
                            <FormLabel>Coupon Code</FormLabel>
                            <Input
                                placeholder="Enter coupon code (e.g., SAVE20)"
                                value={newCoupon.code}
                                onChange={(e) =>
                                    setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                                }
                            />
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel>Discount Percentage</FormLabel>
                            <Input
                                type="number"
                                placeholder="0"
                                value={newCoupon.discount_percent}
                                onChange={(e) =>
                                    setNewCoupon({
                                        ...newCoupon,
                                        discount_percent: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </FormControl>
                        <FormControl mb={4}>
                            <FormLabel>Subscription Days Granted</FormLabel>
                            <Input
                                type="number"
                                placeholder="7"
                                value={newCoupon.subscription_days}
                                onChange={(e) =>
                                    setNewCoupon({
                                        ...newCoupon,
                                        subscription_days: parseInt(e.target.value) || 7,
                                    })
                                }
                            />
                        </FormControl>
                        <FormControl>
                            <Flex align="center" gap={2}>
                                <FormLabel mb={0}>Active</FormLabel>
                                <Switch
                                    isChecked={newCoupon.status === 1}
                                    onChange={(e) =>
                                        setNewCoupon({
                                            ...newCoupon,
                                            status: e.target.checked ? 1 : 0,
                                        })
                                    }
                                />
                            </Flex>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={createCoupon}
                            isDisabled={!newCoupon.code}
                        >
                            Create Coupon
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default GameCoupons;

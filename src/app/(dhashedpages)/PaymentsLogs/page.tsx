"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useToast, Select, Box, Flex } from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const PaymentsLogs = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const toast = useToast();
  const [paymentType, setPaymentType] = useState<string>("Courses");

  // Course payment columns
  const courseColumns: ColDef[] = [
    {
      headerName: "User",
      field: "app_user_name",
      filter: true,
      floatingFilter: true,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Course",
      field: "course_name",
      filter: true,
      floatingFilter: true,
      maxWidth: 150,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Transaction ID",
      field: "phonepay_transaction_id",
    },
    {
      headerName: "Created Date",
      field: "created_date",
      filter: true,
      maxWidth: 150,
      cellStyle: { textAlign: "left" },
      cellRenderer: (params: { value: any; data: any }) => {
        const date = new Date(params.value);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.2,
            }}
          >
            <div>{date.toLocaleDateString("en-IN", options)}</div>
            <div>{params.data.created_time} </div>
          </div>
        );
      },
    },
    {
      headerName: "Amount",
      field: "actual_price_inr",
      cellStyle: { textAlign: "left", paddingTop: "8px", paddingBottom: "8px" },
      autoHeight: true,
      cellRenderer: (params: { value: any; data: any }) => {
        const amount = params.value;
        const Damount = params.data.selling_price_inr;

        return (
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: "500", marginBottom: "2px" }}>
              Discounted Price: ₹ {Damount}
            </div>
            <div style={{ color: "#888", fontSize: "12px", margin: 0 }}>
              Actual Price: ₹ {amount}
            </div>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "payment_status",
      filter: false,
      maxWidth: 100,
      cellRenderer: (params: { value: any; data: any }) => {
        const status = params.value; // expected to be 0 or 1
        const isSuccess = status === 0;

        const labelStyle = {
          fontWeight: 500,
          fontSize: "16px",
          color: isSuccess ? "#E53E3E" : "#38A169",
          textAlign: "center" as any,
          maxWidth: "fit-content",
        };

        return (
          <span style={labelStyle}>{isSuccess ? "Failed" : "Success"}</span>
        );
      },
    },
  ];

  // Dopamine payment columns
  const dopamineColumns: ColDef[] = [
    {
      headerName: "User",
      field: "app_user_name",
      filter: true,
      floatingFilter: true,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Product",
      field: "product_name",
      filter: true,
      floatingFilter: true,
      maxWidth: 150,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Transaction ID",
      field: "transaction_id",
      filter: true,
    },
    {
      headerName: "Created Date",
      field: "created_date",
      filter: true,
      maxWidth: 150,
      cellStyle: { textAlign: "left" },
      cellRenderer: (params: { value: any; data: any }) => {
        const date = new Date(params.value);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.2,
            }}
          >
            <div>{date.toLocaleDateString("en-IN", options)}</div>
            <div>{params.data.created_time} </div>
          </div>
        );
      },
    },
    {
      headerName: "Amount",
      field: "actual_price",
      cellStyle: { textAlign: "left", paddingTop: "8px", paddingBottom: "8px" },
      autoHeight: true,
      cellRenderer: (params: { value: any; data: any }) => {
        const amount = params.value;
        const Damount = params.data.selling_price;

        return (
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: "500", marginBottom: "2px" }}>
              Price: ₹ {Damount}
            </div>
            <div style={{ color: "#888", fontSize: "12px", margin: 0 }}>
              Actual Price: ₹ {amount}
            </div>
          </div>
        );
      },
    },
    {
      headerName: "Status",
      field: "payment_status",
      filter: false,
      maxWidth: 100,
      cellRenderer: () => {
        const labelStyle = {
          fontWeight: 500,
          fontSize: "16px",
          color: "#38A169",
          textAlign: "center" as any,
          maxWidth: "fit-content",
        };

        return <span style={labelStyle}>Success</span>;
      },
    },
  ];

  const [columnDefs, setColumnDefs] = useState<ColDef[]>(courseColumns);

  useEffect(() => {
    fetchData();
  }, [paymentType]);

  // fetching data
  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        paymentType === "Courses"
          ? `${baseUrl}/admin/app-purchase/all-user-purchase-list/${token}`
          : `${baseUrl}/admin/app-purchase/all-dope-deal-list/${token}`;

      const response = await fetch(endpoint, {
        method: "GET",
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setRowData(data);
        console.log("Payment data:", data);
      } else {
        setRowData([]);
        toast({
          title: "Info",
          description: data.message || "No data found",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  // Handle payment type change
  const handlePaymentTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newType = event.target.value;
    setPaymentType(newType);
    setColumnDefs(newType === "Courses" ? courseColumns : dopamineColumns);
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Payment Logs</p>
        <Flex align="center" gap={2}>
          <Box fontSize="14px" fontWeight="500">
            Payment Type:
          </Box>
          <Select
            value={paymentType}
            onChange={handlePaymentTypeChange}
            width="150px"
            size="sm"
          >
            <option value="Courses">Courses</option>
            <option value="Dopamine">Dopamine</option>
          </Select>
        </Flex>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          rowHeight={100}
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
          getRowHeight={function (params) {
            const description = params.data?.banner_description || "";
            const words = description.split(" ").length;
            const baseHeight = 50;
            const heightPerWord = 6;
            const minHeight = 50;
            const calculatedHeight = baseHeight + words * heightPerWord;
            return Math.max(minHeight, calculatedHeight);
          }}
          domLayout="autoHeight"
          suppressCellFocus={true}
        />
      </div>
    </div>
  );
};

export default PaymentsLogs;

"use client";

import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import { BsDownload } from "react-icons/bs";
import { BsCloudCheckFill } from "react-icons/bs";

ModuleRegistry.registerModules([AllCommunityModule]);

const Info = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const [pendingReports, setPendingReports] = useState<any[]>([
    {
      fileName: "UPS_Data_20250108_001.csv",
      // uploadDate: "23/12/2024",
      // deviceName: "MESHA_001",
      // status: "Pending",
    },
  ]);

  const [generatedReports, setGeneratedReports] = useState<any[]>([
    {
      fileName: "UPS_Data_20250108_002.csv",
      // uploadDate: "24/12/2024",
      // deviceName: "MESHA_002",
      // status: "Generated",
    },
  ]);

  const columnDefs = [
    {
      field: "fileName",
      headerName: "File Name",
      filter: "agTextColumnFilter",
      minWidth: 500,
    },
    // { field: "uploadDate", headerName: "Upload Date", filter: true },
    // { field: "deviceName", headerName: "Device Name", filter: true },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params: any) => (
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            justifyContent: "space-evenly",
            height: "100%",
          }}
        >
          <div
            onClick={() => handleDownload(params.data)}
            style={{ cursor: "pointer", transition: "color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "blue")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
          >
            <BsDownload size={20} />
          </div>
          <div
            onClick={() => handleSave(params.data)}
            style={{ cursor: "pointer", transition: "color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "green")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
          >
            <BsCloudCheckFill size={20} />
          </div>
        </div>
      ),
    },
  ];

  const handleDownload = (data: any) => {
    console.log("Download", data);
    // Implement download functionality
  };

  const handleSave = (data: any) => {
    console.log("Save", data);
    // Implement save functionality
  };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
      <div className={styles.hello}>
        <h3>Info Page</h3>
        <p>
          Access, monitor, and manage uploaded data logs with detailed
          processing history for better transparency and control.
        </p>
      </div>
      <div
        style={{
          height: "100%",
          width: "50vw",
          marginTop: "40px",
        }}
      >
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
          <div>
            <button
              style={{
                fontWeight: activeTab === "pending" ? "bold" : "normal",
                marginRight: "40px",
                color: activeTab === "pending" ? "green" : "inherit",
                backgroundColor:
                  activeTab === "pending" ? "#e6f4ea" : "transparent", // Light green background for active tab
                padding: "8px 16px", // Add padding for better spacing
                borderRadius: "8px", // Rounded corners
                border: "none", // Remove default border
                cursor: "pointer", // Add pointer cursor
                boxShadow:
                  activeTab === "pending"
                    ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                    : "none", // Subtle shadow for active tab
                transition: "all 0.3s ease", // Smooth transition for hover and active states
              }}
              onClick={() => setActiveTab("pending")}
            >
              Pending Reports
            </button>
            <button
              style={{
                fontWeight: activeTab === "generated" ? "bold" : "normal",
                color: activeTab === "generated" ? "green" : "inherit",
                backgroundColor:
                  activeTab === "generated" ? "#e6f4ea" : "transparent",
                padding: "8px 16px", 
                borderRadius: "8px",
                border: "none", // Remove default border
                cursor: "pointer", // Add pointer cursor
                boxShadow:
                  activeTab === "generated"
                    ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                    : "none", // Subtle shadow for active tab
                transition: "all 0.3s ease", // Smooth transition for hover and active states
              }}
              onClick={() => setActiveTab("generated")}
            >
              Reports Generated
            </button>
          </div>
        </div>
        <div style={{ height: "100%" }}>
          <AgGridReact
            rowData={
              activeTab === "pending" ? pendingReports : generatedReports
            }
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationAutoPageSize={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Info;

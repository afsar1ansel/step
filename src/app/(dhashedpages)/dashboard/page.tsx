// import Image from "next/image";

"use client";
import styles from "./page.module.css";

import { TbDeviceAnalytics } from "react-icons/tb";
import { RiUser3Line } from "react-icons/ri";
import { IoMdPaper } from "react-icons/io";
import { VscFileSymlinkDirectory } from "react-icons/vsc";



import { AgGridReact } from "ag-grid-react";
import React, { useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Switch,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);


export default function Home() {

  const [rowData, setRowData] = useState<any[]>([
      {
        id: "01",
        name: "John Doe",
        email: "john@email.com",
        registration: "12345",
        contact: "9876543210",
        registrationDate: "2025-02-10",
        mode: "Paid",
        subscription: "Active",
      },
      {
        id: "02",
        name: "Jane Smith",
        email: "jane@email.com",
        registration: "67890",
        contact: "9876543211",
        registrationDate: "2025-02-09",
        mode: "Free",
        subscription: "Inactive",
      },
    ]);
  
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
      { headerName: "Sl. No", field: "id", maxWidth: 80 },
      { headerName: "Student Name", field: "name", minWidth: 180 , filter: true},
      { headerName: "Email", field: "email", minWidth: 200 },
      { headerName: "Registration No.", field: "registration", maxWidth: 150 },
      { headerName: "Contact No.", field: "contact", maxWidth: 120 },
      {
        headerName: "Registration Date",
        field: "registrationDate",
        // minWidth: 100,
        maxWidth: 150,
      },
      {
        headerName: "Status",
        field: "subscription",
        maxWidth: 130,
        cellRenderer: (params: any) => (
          <Switch
            isChecked={params.value === "Active"}
            onChange={() => toggleSubscription(params.data)}
            colorScheme="green"
          >
            {params.value}
          </Switch>
        ),
      },
      {
        headerName: "Mode",
        field: "mode",
        maxWidth: 100,
        cellRenderer: (params: any) => (
          <span
            style={{
              color: "white",
              backgroundColor: params.value === "Paid" ? "#81C784" : "#FFB74D",
              padding: "5px 10px",
              borderRadius: "8px",
            }}
          >
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Actions",
        cellRenderer: (params: any) => (
          <div>
            <button
              onClick={() => handleEdit(params.data)}
              style={{ marginRight: "10px" }}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(params.data)}>Delete</button>
          </div>
        ),
      },
    ]);
  
    // State for Add Student Modal
    const {
      isOpen: isAddModalOpen,
      onOpen: onAddModalOpen,
      onClose: onAddModalClose,
    } = useDisclosure();
  
    // State for Edit Student Modal
    const {
      isOpen: isEditModalOpen,
      onOpen: onEditModalOpen,
      onClose: onEditModalClose,
    } = useDisclosure();
  
    const [currentStudent, setCurrentStudent] = useState<any>(null);
    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentContact, setStudentContact] = useState("");
  
    const handleEdit = (data: any) => {
      setCurrentStudent(data);
      setStudentName(data.name);
      setStudentEmail(data.email);
      setStudentContact(data.contact);
      onEditModalOpen();
    };
  
    const handleDelete = (data: any) => {
      setRowData((prev) => prev.filter((student) => student.id !== data.id));
    };
  
    const toggleSubscription = (data: any) => {
      setRowData((prev) =>
        prev.map((student) =>
          student.id === data.id
            ? {
                ...student,
                subscription:
                  student.subscription === "Active" ? "Inactive" : "Active",
              }
            : student
        )
      );
    };
  
    const handleAddStudent = () => {
      const newStudent = {
        id: String(rowData.length + 1),
        name: studentName,
        email: studentEmail,
        contact: studentContact,
        registrationDate: new Date().toISOString().split("T")[0],
        subscription: "Inactive",
      };
      setRowData((prev) => [...prev, newStudent]);
      resetForm();
      onAddModalClose();
    };
  
    const resetForm = () => {
      setStudentName("");
      setStudentEmail("");
      setStudentContact("");
      setCurrentStudent(null);
    };


  return (
    <div className={styles.page}>
      {/* <div className={styles.hello}>
        <h3>👋 Hello, Admin</h3>
        <p>Here is all your analytics overview</p>
      </div> */}

      <div className={styles.statesContainer}>
        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>TOTAL Downloads</p>
            <h2>3990</h2>
            {/* <p className={styles.measure}>↑ 3.5% Increase</p> */}
          </div>
          <div className={styles.stateIcon}>
            <RiUser3Line />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>Subcriptions</p>
            <h2>110</h2>
            {/* <p className={styles.measure}>20 Unpaid , 90 paid</p> */}
          </div>
          <div className={styles.stateIcon}>
            <TbDeviceAnalytics />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>Revenue</p>
            <h2>300</h2>
            <p className={styles.measure}>₹ 2400 </p>
          </div>
          <div className={styles.stateIcon}>
            <IoMdPaper />
          </div>
        </div>

        <div className={styles.stateBox}>
          <div className={styles.stateText}>
            <p>Avg. daily login</p>
            <h2>1460</h2>
            {/* <p className={styles.measure}>1000 under Course, 450 under misc</p> */}
          </div>
          <div className={styles.stateIcon}>
            <VscFileSymlinkDirectory />
          </div>
        </div>
      </div>

      <div className={styles.chartBox}>
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
          <p style={{ fontSize: "16px", fontWeight: "600" }}>Students Data</p>
          {/* <Button onClick={onAddModalOpen} colorScheme="green">
                  Add Student
                </Button> */}
        </div>
        <div style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationAutoPageSize={true}
          />
        </div>
      </div>
    </div>
  );
}

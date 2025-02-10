"use client";

import { AgGridReact } from "ag-grid-react";
import { useEffect, useMemo, useState } from "react";
import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import { Button, FormControl, FormLabel, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import Head from "next/head";


ModuleRegistry.registerModules([AllCommunityModule]);

const GridComponent = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      deviceId: "DMS12345",
      CustomerName: "John Doe",
      status: "",
      lastSync: "2025-01-10 10:30 AM",
      action: "Edit",
    },
    {
      deviceId: "DMS56789",
      CustomerName: "Jane Smith",
      status: "In",
      lastSync: "2025-01-09 03:20 PM",
      action: "Edit",
    },
    {
      deviceId: "DMS98765",
      CustomerName: "Mike Johnson",
      status: "",
      lastSync: "2025-01-08 08:45 AM",
      action: "Edit",
    },
    {
      deviceId: "DMS11223",
      CustomerName: "Emily Davis",
      status: "",
      lastSync: "2025-01-07 02:15 PM",
      action: "Edit",
    },
    {
      deviceId: "DMS44556",
      CustomerName: "Chris Brown",
      status: "In",
      lastSync: "2025-01-06 09:00 AM",
      action: "Edit",
    },
  ]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "name",
      headerName: "Name",
      filter: "agTextColumnFilter",
    },
    { field: "cource", headerName: "Cource", filter: true },
    { field: "College", filter: "agDateColumnFilter" },
    {
      field: "validity",
      headerName: "Validity",
      filter: "agSetColumnFilter",
    },
    {
      field: "Time",
      headerName: "Time Spent",
    },
  ]);

  // const pagination = useMemo(() => {
  //   return {
  //     pagination: true,
  //     paginationPageSize: 10,
  //     paginationPageSizeSelector: [10, 20, 30, 40, 50],
  //   };
  // }, []);

  function handleEdit(data: any) {
    console.log(data);
  }


  // modal
   const { isOpen, onOpen, onClose } = useDisclosure();


    const [deviceId, setDeviceId] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [info, setinfo] = useState("");

    const handleAddDevice = () => {
      const newDevice = {
        deviceId,
        deviceName,
        info,
      };
      console.log(newDevice);
      // Clear inputs and close modal (optional)
      setDeviceId("");
      setDeviceName("");
      setinfo("");
      onClose();
    };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
      {/* <div className={styles.hello}>
        <h3>Device Management</h3>
        <p>
          Monitor and manage all connected devices, update details, and ensure
          smooth operations with ease.
        </p>
      </div> */}
      <div
        style={{
          height: "100%",
          width: "80vw",
          marginTop: "40px",
          maxWidth: "1300px",
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
          <p style={{ fontSize: "16px", fontWeight: "600" }}>Student Data</p>
          <Button onClick={onOpen}>
            Export Data
          </Button>
        </div>
        <div style={{ height: "100%", width: "100%", maxWidth: "1300px" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationAutoPageSize={true}
            getRowHeight={function (params) {
              const description = params.data?.banner_description || "";
              const words = description.split(" ").length;
              const baseHeight = 80;
              const heightPerWord = 6;
              const minHeight = 80;
              const calculatedHeight = baseHeight + words * heightPerWord;
              return Math.max(minHeight, calculatedHeight);
            }}
          />
        </div>
      </div>
      {/* <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add new device</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Device ID</FormLabel>
              <Input
                placeholder="Enter device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
              <FormLabel>Customer name</FormLabel>
              <Input
                placeholder="Enter device name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />

              <FormLabel>Information</FormLabel>
              <Input
                placeholder="User Extra Information"
                value={info}
                onChange={(e) => setinfo(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddDevice}>
              Add Device
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </div>
  );
};

export default GridComponent;

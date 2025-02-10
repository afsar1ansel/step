"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useState } from "react";
// import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
// import { RiDeleteBin6Line } from "react-icons/ri";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Head from "next/head";

ModuleRegistry.registerModules([AllCommunityModule]);

const UserRoll = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      userId: "U001",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      role: [
        "dashboard",
        "Device Management",
        "User Management",
        "Notifications",
        "ota Update",
      ],
      status: true,
      dateAdded: "23/12/2024 6:30 PM",
      action: "action",
    },
    {
      userId: "U002",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      role: ["dashboard", "User Management", "ota Update"],
      status: false,
      dateAdded: "24/12/2024 9:15 AM",
      action: "action",
    },
    {
      userId: "U003",
      name: "Anjali Gupta",
      email: "anjali.gupta@example.com",
      role: ["admin", "Device Management", "User Management", "ota Update"],
      status: true,
      dateAdded: "22/12/2024 5:45 PM",
      action: "action",
    },
  ]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "userId",
      headerName: "Sl. Id",
      filter: "agTextColumnFilter",
    },
    { field: "name", filter: true },
    { field: "email", headerName: "Email Id", filter: "agTextColumnFilter" },
    {
      field: "role",
      headerName: "Modules Permitted",
      filter: "agTextColumnFilter",
      autoHeight: true,
      cellRenderer: (params: any) => {
        return (
          <div>
            {params.data.role.map((item: string, index: number) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        );
      },
    },
    { field: "status", headerName: "Access" },
    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params: any) => (
        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <div
            onClick={() => handleEdit(params.data)}
            style={{ cursor: "pointer" }}
          >
            <CiEdit size={20} />
          </div>
        </div>
      ),
    },
  ]);

  // const pagination = useMemo(() => {
  //   return {
  //     pagination: true,
  //     paginationPageSize: 4,
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
  const [password, setpassword] = useState("");
  const [radioval, setRadioval] = useState("");

  const [show, setShow] = React.useState(false);
  const handleClickpass = () => setShow(!show);

  const handleAddDevice = () => {
    const newDevice = {
      deviceId,
      deviceName,
      password,
      radioval,
    };
    console.log(newDevice);
    // Clear inputs and close modal (optional)
    setDeviceId("");
    setDeviceName("");
    setpassword("");
    setRadioval("");
    onClose();
  };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
      <div className={styles.hello}>
        <h3>User management</h3>
        <p>
          View/manage user accounts and configure roles for streamlined access
          control.
        </p>
      </div>
      <div
        style={{
          height: "100%",
          width: "80vw",
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
          <p style={{ fontSize: "16px", fontWeight: "600" }}>User management</p>
          <Button onClick={onOpen} colorScheme="green">
            Add New User
          </Button>
        </div>
        <div style={{ height: "100%", width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
            paginationAutoPageSize={true}
            getRowHeight={function (params) {
              const roles = params.data?.role || [];
              const baseHeight = 20;
              const additionalHeight = roles.length * 20;
              return baseHeight + additionalHeight;
            }}
          />
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter User Name"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
              <FormLabel>Email ID</FormLabel>
              <Input
                placeholder="Enter Email Id"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              <FormLabel>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClickpass}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <br />
              <FormLabel>Access To Screens</FormLabel>
              <CheckboxGroup
                colorScheme="green"
              >
                <Stack direction="column">
                  <Checkbox value="1">Dashboard</Checkbox>
                  <Checkbox value="2">All Devices</Checkbox>
                  <Checkbox value="3">OTA Update</Checkbox>
                  <Checkbox value="4">Alert Logs</Checkbox>
                  <Checkbox value="5">User Role</Checkbox>
                </Stack>
              </CheckboxGroup>
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
      </Modal>
    </div>
  );
};

export default UserRoll;

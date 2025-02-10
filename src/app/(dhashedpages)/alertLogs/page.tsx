"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useState } from "react";
import { HiDownload } from "react-icons/hi";
import { FaEye } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import type { ColDef } from "ag-grid-community";
import { IoReload } from "react-icons/io5";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
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
  Select,
  useDisclosure,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const AlertLogs = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      fileName: "UPS_Data_20250108_001.csv",
      uploadDate: "23/12/2024",
      deviceName: "MESHA_001",
      status: "Processed",
      action: "action",
    },
  ]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "index",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "Device ID",
      field: "Cycle",
      minWidth: 180,
    },
    {
      headerName: "Parameter",
      field: "b1",
    },
    {
      headerName: "Operation",
      field: "b2",
    },
    {
      headerName: "Value",
      field: "b3",
    },
    // {
    //   headerName: "Created Date",
    //   field: "device_log_date",
    //   filter: "agDateColumnFilter",
    //   maxWidth: 300,
    //   filterParams: {
    //     comparator: (filterLocalDateAtMidnight, cellValue) => {
    //       const dateParts = cellValue.split("-");
    //       const year = Number(dateParts[2]);
    //       const month = Number(dateParts[1]) - 1;
    //       const day = Number(dateParts[0]);
    //       const cellDate = new Date(year, month, day);
    //       // Compare dates
    //       if (cellDate < filterLocalDateAtMidnight) {
    //         return -1;
    //       } else if (cellDate > filterLocalDateAtMidnight) {
    //         return 1;
    //       } else {
    //         return 0;
    //       }
    //     },
    //   },
    // },
    // {
    //   headerName: "Created Tiem",
    //   field: "device_log_time",
    //   filter: false,
    //   sortable: false,
    //   maxWidth: 200,
    // },
  ]);

 

  function handleEdit(data: any) {
    console.log(data);
  }

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [password, setpassword] = useState("");
  const [role, setRole] = useState("");

  const [show, setShow] = React.useState(false);
  const handleClickpass = () => setShow(!show);

  const handleAddDevice = () => {
    const newDevice = {
      deviceId,
      deviceName,
      password,
      role,
    };
    console.log(newDevice);
    // Clear inputs and close modal (optional)
    setDeviceId("");
    setDeviceName("");
    setpassword("");
    setRole("");
    onClose();
  };

  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
      <div className={styles.hello}>
        <h3>Alert Logs</h3>
        <p>
          Access, monitor, and manage uploaded data logs with detailed
          processing history for better transparency and control.
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
          <p style={{ fontSize: "16px", fontWeight: "600" }}>Alert Logs</p>
          {/* <Button onClick={onOpen} colorScheme="green">
            Add New User
          </Button> */}
        </div>
        <div className={styles.vLowAndHigh}>
          <h5>Voltage Range : </h5>
          <p>
            B1: L <span id="v1Low">10</span> - H <span id="v1High">12</span>
          </p>
          <p>
            B2: L <span id="v2Low">12</span> - H <span id="v2High">15</span>
          </p>
          <p>
            B3: L <span id="v3Low">15</span> - H <span id="v3High">20</span>
          </p>
          <p>
            B4: L <span id="v4Low">20</span> - H <span id="v4High">22</span>
          </p>
        </div>
        <div style={{ height: "100%", width: "100%" }}>
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
              <FormLabel>Role</FormLabel>
              <Select
                placeholder="Select option"
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
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

export default AlertLogs;

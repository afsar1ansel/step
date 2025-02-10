"use client";

// import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useMemo, useState } from "react";
// import { FaEye } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import styles from "./page.module.css";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Grid,
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
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

import Link from "next/link";

ModuleRegistry.registerModules([AllCommunityModule]);

const CourseData = () => {





  const [show, setShow] = React.useState(false);
  const handleClickpass = () => setShow(!show);


  return (
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
    
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
          <p style={{ fontSize: "16px", fontWeight: "600" }}>Course</p>
          {/* <Button onClick={onOpen} colorScheme="green">
            Add New User
          </Button> */}
        </div>
        <div
          style={{
            height: "100%",
            width: "100%",
            padding: "20px",
            // backgroundColor: "#32b5ba",
          }}
        >
          <Grid templateColumns="repeat(4, 1fr)" gap="6">
            <Box h="100px" bg="gray.100" border="1px dashed gray">
              <Link href="/CourseData/Coursedetails">learn more →</Link>
            </Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
            <Box h="100px" bg="gray.100" border="1px dashed gray"></Box>
          </Grid>
       
        </div>
      </div>
    
    </div>
  );
};

export default CourseData;

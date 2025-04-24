// "StudentsTab" Component

"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
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
import { time } from "console";

ModuleRegistry.registerModules([AllCommunityModule]);

const StudentsTab = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  // fetching data 
  async function fetchData() {
    try{
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/video-learning/get-all/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      // setRowData(data);
      console.log(data);
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
  }

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
    <div style={{ width: "80vw", height: "60vh", maxWidth: "1250px" }}>
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Video Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Video
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
          paginationPageSizeSelector={[5, 10, 15]}
          // paginationAutoPageSize={true}
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
          suppressCellFocus={true}
        />
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Student Name</FormLabel>
              <Input
                placeholder="Enter Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Enter Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Contact No.</FormLabel>
              <Input
                placeholder="Enter Contact No."
                value={studentContact}
                onChange={(e) => setStudentContact(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddStudent}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Student Name</FormLabel>
              <Input
                placeholder="Enter Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Enter Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Contact No.</FormLabel>
              <Input
                placeholder="Enter Contact No."
                value={studentContact}
                onChange={(e) => setStudentContact(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddStudent}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StudentsTab;

"use client";

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
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const SubjectMaster = () => {
  const [rowData, setRowData] = useState<any[]>([
    { id: "01", name: "Anatomy" },
    { id: "02", name: "Biochemistry" },
  ]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "Subject Name",
      field: "name",
      minWidth: 180,
    },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => {
        return (
          <div>
            <button
              onClick={() => handleEdit(params.data)}
              style={{ marginRight: "10px" }}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(params.data)}>Delete</button>
          </div>
        );
      },
    },
  ]);

  // State for Add Subject Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Subject Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const [currentSubject, setCurrentSubject] = useState<any>(null);
  const [subjectName, setSubjectName] = useState("");

  const handleEdit = (data: any) => {
    setCurrentSubject(data);
    setSubjectName(data.name);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((subject) => subject.id !== data.id));
  };

  const handleAddSubject = () => {
    const newSubject = {
      id: String(rowData.length + 1),
      name: subjectName,
    };
    setRowData((prev) => [...prev, newSubject]);
    resetForm();
    onAddModalClose();
  };

  const handleUpdateSubject = () => {
    const updatedSubject = {
      id: currentSubject.id,
      name: subjectName,
    };
    setRowData((prev) =>
      prev.map((subject) =>
        subject.id === currentSubject.id ? updatedSubject : subject
      )
    );
    resetForm();
    onEditModalClose();
  };

  const resetForm = () => {
    setSubjectName("");
    setCurrentSubject(null);
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Subject Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Subject
        </Button>
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

      {/* Add Subject Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Subject Name</FormLabel>
              <Input
                placeholder="Enter Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddSubject}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Subject Name</FormLabel>
              <Input
                placeholder="Enter Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUpdateSubject}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubjectMaster;

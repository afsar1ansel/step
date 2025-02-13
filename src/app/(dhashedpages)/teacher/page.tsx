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
  Select,
  useDisclosure,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const TeacherMaster = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      id: "01",
      name: "Dr. Smith",
      subject: "Anatomy",
      description: "10+ years of experience",
      profilePic: "image",
    },
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
      headerName: "Teacher Name",
      field: "name",
      minWidth: 180,
    },
    {
      headerName: "Subject",
      field: "subject",
    },
    {
      headerName: "Description",
      field: "description",
    },
    {
      headerName: "Profile Picture",
      field: "profilePic",
      cellRenderer: (params: any) => {
        return (
          <img
            src={params.value}
            alt="Profile"
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        );
      },
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

  // State for Add Teacher Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Teacher Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [teacherDescription, setTeacherDescription] = useState("");
  const [teacherProfilePic, setTeacherProfilePic] = useState("");

  const handleEdit = (data: any) => {
    setCurrentTeacher(data);
    setTeacherName(data.name);
    setTeacherSubject(data.subject);
    setTeacherDescription(data.description);
    setTeacherProfilePic(data.profilePic);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((teacher) => teacher.id !== data.id));
  };

  const handleAddTeacher = () => {
    const newTeacher = {
      id: String(rowData.length + 1),
      name: teacherName,
      subject: teacherSubject,
      description: teacherDescription,
      profilePic: teacherProfilePic,
    };
    setRowData((prev) => [...prev, newTeacher]);
    resetForm();
    onAddModalClose();
  };

  const handleUpdateTeacher = () => {
    const updatedTeacher = {
      id: currentTeacher.id,
      name: teacherName,
      subject: teacherSubject,
      description: teacherDescription,
      profilePic: teacherProfilePic,
    };
    setRowData((prev) =>
      prev.map((teacher) =>
        teacher.id === currentTeacher.id ? updatedTeacher : teacher
      )
    );
    resetForm();
    onEditModalClose();
  };

  const resetForm = () => {
    setTeacherName("");
    setTeacherSubject("");
    setTeacherDescription("");
    setTeacherProfilePic("");
    setCurrentTeacher(null);
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Teacher Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Teacher
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

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Teacher</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Teacher Name</FormLabel>
              <Input
                placeholder="Enter Teacher Name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={teacherSubject}
                onChange={(e) => setTeacherSubject(e.target.value)}
              >
                <option value="Anatomy">Anatomy</option>
                <option value="Biochemistry">Biochemistry</option>
              </Select>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter Description"
                value={teacherDescription}
                onChange={(e) => setTeacherDescription(e.target.value)}
              />
              <FormLabel>Profile Picture URL</FormLabel>
              <Input
                placeholder="Enter Profile Picture URL"
                value={teacherProfilePic}
                onChange={(e) => setTeacherProfilePic(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddTeacher}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Teacher</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Teacher Name</FormLabel>
              <Input
                placeholder="Enter Teacher Name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={teacherSubject}
                onChange={(e) => setTeacherSubject(e.target.value)}
              >
                <option value="Anatomy">Anatomy</option>
                <option value="Biochemistry">Biochemistry</option>
              </Select>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter Description"
                value={teacherDescription}
                onChange={(e) => setTeacherDescription(e.target.value)}
              />
              <FormLabel>Profile Picture URL</FormLabel>
              <Input
                placeholder="Enter Profile Picture URL"
                value={teacherProfilePic}
                onChange={(e) => setTeacherProfilePic(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUpdateTeacher}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TeacherMaster;

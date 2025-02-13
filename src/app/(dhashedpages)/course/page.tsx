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

const CourseMaster = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      id: "01",
      name: "NEET PG Course",
      subjects: ["Anatomy", "Biochemistry"],
      price: "₹5,000",
      description: "Full course access",
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
      headerName: "Course Name",
      field: "name",
      minWidth: 180,
    },
    {
      headerName: "Assigned Subjects",
      field: "subjects",
      cellRenderer: (params: any) => {
        return params.value.join(", ");
      },
    },
    {
      headerName: "Price",
      field: "price",
    },
    {
      headerName: "Description",
      field: "description",
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

  // State for Add Course Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Course Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [courseName, setCourseName] = useState("");
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleEdit = (data: any) => {
    setCurrentCourse(data);
    setCourseName(data.name);
    setAssignedSubjects(data.subjects);
    setPrice(data.price);
    setDescription(data.description);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((course) => course.id !== data.id));
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: String(rowData.length + 1),
      name: courseName,
      subjects: assignedSubjects,
      price: price,
      description: description,
    };
    setRowData((prev) => [...prev, newCourse]);
    resetForm();
    onAddModalClose();
  };

  const handleUpdateCourse = () => {
    const updatedCourse = {
      id: currentCourse.id,
      name: courseName,
      subjects: assignedSubjects,
      price: price,
      description: description,
    };
    setRowData((prev) =>
      prev.map((course) =>
        course.id === currentCourse.id ? updatedCourse : course
      )
    );
    resetForm();
    onEditModalClose();
  };

  const resetForm = () => {
    setCourseName("");
    setAssignedSubjects([]);
    setPrice("");
    setDescription("");
    setCurrentCourse(null);
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Course Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Course
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

      {/* Add Course Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Course Name</FormLabel>
              <Input
                placeholder="Enter Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
              <FormLabel>Assign Subjects</FormLabel>
              <Select
                placeholder="Select Subjects"
                value={assignedSubjects}
                onChange={(e) =>
                  setAssignedSubjects(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
              >
                <option value="Anatomy">Anatomy</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Physiology">Physiology</option>
                <option value="Pathology">Pathology</option>
              </Select>
              <FormLabel>Price</FormLabel>
              <Input
                placeholder="Enter Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddCourse}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Course Name</FormLabel>
              <Input
                placeholder="Enter Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
              <FormLabel>Assign Subjects</FormLabel>
              <Select
                placeholder="Select Subjects"
                value={assignedSubjects}
                onChange={(e) =>
                  setAssignedSubjects(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
              >
                <option value="Anatomy">Anatomy</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Physiology">Physiology</option>
                <option value="Pathology">Pathology</option>
              </Select>
              <FormLabel>Price</FormLabel>
              <Input
                placeholder="Enter Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUpdateCourse}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CourseMaster;

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
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const CourseMaster = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      id: "01",
      name: "NEET PG Course",
      subjects: ["Anatomy"], // Updated to handle single subject
      price: "₹5,000",
      discountPrice: "₹4,000", // Added discount price
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
      headerName: "Discount Price",
      field: "discountPrice", // Added discount price column
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
  const [discountPrice, setDiscountPrice] = useState(""); // Added discount price state
  const [description, setDescription] = useState("");

  const handleEdit = (data: any) => {
    setCurrentCourse(data);
    setCourseName(data.name);
    setAssignedSubjects(data.subjects);
    setPrice(data.price);
    setDiscountPrice(data.discountPrice); // Set discount price
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
      discountPrice: discountPrice, // Added discount price
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
      discountPrice: discountPrice, // Added discount price
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
    setDiscountPrice(""); // Reset discount price
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
              <FormLabel>Assign Subject</FormLabel>
              <RadioGroup
                value={assignedSubjects[0] || ""} // Use the first item if array is not empty
                onChange={(value) => setAssignedSubjects([value])} // Set as a single value in an array
              >
                <Stack direction="column">
                  <Radio value="Anatomy" colorScheme="green">
                    Anatomy
                  </Radio>
                  <Radio value="Biochemistry" colorScheme="green">
                    Biochemistry
                  </Radio>
                  <Radio value="Physiology" colorScheme="green">
                    Physiology
                  </Radio>
                  <Radio value="Pathology" colorScheme="green">
                    Pathology
                  </Radio>
                </Stack>
              </RadioGroup>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
                <GridItem>
                  <FormLabel>Price</FormLabel>
                  <Input
                    placeholder="Enter Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </GridItem>
                <GridItem>
                  <FormLabel>Discount Price</FormLabel>
                  <Input
                    placeholder="Enter Discount Price"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                  />
                </GridItem>
              </Grid>
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
              <FormLabel>Assign Subject</FormLabel>
              <RadioGroup
                value={assignedSubjects[0] || ""} // Use the first item if array is not empty
                onChange={(value) => setAssignedSubjects([value])} // Set as a single value in an array
              >
                <Stack direction="column">
                  <Radio value="Anatomy" colorScheme="green">
                    Anatomy
                  </Radio>
                  <Radio value="Biochemistry" colorScheme="green">
                    Biochemistry
                  </Radio>
                  <Radio value="Physiology" colorScheme="green">
                    Physiology
                  </Radio>
                  <Radio value="Pathology" colorScheme="green">
                    Pathology
                  </Radio>
                </Stack>
              </RadioGroup>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
                <GridItem>
                  <FormLabel>Price</FormLabel>
                  <Input
                    placeholder="Enter Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </GridItem>
                <GridItem>
                  <FormLabel>Discount Price</FormLabel>
                  <Input
                    placeholder="Enter Discount Price"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                  />
                </GridItem>
              </Grid>
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

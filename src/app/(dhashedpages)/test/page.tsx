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
  Select,
  useDisclosure,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const TestsTab = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [rowData, setRowData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStep, setSelectedStep] = useState("");
  const [preCourseTestTitle, setPreCourseTestTitle] = useState("");
  const [preCourseTestDuration, setPreCourseTestDuration] = useState<
    number | ""
  >("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Date & Time",
      field: "dateTime",
      valueGetter: (params) =>
        `${params.data.created_date} ${params.data.created_time}`,
      minWidth: 200,
    },
    {
      headerName: "Title",
      field: "pre_course_test_title",
      minWidth: 250,
    },
    {
      headerName: "Total Time (Minutes)",
      field: "pre_course_test_duration_minutes",
      maxWidth: 150,
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
      maxWidth: 150,
    },
  ]);

  // Fetch tests data
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/pre-course-test/get-all/${token}`)
        .then((response) => response.json())
        .then((data) => setRowData(data))
        .catch((error) => console.error("Error fetching test data:", error));
    }
  }, [token, baseUrl]);

  // Fetch courses
  useEffect(() => {
    console.log(token);

    if (token) {
      fetch(`${baseUrl}/masters/courses/get-all-courses/${token}`)
        .then((response) => response.json())
        .then((data) => setCourses(data))
        .catch((error) => console.error("Error fetching courses:", error));
    }
  }, [token, baseUrl]);

  // Fetch steps when a course is selected
  useEffect(() => {
    if (selectedCourse && token) {
      fetch(
        `${baseUrl}/masters/get-all-course-step-details/${selectedCourse}/${token}`
      )
        .then((response) => response.json())
        .then((data) => setSteps(data))
        .catch((error) => console.error("Error fetching steps:", error));
    }
  }, [selectedCourse, token, baseUrl]);

  const handleAddOrUpdateTest = () => {
    if (
      !selectedCourse ||
      !selectedStep ||
      !preCourseTestTitle ||
      !preCourseTestDuration
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("token", token || "");
    formData.append("courseStepDetailsMasterId", selectedStep);
    formData.append("preCourseTestTitle", preCourseTestTitle);
    formData.append(
      "preCourseTestDurationMinutes",
      String(preCourseTestDuration)
    );

    if (isEditMode) {
      formData.append("preCourseTestId", String(currentTestId));
      fetch(`${baseUrl}/masters/pre-course-test/update`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          console.log(response);
          // if (response.errFlag == 0) {
          //   alert("Test updated successfully!");
          //   fetchTests(); // Refresh the table
          //   resetForm();
          //   onModalClose();
          // } else {
          //   alert("Failed to update test.");
          // }
        })
        .catch((error) => console.error("Error updating test:", error));
    } else {
      fetch(`${baseUrl}/masters/pre-course-test/add`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          console.log(response);
          // if (response.ok) {
          //   alert("Test added successfully!");
          //   fetchTests(); // Refresh the table
          //   resetForm();
          //   onModalClose();
          // } else {
          //   alert("Failed to add test.");
          // }
        })
        .catch((error) => console.error("Error adding test:", error));
    }
  };

  const handleEdit = (data: any) => {
    setIsEditMode(true);
    setCurrentTestId(data.id);
    setSelectedCourse(data.course_id); // Assuming course_id is available in the data
    setSelectedStep(data.course_step_details_master_id);
    setPreCourseTestTitle(data.pre_course_test_title);
    setPreCourseTestDuration(data.pre_course_test_duration_minutes);
    onModalOpen();
  };

  const handleDelete = (data: any) => {
    console.log("Delete clicked for:", data);
    // Add delete logic here
  };

  const resetForm = () => {
    setSelectedCourse("");
    setSelectedStep("");
    setPreCourseTestTitle("");
    setPreCourseTestDuration("");
    setIsEditMode(false);
    setCurrentTestId(null);
    setSteps([]);
  };

  const fetchTests = () => {
    if (token) {
      fetch(`${baseUrl}/masters/pre-course-test/get-all/${token}`)
        .then((response) => response.json())
        .then((data) => setRowData(data))
        .catch((error) => console.error("Error fetching test data:", error));
    }
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Tests Data</p>
        <Button onClick={onModalOpen} colorScheme="green">
          Add Test
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

      {/* Add/Edit Test Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? "Edit Test" : "Add New Test"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Course</FormLabel>
              <Select
                placeholder="Select Course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Step</FormLabel>
              <Select
                placeholder="Select Step"
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                isDisabled={!selectedCourse}
              >
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.course_step_title}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Test Title</FormLabel>
              <Input
                placeholder="Enter Test Title"
                value={preCourseTestTitle}
                onChange={(e) => setPreCourseTestTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Test Duration (Minutes)</FormLabel>
              <Input
                type="number"
                placeholder="Enter Test Duration"
                value={preCourseTestDuration}
                onChange={(e) =>
                  setPreCourseTestDuration(Number(e.target.value))
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddOrUpdateTest}>
              {isEditMode ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TestsTab;

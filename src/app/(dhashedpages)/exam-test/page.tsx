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
  Switch,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const TestsTab = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const toast = useToast();

  const [rowData, setRowData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStep, setSelectedStep] = useState("");
  const [preCourseTestTitle, setPreCourseTestTitle] = useState("");
  const [preCourseTestDuration, setPreCourseTestDuration] = useState<
    number | ""
  >("");
  // const [stepNo, setStepNo] = useState<number | "">("");
  const [syllabusTextLine1, setSyllabusTextLine1] = useState(""); // New state
  const [syllabusTextLine2, setSyllabusTextLine2] = useState(""); // New state
  const [syllabusTextLine3, setSyllabusTextLine3] = useState(""); // New state
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Title",
      field: "pre_course_test_title",
      // minWidth: 250,
    },
    {
      headerName: "Date & Time",
      field: "created_date",
      // minWidth: 200,
      cellRenderer: (params: { value: any }) => {
        const date = new Date(params.value);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        return date.toLocaleDateString("en-IN", options);
      },
    },

    {
      headerName: "Total Time (Minutes)",
      field: "pre_course_test_duration_minutes",
      // maxWidth: 150,
      filter: false,
    },
    {
      headerName: "Step No", // New column for stepNo
      field: "step_no",
      // maxWidth: 100,
      filter: false,
    },
    {
      headerName: "Syllabus Line 1",
      field: "syllabus_text_line_1", // New column
      // minWidth: 200,
    },
    {
      headerName: "Syllabus Line 2",
      field: "syllabus_text_line_2", // New column
      // minWidth: 200,
    },
    {
      headerName: "Syllabus Line 3",
      field: "syllabus_text_line_3", // New column
    },
    {
      headerName: "Status",
      field: "status",
      cellStyle: { textAlign: "center" },
      filter: false,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80%",
          }}
        >
          <Switch
            colorScheme="green"
            onChange={() => handleToggle(params.data)}
            defaultChecked={params.value === 1}
          />
        </div>
      ),
    },
    {
      headerName: "Actions",
      filter: false,
      cellRenderer: (params: any) => (
        <div>
          <Button
            // leftIcon={<EditIcon />}
            colorScheme="blue"
            size="sm"
            onClick={() => handleEdit(params.data)}
            variant="outline"
          >
            Edit
          </Button>
          {/* <button onClick={() => handleDelete(params.data)}>Delete</button> */}
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
        .then((data) => {
          console.log("Fetched test data:", data);
          setRowData(data);
        })
        .catch((error) => console.error("Error fetching test data:", error));
    }
  }, [token, baseUrl]);

  // Fetch courses
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
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
      !preCourseTestDuration ||
      !syllabusTextLine1 ||
      !syllabusTextLine2 ||
      !syllabusTextLine3
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
    // formData.append("stepNo", String(stepNo));
    formData.append("syllabusTextLine1", syllabusTextLine1);
    formData.append("syllabusTextLine2", syllabusTextLine2);
    formData.append("syllabusTextLine3", syllabusTextLine3);

    const url = isEditMode
      ? `${baseUrl}/masters/pre-course-test/update`
      : `${baseUrl}/masters/pre-course-test/add`;
    if (isEditMode) {
      formData.append("preCourseTestId", String(currentTestId));
    }

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.errFlag === 0) {
          toast({
            title: "Success",
            description: data.message,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          fetchTests(); // Refresh the table
          resetForm();
          onModalClose();
        } else {
          toast({
            title: "Error",
            description: data.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.error(`Error ${isEditMode ? "updating" : "adding"} test:`, error);
        toast({
          title: "Error",
          description: `An error occurred while ${isEditMode ? "updating" : "adding"} the test.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleToggle = async (data: any) => {
    const newStatus = data.status === 1 ? 0 : 1;
    try {
      const response = await fetch(
        `${baseUrl}/masters/pre-course-test/change-status/${newStatus}/${data.id}/${token}`,
        { method: "GET" }
      );
      if (response.ok) {
        setRowData((prev) =>
          prev.map((row) =>
            row.id === data.id ? { ...row, status: newStatus } : row
          )
        );
        toast({
          title: "Success",
          description: "Status updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update status.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (data: any) => {
    setIsEditMode(true);
    setCurrentTestId(data.id);
    setSelectedCourse(data.course_id);
    setSelectedStep(data.course_step_details_master_id);
    setPreCourseTestTitle(data.pre_course_test_title);
    setPreCourseTestDuration(data.pre_course_test_duration_minutes);
    // setStepNo(data.step_no);
    setSyllabusTextLine1(data.syllabus_text_line_1);
    setSyllabusTextLine2(data.syllabus_text_line_2);
    setSyllabusTextLine3(data.syllabus_text_line_3);
    onModalOpen();
  };

  const resetForm = () => {
    setSelectedCourse("");
    setSelectedStep("");
    setPreCourseTestTitle("");
    setPreCourseTestDuration("");
    // setStepNo("");
    setSyllabusTextLine1("");
    setSyllabusTextLine2("");
    setSyllabusTextLine3("");
    setIsEditMode(false);
    setCurrentTestId(null);
    setSteps([]); // Clear steps when course changes or form resets
  };

  const handleModalClose = () => {
    resetForm();
    onModalClose();
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
          width: "100%", // Changed from 80vw to 100% to fit container
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px 10px 0px 0px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Exam Tests Data</p>
        <Button onClick={() => { setIsEditMode(false); resetForm(); onModalOpen(); }} colorScheme="green">
          Add Test
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}> {/* Changed from 80vw to 100% */}
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          // paginationAutoPageSize={true} // Consider removing if causing issues, or ensure it works as expected
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
        />
      </div>

      {/* Add/Edit Test Modal */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? "Edit Test" : "Add New Test"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedStep(""); // Reset step when course changes
                  setSteps([]); // Clear steps
                }}
              >
                {courses.map((course) => (
                  <option key={course.subject_id} value={course.subject_id}>
                    {course.subject_name}
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
                isDisabled={!selectedCourse || steps.length === 0}
              >
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.course_step_title} (Step No: {step.step_no})
                    </option>
                  ))
                ) : (
                  <option disabled>
                    {selectedCourse ? "No steps available for this subject" : "Select a subject first"}
                  </option>
                )}
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
            {/* <FormControl mb={4}>
              <FormLabel>Step No</FormLabel>
              <Input
                type="number"
                placeholder="Enter Step No"
                value={stepNo}
                onChange={(e) => setStepNo(Number(e.target.value))}
              />
            </FormControl> */}
            <FormControl mb={4}>
              <FormLabel>Syllabus Line 1</FormLabel>
              <Input
                placeholder="Enter Syllabus Line 1"
                value={syllabusTextLine1}
                onChange={(e) => setSyllabusTextLine1(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Syllabus Line 2</FormLabel>
              <Input
                placeholder="Enter Syllabus Line 2"
                value={syllabusTextLine2}
                onChange={(e) => setSyllabusTextLine2(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Syllabus Line 3</FormLabel>
              <Input
                placeholder="Enter Syllabus Line 3"
                value={syllabusTextLine3}
                onChange={(e) => setSyllabusTextLine3(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={handleModalClose}>
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

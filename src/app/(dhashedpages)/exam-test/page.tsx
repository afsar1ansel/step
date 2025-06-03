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
  const examBaseUrl = "https://step-exam-app-3utka.ondigitalocean.app";
  const toast = useToast();

  const [rowData, setRowData] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStep, setSelectedStep] = useState("");
  const [examTitle, setExamTitle] = useState(""); // Renamed from preCourseTestTitle
  const [examDurationMinutes, setExamDurationMinutes] = useState< // Renamed from preCourseTestDuration
    number | ""
  >("");
  const [syllabusTextLine1, setSyllabusTextLine1] = useState("");
  const [syllabusTextLine2, setSyllabusTextLine2] = useState("");
  const [syllabusTextLine3, setSyllabusTextLine3] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentExamId, setCurrentExamId] = useState<number | null>(null); // Renamed from currentTestId for clarity

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Title",
      field: "exam_title", // Changed from pre_course_test_title
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
      field: "exam_duration_minutes", // Changed from pre_course_test_duration_minutes
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

  // Fetch exams data
  useEffect(() => {
    if (token) {
      fetch(`${examBaseUrl}/masters/exam/get-all`, { // Changed endpoint
        headers: { // Added headers for token
          'Authorization': `Bearer ${token}`
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched exam data:", data);
          setRowData(data);
        })
        .catch((error) => console.error("Error fetching exam data:", error));
    }
  }, [token, examBaseUrl]);

  // Fetch courses
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`) // Assuming this endpoint is correct and separate
        .then((response) => response.json())
        .then((data) => setCourses(data))
        .catch((error) => console.error("Error fetching courses:", error));
    }
  }, [token, baseUrl]);

  // Fetch steps when a course is selected
  useEffect(() => {
    if (selectedCourse && token) {
      fetch(
        `${baseUrl}/masters/get-all-course-step-details/${selectedCourse}/${token}` // Assuming this endpoint is correct and separate
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
      !examTitle || // Changed from preCourseTestTitle
      !examDurationMinutes || // Changed from preCourseTestDuration
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
    // formData.append("token", token || ""); // Token will be sent in header
    formData.append("courseStepDetailsMasterId", selectedStep);
    formData.append("examTitle", examTitle); // Changed from preCourseTestTitle
    formData.append(
      "examDurationMinutes", // Changed from preCourseTestDurationMinutes
      String(examDurationMinutes) // Changed from preCourseTestDuration
    );
    formData.append("syllabusTextLine1", syllabusTextLine1);
    formData.append("syllabusTextLine2", syllabusTextLine2);
    formData.append("syllabusTextLine3", syllabusTextLine3);

    const url = isEditMode
      ? `${examBaseUrl}/masters/exam/update` // Changed endpoint
      : `${examBaseUrl}/masters/exam/add`; // Changed endpoint
    if (isEditMode) {
      formData.append("examId", String(currentExamId)); // Changed from preCourseTestId
    }

    fetch(url, {
      method: "POST",
      headers: { // Added headers for token
        'Authorization': `Bearer ${token}`
      },
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
        `${examBaseUrl}/masters/exam/change-status/${newStatus}/${data.id}`, // Changed endpoint, removed token from URL
        { 
          method: "GET",
          headers: { // Added headers for token
            'Authorization': `Bearer ${token}`
          }
        }
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
    setCurrentExamId(data.id); // Renamed state variable
    setSelectedCourse(data.course_id); 
    setSelectedStep(data.course_step_details_master_id);
    setExamTitle(data.exam_title); // Changed from pre_course_test_title
    setExamDurationMinutes(data.exam_duration_minutes); // Changed from pre_course_test_duration_minutes
    setSyllabusTextLine1(data.syllabus_text_line_1);
    setSyllabusTextLine2(data.syllabus_text_line_2);
    setSyllabusTextLine3(data.syllabus_text_line_3);
    onModalOpen();
  };

  const resetForm = () => {
    setSelectedCourse("");
    setSelectedStep("");
    setExamTitle(""); // Changed from setPreCourseTestTitle
    setExamDurationMinutes(""); // Changed from setPreCourseTestDuration
    setSyllabusTextLine1("");
    setSyllabusTextLine2("");
    setSyllabusTextLine3("");
    setIsEditMode(false);
    setCurrentExamId(null); // Renamed state variable
    setSteps([]); 
  };

  const handleModalClose = () => {
    resetForm();
    onModalClose();
  };

  const fetchTests = () => { // Renamed to fetchExams for clarity, but keeping as fetchTests to match original call
    if (token) {
      fetch(`${examBaseUrl}/masters/exam/get-all`, { // Changed endpoint
         headers: { // Added headers for token
          'Authorization': `Bearer ${token}`
        }
      })
        .then((response) => response.json())
        .then((data) => setRowData(data))
        .catch((error) => console.error("Error fetching exam data:", error));
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
          <ModalHeader>{isEditMode ? "Edit Exam" : "Add New Exam"}</ModalHeader>
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
              <FormLabel>Exam Title</FormLabel> 
              <Input
                placeholder="Enter Exam Title"
                value={examTitle} // Changed from preCourseTestTitle
                onChange={(e) => setExamTitle(e.target.value)} // Changed from setPreCourseTestTitle
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Exam Duration (Minutes)</FormLabel>
              <Input
                type="number"
                placeholder="Enter Exam Duration"
                value={examDurationMinutes} // Changed from preCourseTestDuration
                onChange={(e) =>
                  setExamDurationMinutes(Number(e.target.value)) // Changed from setPreCourseTestDuration
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

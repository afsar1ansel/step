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
  const [postCourseTestTitle, setPostCourseTestTitle] = useState("");
  const [postCourseTestDuration, setPostCourseTestDuration] = useState<
    number | ""
  >("");
  // const [stepNo, setStepNo] = useState<number | "">(""); // New state for stepNo
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
      headerName: "Date & Time",
      field: "dateTime",
      valueGetter: (params) =>
        `${params.data.created_date} ${params.data.created_time}`,
      // minWidth: 200,
    },
    {
      headerName: "Title",
      field: "post_course_test_title",
      // minWidth: 250,
    },
    {
      headerName: "Total Time (Minutes)",
      field: "post_course_test_duration_minutes",
      maxWidth: 150,
    },
    {
      headerName: "Step No", // New column for stepNo
      field: "step_no",
      maxWidth: 100,
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
      // minWidth: 200,
    },
    {
      headerName: "Status",
      field: "status",
      cellStyle: { textAlign: "center" },
      filter: false,
      maxWidth: 100,
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
      maxWidth: 100,
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
    },
  ]);

  // Fetch tests data
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/post-course-test-detail/get-all/${token}`)
        .then((response) => response.json())
        .then((data) => {
          setRowData(data);
          console.log(data);
        })
        .catch((error) => console.error("Error fetching test data:", error));
    }
  }, [token, baseUrl]);

  // Fetch courses
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
        .then((response) => response.json())
        .then((data) => {
          setCourses(data);
          console.log(data);
        })
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
      !postCourseTestTitle ||
      !postCourseTestDuration
      // ||
      // // !stepNo ||
      // !syllabusTextLine1 ||
      // !syllabusTextLine2 ||
      // !syllabusTextLine3
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
    formData.append("postCourseTestTitle", postCourseTestTitle);
    formData.append(
      "postCourseTestDurationMinutes",
      String(postCourseTestDuration)
    );
    // formData.append("stepNo", String(stepNo)); // Include stepNo in the form data
    formData.append("syllabusTextLine1", syllabusTextLine1); // Include syllabusTextLine1
    formData.append("syllabusTextLine2", syllabusTextLine2); // Include syllabusTextLine2
    formData.append("syllabusTextLine3", syllabusTextLine3); // Include syllabusTextLine3

    if (isEditMode) {
      formData.append("postCourseTestId", String(currentTestId));
      fetch(`${baseUrl}/masters/post-course-test/update`, {
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
            // console.error("Error updating test:", data.message);
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
          console.error("Error updating test:", error);
          toast({
            title: "Error",
            description: "An error occurred while updating the test.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      fetch(`${baseUrl}/masters/post-course-test/add`, {
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
          console.error("Error adding test:", error);
          toast({
            title: "Error",
            description: "An error occurred while adding the test.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  };

  const handleToggle = async (data: any) => {
    const newStatus = data.status === 1 ? 0 : 1;
    try {
      const response = await fetch(
        `${baseUrl}/masters/post-course-test/change-status/${newStatus}/${data.id}/${token}`,
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
    console.log("Edit clicked for:", data);
    setIsEditMode(true);
    setCurrentTestId(data.id);
    setSelectedCourse(data.subject_id);
    setSelectedStep(data.course_step_details_master_id);
    setPostCourseTestTitle(data.post_course_test_title);
    setPostCourseTestDuration(data.post_course_test_duration_minutes);
    // setStepNo(data.step_no); // Set stepNo for editing
    setSyllabusTextLine1(data.syllabus_text_line_1); // Set syllabusTextLine1
    setSyllabusTextLine2(data.syllabus_text_line_2); // Set syllabusTextLine2
    setSyllabusTextLine3(data.syllabus_text_line_3); // Set syllabusTextLine3
    onModalOpen();
  };

  const handleDelete = (data: any) => {
    console.log("Delete clicked for:", data);
    // Add delete logic here
  };

  const resetForm = () => {
    setSelectedCourse("");
    setSelectedStep("");
    setPostCourseTestTitle("");
    setPostCourseTestDuration("");
    // setStepNo(""); // Reset stepNo
    setSyllabusTextLine1(""); // Reset syllabusTextLine1
    setSyllabusTextLine2(""); // Reset syllabusTextLine2
    setSyllabusTextLine3(""); // Reset syllabusTextLine3
    setIsEditMode(false); // Reset edit mode
    setCurrentTestId(null);
    setSteps([]);
  };

  const handleModalClose = () => {
    resetForm(); // Reset the form and states
    onModalClose(); // Close the modal
  };

  const fetchTests = () => {
    if (token) {
      fetch(`${baseUrl}/masters/post-course-test-detail/get-all/${token}`)
        .then((response) => response.json())
        .then((data) => setRowData(data))
        .catch((error) => console.error("Error fetching test data:", error));
    }
  };

  return (
    <div style={{ width: "100%", height: "auto" }}>
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
          paginationPageSize={50}
          paginationPageSizeSelector={false}
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
          domLayout="autoHeight"
          suppressCellFocus={true}
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
                onChange={(e) => setSelectedCourse(e.target.value)}
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
                isDisabled={!selectedCourse}
              >
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.course_step_title}
                    </option>
                  ))
                ) : (
                  <option disabled>No data available</option>
                )}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Test Title</FormLabel>
              <Input
                placeholder="Enter Test Title"
                value={postCourseTestTitle}
                onChange={(e) => setPostCourseTestTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Test Duration (Minutes)</FormLabel>
              <Input
                type="number"
                placeholder="Enter Test Duration"
                value={postCourseTestDuration}
                onChange={(e) =>
                  setPostCourseTestDuration(Number(e.target.value))
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

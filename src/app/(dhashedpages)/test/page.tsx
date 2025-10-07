"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Box,
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
import { data } from "framer-motion/client";

ModuleRegistry.registerModules([AllCommunityModule]);

const TestsTab = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const toast = useToast();

  const [rowData, setRowData] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]); // Renamed from courses
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);

  // Filter states
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");

  // Modal states
  const [selectedCourseForModal, setSelectedCourseForModal] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStepId, setSelectedStepId] = useState(""); // The actual step ID

  const [preCourseTestTitle, setPreCourseTestTitle] = useState("");
  const [preCourseTestDuration, setPreCourseTestDuration] = useState<
    number | ""
  >("");
  const [syllabusTextLine1, setSyllabusTextLine1] = useState("");
  const [syllabusTextLine2, setSyllabusTextLine2] = useState("");
  const [syllabusTextLine3, setSyllabusTextLine3] = useState("");
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
      maxWidth: 150,
      filter: false,
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
      filter: false,
      maxWidth: 100,
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
    // Add this column if you want to show which course the test belongs to
    {
      headerName: "Course",
      field: "course_name",
      minWidth: 150,
    },
  ]);

  // Fetch tests based on selected course filter
  useEffect(() => {
    if (token && selectedCourseFilter) {
      fetch(
        `${baseUrl}/masters/pre-course-test/get-by-course/${selectedCourseFilter}/${token}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched test data:", data);
          setRowData(data);
        })
        .catch((error) => console.error("Error fetching test data:", error));
    }
  }, [token, baseUrl, selectedCourseFilter]);

  // Fetch all courses for filter dropdown
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/courses/get-all-courses/${token}`)
        .then((response) => response.json())
        .then((data) => {
          setAllCourses(data);
          const defaultCourse = data.find((c: any) => c.id === 1) || data[0];
          if (defaultCourse) {
            setSelectedCourseFilter(defaultCourse.id.toString());
          }
        })
        .catch((error) => console.error("Error fetching courses:", error));
    }
  }, [token, baseUrl]);

  // Fetch subjects when course is selected in modal
  useEffect(() => {
    if (selectedCourseForModal && token) {
      fetch(
        `${baseUrl}/masters/subjects/get-by-course/${selectedCourseForModal}/${token}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched subjects:", data);
          setSubjects(data);
        })
        .catch((error) => console.error("Error fetching subjects:", error));
    }
  }, [selectedCourseForModal, token, baseUrl]);

  // Fetch steps when subject is selected in modal
  useEffect(() => {
    if (selectedSubject && token && selectedCourseForModal) {
      fetch(
        `${baseUrl}/masters/get-steps-by-course-subject/${selectedCourseForModal}/${selectedSubject}/${token}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched steps:", data);
          if (data.errFlag === 1) {
            setSteps([]);
          } else {
            setSteps(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching steps:", error);
          setSteps([]);
        });
    }
  }, [selectedSubject, selectedCourseForModal, token, baseUrl]);

  const handleAddOrUpdateTest = () => {
    if (
      !selectedCourseForModal ||
      !selectedSubject ||
      !selectedStepId ||
      !preCourseTestTitle ||
      !preCourseTestDuration
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("token", token || "");
    formData.append("courseStepDetailsMasterId", selectedStepId);
    formData.append("preCourseTestTitle", preCourseTestTitle);
    formData.append(
      "preCourseTestDurationMinutes",
      String(preCourseTestDuration)
    );
    formData.append("syllabusTextLine1", syllabusTextLine1);
    formData.append("syllabusTextLine2", syllabusTextLine2);
    formData.append("syllabusTextLine3", syllabusTextLine3);

    if (isEditMode) {
      formData.append("preCourseTestId", String(currentTestId));
      fetch(`${baseUrl}/masters/pre-course-test/update`, {
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
            fetchTests();
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
      fetch(`${baseUrl}/masters/pre-course-test/add`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.errFlag === 0) {
            toast({
              title: "Success",
              description: data.message,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            fetchTests();
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
    console.log("Edit clicked for:", data);
    setIsEditMode(true);
    setCurrentTestId(data.id);

    // Need to derive courseId from the step
    setSelectedCourseForModal(data.course_id || "1"); // Assuming this exists in response
    setSelectedSubject(data.subject_id);
    setSelectedStepId(data.course_step_details_master_id);
    setPreCourseTestTitle(data.pre_course_test_title);
    setPreCourseTestDuration(data.pre_course_test_duration_minutes);
    setSyllabusTextLine1(data.syllabus_text_line_1);
    setSyllabusTextLine2(data.syllabus_text_line_2);
    setSyllabusTextLine3(data.syllabus_text_line_3);
    onModalOpen();
  };

  const resetForm = () => {
    setSelectedCourseForModal("");
    setSelectedSubject("");
    setSelectedStepId("");
    setPreCourseTestTitle("");
    setPreCourseTestDuration("");
    setSyllabusTextLine1("");
    setSyllabusTextLine2("");
    setSyllabusTextLine3("");
    setIsEditMode(false);
    setCurrentTestId(null);
    setSteps([]);
    setSubjects([]);
  };

  const handleModalClose = () => {
    resetForm();
    onModalClose();
  };

  const fetchTests = () => {
    if (token && selectedCourseFilter) {
      fetch(
        `${baseUrl}/masters/pre-course-test/get-by-course/${selectedCourseFilter}/${token}`
      )
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

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Box minW="200px">
            <Select
              placeholder="Select Course"
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
            >
              {allCourses &&
                allCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
            </Select>
          </Box>

          <Button onClick={onModalOpen} colorScheme="green">
            Add Test
          </Button>
        </div>
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
            {/* Course Selection */}
            <FormControl mb={4}>
              <FormLabel>Course</FormLabel>
              <Select
                placeholder="Select Course"
                value={selectedCourseForModal}
                onChange={(e) => {
                  setSelectedCourseForModal(e.target.value);
                  setSelectedSubject("");
                  setSelectedStepId("");
                  setSteps([]);
                  setSubjects([]);
                }}
              >
                {allCourses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Subject Selection */}
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedStepId("");
                }}
                isDisabled={!selectedCourseForModal}
              >
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Step Selection */}
            <FormControl mb={4}>
              <FormLabel>Step</FormLabel>
              <Select
                placeholder="Select Step"
                value={selectedStepId}
                onChange={(e) => setSelectedStepId(e.target.value)}
                isDisabled={!selectedSubject}
              >
                {steps.map((step: any) => (
                  <option key={step.id} value={step.id}>
                    Step {step.step_no}: {step.course_step_title}
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

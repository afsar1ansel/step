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
  useToast,
  Select,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone"; // Add this import

ModuleRegistry.registerModules([AllCommunityModule]);

const StudentsTab = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const toast = useToast();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Title",
      field: "notes_title",
      filter: true,
      floatingFilter: true,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Description",
      field: "notes_description",
      filter: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "No of Pages",
      field: "no_of_pages",
      filter: false,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Course",
      field: "document_url",
      filter: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { value: any; data: any }) => {
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => fetchDetail(params.value)}
              variant="outline"
            >
              View
            </Button>
          </div>
        );
      },
    },
    {
      headerName: "Created Date",
      field: "created_date",
      filter: true,
      cellStyle: { textAlign: "left" },
      cellRenderer: (params: { value: any; data: any }) => {
        const date = new Date(params.value);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        return (
          <div>
            {date.toLocaleDateString("en-IN", options)}{" "}
            {params.data.created_time}{" "}
          </div>
        );
      },
    },
    {
      headerName: "status",
      field: "status",
      filter: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { value: any; data: any; api: any }) => {
        const toggleSubscription = async (newValue: number) => {
          try {
            const videoLearningId = params.data.id;
            const token = localStorage.getItem("token") || "";

            const response = await fetch(
              `${baseUrl}/notes-content/change-status/${newValue}/${videoLearningId}/${token}`
            );
            const data = await response.json();
            console.log(data);

            params.data.status = newValue;
            params.api.applyTransaction({ update: [params.data] });
          } catch (error) {
            console.error("Error updating status:", error);
          }
        };

        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Switch
              isChecked={params.value == 1}
              colorScheme="green"
              onChange={() => toggleSubscription(params.value == 1 ? 0 : 1)}
            />
          </div>
        );
      },
    },
    {
      headerName: "Action",
      field: "action",
      filter: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { value: any; data: any }) => {
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
              variant="outline"
            >
              Edit
            </Button>
          </div>
        );
      },
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  // fetching data
  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/notes-content/get-all/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setRowData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const fetchDetail = async (url: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/notes-content/display/presign-url/${token}/${url}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch PDF. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (data.errFlag === 0 && data.downloadUrl) {
        // Open the presigned URL directly
        window.open(data.downloadUrl, "_blank");
      } else {
        toast({
          title: "Error",
          description: data.message || "Could not fetch PDF",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Error fetching PDF:", error);
      toast({
        title: "Error",
        description: "Failed to fetch PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

  // State for Add Student Form
  const {
    isOpen: isVideoModalOpen,
    onOpen: onVideoModalOpen,
    onClose: onVideoModalClose,
  } = useDisclosure();

  const [noteId, setnoteId] = useState("");
  const [noteDescription, setnoteDescription] = useState<any>(null);
  const [noteTitle, setnoteTitle] = useState("");
  const [noOfPages, setnoOfPages] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [stepNo, setStepNo] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // Add this state

  const handleEdit = (data: any) => {
    setnoteTitle(data.notes_title);
    setnoOfPages(data.no_of_pages);
    setnoteDescription(data.notes_description);
    setnoteId(data.id);
    setSelectedCourse(data.course_id); // Set courseId
    setSelectedStep(data.subject_id); // Set subjectId
    onEditModalOpen();
  };

  const handleAddStudent = () => {
    const token = localStorage.getItem("token") ?? "";
    const form = new FormData();
    form.append("token", token);
    form.append("notesTitle", noteTitle);
    form.append("notesDescription", noteDescription);
    form.append("noOfPages", noOfPages);
    form.append("courseId", selectedCourse); // Changed from courseStepDetailMasterId
    form.append("subjectId", selectedStep); // Add subjectId
    if (uploadedFile) {
      // Clean filename before upload
      const cleanFileName = uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const renamedFile = new File([uploadedFile], cleanFileName, {
        type: uploadedFile.type,
      });
      form.append("pdfFile", renamedFile);
    }
    console.log(Object.fromEntries(form.entries()));

    try {
      fetch(`${baseUrl}/notes-content/add`, {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          fetchData();
          if (data.errFlag == 0) {
            toast({
              title: "Success",
              description: `Note Added Successfully, Selected Course: ${selectedCourse}`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            resetForm();
            onAddModalClose();
          } else {
            toast({
              title: "Error",
              description: "Note Not Added",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        });
    } catch (error) {
      console.error("Error adding Note:", error);
    }
  };

  const handleEditStudent = () => {
    const token = localStorage.getItem("token") ?? "";
    const form = new FormData();
    form.append("token", token);
    form.append("noteId", noteId);
    form.append("notesTitle", noteTitle);
    form.append("notesDescription", noteDescription);
    form.append("noOfPages", noOfPages);
    form.append("courseId", selectedCourse); // Changed from courseStepDetailMasterId
    form.append("subjectId", selectedStep); // Changed from selectedStep
    if (uploadedFile) {
      form.append("pdfFile", uploadedFile);
    }

    console.log(Object.fromEntries(form.entries()));

    try {
      fetch(`${baseUrl}/notes-content/update`, {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          fetchData();
          if (data.errFlag == 0) {
            toast({
              title: "Success",
              description: "Notes Updated Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            resetForm();
            onEditModalClose();
          } else {
            toast({
              title: "Error",
              description: "Notes Not Updated",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        });
    } catch (error) {
      console.error("Error updating Notes:", error);
    }
  };

  const resetForm = () => {
    setnoteTitle("");
    setnoOfPages("");
    setStepNo("");
    setSelectedCourse("");
    setSelectedStep("");
    setnoteDescription(null);
    setUploadedFile(null); // Reset uploaded file
  };

  const onAddModalOpenWithReset = () => {
    resetForm(); // Clear the form fields
    onAddModalOpen(); // Open the modal
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Allow only one file
  });

  // Fetch courses
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    } else {
      fetch(`${baseUrl}/masters/courses/get-all-courses/${token}`)
        .then((response) => response.json())
        .then((data) => {
          setCourses(data);
          console.log(data);
        })
        .catch((error) => console.error("Error fetching courses:", error));
    }
  }, [baseUrl]);

  // Fetch steps when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      const token = localStorage.getItem("token");
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
        .then((response) => response.json())
        .then((data) => setSteps(data))
        .catch((error) => console.error("Error fetching steps:", error));
    }
  }, [selectedCourse, baseUrl]);

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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Notes</p>
        <Button onClick={onAddModalOpenWithReset} colorScheme="green">
          Add Notes
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={false}
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
          domLayout="autoHeight"
          suppressCellFocus={true}
        />
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Notes Title</FormLabel>
              <Input
                placeholder="Enter Notes Title"
                value={noteTitle}
                onChange={(e) => setnoteTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>No Of Pages</FormLabel>
              <Input
                placeholder="No. Of Pages"
                type="number"
                value={noOfPages}
                onChange={(e) => setnoOfPages(e.target.value)}
              />
            </FormControl>
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
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                isDisabled={!selectedCourse}
              >
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <option key={step.subject_id} value={step.subject_id}>
                      {step.subject_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No data available</option>
                )}
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Notes Description</FormLabel>
              <textarea
                placeholder="Enter Notes Description"
                value={noteDescription}
                onChange={(e) => setnoteDescription(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  resize: "none",
                }}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Upload File</FormLabel>
              <div
                {...getRootProps()}
                style={{
                  border: "2px dashed #CBD5E0",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: isDragActive ? "#EDF2F7" : "white",
                }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : uploadedFile ? (
                  <p>Uploaded File: {uploadedFile.name}</p>
                ) : (
                  <p>Drag & drop a file here, or click to select one</p>
                )}
              </div>
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
              <FormLabel>Notes Title</FormLabel>
              <Input
                placeholder="Enter Note Title"
                value={noteTitle}
                onChange={(e) => setnoteTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>No Of Pages</FormLabel>
              <Input
                placeholder="No. Of Pages"
                type="number"
                value={noOfPages}
                onChange={(e) => setnoOfPages(e.target.value)}
              />
            </FormControl>
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
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                isDisabled={!selectedCourse}
              >
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <option key={step.subject_id} value={step.subject_id}>
                      {step.subject_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No data available</option>
                )}
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Notes Description</FormLabel>
              <textarea
                placeholder="Enter Notes Description"
                value={noteDescription}
                onChange={(e) => setnoteDescription(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  resize: "none",
                }}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Upload File</FormLabel>
              <div
                {...getRootProps()}
                style={{
                  border: "2px dashed #CBD5E0",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: isDragActive ? "#EDF2F7" : "white",
                }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : uploadedFile ? (
                  <p>Uploaded File: {uploadedFile.name}</p>
                ) : (
                  <p>Drag & drop a file here, or click to select one</p>
                )}
              </div>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleEditStudent}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Video Player Modal */}
      {/* <Modal isOpen={isVideoModalOpen} onClose={onVideoModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Video Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div
              style={{
                width: "100%",
                height: "0",
                paddingBottom: "56.25%",
                position: "relative",
              }}
            >
              <iframe
                src={currentVideoLink}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal> */}
    </div>
  );
};

export default StudentsTab;

"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
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
import { IoMdDownload } from "react-icons/io";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
  AllCommunityModule,
]);

const College = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const toast = useToast();
  const gridRef = useRef<AgGridReact>(null);

  const onExportClick = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv();
  }, []);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "College Name",
      field: "college_name",
      filter: true,
      floatingFilter: true,
      cellStyle: { textAlign: "left" },
      flex: 3,
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
      headerName: "Status",
      field: "status",
      filter: false,
      maxWidth: 100,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { value: any; data: any; api: any }) => {
        const toggleSubscription = async (newValue: number) => {
          try {
            const collageId = params.data.id;
            const token = localStorage.getItem("token") || "";

            const response = await fetch(
              `${baseUrl}/colleges/update-status/${collageId}/${newValue}/${token}`
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
      maxWidth: 100,
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
      const response = await fetch(`${baseUrl}/colleges/get-all/${token}`, {
        method: "GET",
      });
      const data = await response.json();
      setRowData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const fetchDetail = async (Url: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/notes-content/display/presign-url/${token}/${Url}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      // console.log(data);

      if (data.errFlag === 0 && data.downloadUrl) {
        // Open the download URL in a new tab
        window.open(data.downloadUrl, "_blank");
      } else {
        console.error("Error: Invalid response or download URL not found");
      }
    } catch (error) {
      console.error("Error fetching video detail:", error);
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
    // setUploadedFile(data.document_url);
    onEditModalOpen();
  };

  // const handleDelete = (data: any) => {
  //   setRowData((prev) => prev.filter((student) => student.id !== data.id));
  // };

  const handleAddStudent = () => {
    resetForm();
    const token = localStorage.getItem("token") ?? "";
    const form = new FormData();
    form.append("token", token);
    form.append("collegeName", noteTitle);
    // form.append("notesDescription", noteDescription);
    // form.append("noOfPages", noOfPages);
    // form.append("courseStepDetailMasterId", selectedCourse);
    // if (uploadedFile) {
    //   form.append("pdfFile", uploadedFile);
    // }
    console.log(Object.fromEntries(form.entries()));

    try {
      fetch(`${baseUrl}/colleges/add`, {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          fetchData();
          if (data.errFlag == 0) {
            toast({
              title: "Success",
              description: "College Added Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Error",
              description: "College Not Added",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        });
    } catch (error) {
      console.error("Error adding College:", error);
    }

    resetForm();
    onAddModalClose();
  };

  const handleEditStudent = () => {
    const token = localStorage.getItem("token") ?? "";
    const form = new FormData();
    form.append("token", token);
    form.append("collegeId", noteId);
    form.append("collegeName", noteTitle);
    // form.append("notesDescription", noteDescription);
    // form.append("noOfPages", noOfPages);
    // form.append("courseStepDetailMasterId", selectedStep);
    // if (uploadedFile) {
    //   form.append("pdfFile", uploadedFile);
    // }

    console.log(Object.fromEntries(form.entries()));

    try {
      fetch(`${baseUrl}/colleges/update`, {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          fetchData();
          if (data.errFlag == 0) {
            toast({
              title: "Success",
              description: "Notes Updated Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
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

    resetForm();
    onEditModalClose();
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

  // // Fetch courses
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     return;
  //   } else {
  //     fetch(`${baseUrl}/masters/courses/get-all-courses/${token}`)
  //       .then((response) => response.json())
  //       .then((data) => setCourses(data))
  //       .catch((error) => console.error("Error fetching courses:", error));
  //   }
  // }, [baseUrl]);

  // // Fetch steps when a course is selected
  // useEffect(() => {
  //   if (selectedCourse) {
  //     const token = localStorage.getItem("token");
  //     fetch(
  //       `${baseUrl}/masters/get-all-course-step-details/${selectedCourse}/${token}`
  //     )
  //       .then((response) => response.json())
  //       .then((data) => setSteps(data))
  //       .catch((error) => console.error("Error fetching steps:", error));
  //   }
  // }, [selectedCourse, baseUrl]);

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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>College</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            onClick={onExportClick}
            colorScheme="blue"
            leftIcon={<IoMdDownload />}
          >
            Export CSV
          </Button>
          <Button onClick={onAddModalOpenWithReset} colorScheme="green">
            Add College
          </Button>
        </div>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          ref={gridRef}
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
          <ModalHeader>Add College</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>College Name</FormLabel>
              <Input
                placeholder="Enter College Name"
                value={noteTitle}
                onChange={(e) => setnoteTitle(e.target.value)}
              />
            </FormControl>
            {/* <FormControl mt={4}>
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
              <FormLabel>Course Step</FormLabel>
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

            <FormControl mt={4}>
              <FormLabel>Notes Description</FormLabel>
              <textarea
                placeholder="Enter Video Description"
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
            </FormControl> */}
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
          <ModalHeader>Edit College</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>College Name</FormLabel>
              <Input
                placeholder="Enter College Name"
                value={noteTitle}
                onChange={(e) => setnoteTitle(e.target.value)}
              />
            </FormControl>
            {/* <FormControl mt={4}>
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
              <FormLabel>Course Step</FormLabel>
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

            <FormControl mt={4}>
              <FormLabel>Notes Description</FormLabel>
              <textarea
                placeholder="Enter Video Description"
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
            </FormControl> */}
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
    </div>
  );
};

export default College;

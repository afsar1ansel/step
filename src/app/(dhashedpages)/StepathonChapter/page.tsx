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

import dynamic from "next/dynamic";
// Dynamically importing ExamEditorComponent to prevent SSR issues
const ExamEditorComponent = dynamic(
  () => import("@/app/componant/examEditor"),
  {
    ssr: false,
  }
);
import ContentFormatter from "@/app/componant/ContentFormatter";

ModuleRegistry.registerModules([AllCommunityModule]);

const StepathonChapter = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const gameUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const toast = useToast();

  const [rowData, setRowData] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  // Filter states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");

  // Modal states
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState("");

  const [preChapterTestTitle, setPreChapterTestTitle] = useState("");

  const [description, setDescription] = useState<any>({ blocks: [] });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<number | null>(null);

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Name",
      field: "name",
      // minWidth: 250,
    },
    {
      headerName: "Date & Time",
      field: "created_at",
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
      headerName: "Description",
      field: "int_desc",
      // maxWidth: 150,
      filter: false,
      flex: 1,
      cellRenderer: (params: any) => {
        return <ContentFormatter content={params.value} />;
      },
      cellStyle: {
        height: "100%",
        padding: "8px",
      },
      autoHeight: true,
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
  ]);

  // Fetch Chapter based on selected subject filter
  useEffect(() => {
    if (token && selectedSubjectFilter) {
      const url = `${gameUrl}/masters/chapter/get-by-subject/${selectedSubjectFilter}`;
      // console.log(url);

      const requestOptions = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      fetch(url, requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("Fetched test data:", data);
          setRowData(data);
        })
        .catch((error) => console.error("Error fetching test data:", error));
    }
  }, [token, gameUrl, selectedSubjectFilter]);

  // Fetch all subjects for filter dropdown
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched subjects:", data);
          setAllSubjects(data);
          const defaultCourse =
            data.find((c: any) => c.subject_id === 1) || data[0];
          if (defaultCourse) {
            setSelectedSubjectFilter(defaultCourse.subject_id.toString());
          }
        })
        .catch((error) => console.error("Error fetching subjects:", error));
    }
  }, [token, baseUrl]);

  const handleAddOrUpdateTest = () => {
    if (!selectedSubjectForModal || !description || !preChapterTestTitle) {
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
    formData.append("subjectId", selectedSubjectForModal);
    formData.append("name", preChapterTestTitle);
    formData.append("intDesc", JSON.stringify(description));

    if (isEditMode) {
      formData.append("chapterId", String(currentChapterId));
      console.log(Object.fromEntries(formData));
      fetch(`${gameUrl}/masters/chapter/update`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
            fetchChapters();
            resetForm();
            onModalClose();
          } else {
            toast({
              title: "Error Updating chapter",
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
      fetch(`${gameUrl}/masters/chapter/add`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
            fetchChapters();
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
        `${gameUrl}/masters/chapter/change-status/${newStatus}/${data.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const resData = await response.json();
      console.log(resData);

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
    setCurrentChapterId(data.id);

    // Need to derive courseId from the step
    setSelectedSubjectForModal(data.subject_id || "1"); // Assuming this exists in response
    setPreChapterTestTitle(data.name);

    // Parse description if it's a string, otherwise use as is
    let parsedDescription = { blocks: [] };
    if (data.int_desc) {
      try {
        parsedDescription =
          typeof data.int_desc === "string"
            ? JSON.parse(data.int_desc)
            : data.int_desc;
      } catch (error) {
        console.error("Error parsing description:", error);
        parsedDescription = { blocks: [] };
      }
    }
    setDescription(parsedDescription);
    onModalOpen();
  };

  const resetForm = () => {
    setSelectedSubjectForModal("");
    setPreChapterTestTitle("");
    setDescription("");
    setIsEditMode(false);
    setCurrentChapterId(null);
  };

  const handleModalClose = () => {
    resetForm();
    onModalClose();
  };

  const fetchChapters = () => {
    if (token && selectedSubjectFilter) {
      fetch(
        `${gameUrl}/masters/chapter/get-by-subject/${selectedSubjectFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Chapters </p>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Box minW="200px">
            <Select
              placeholder="Select Subject"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            >
              {allSubjects &&
                allSubjects.map((course: any) => (
                  <option key={course.subject_id} value={course.subject_id}>
                    {course.subject_name}
                  </option>
                ))}
            </Select>
          </Box>

          <Button onClick={onModalOpen} colorScheme="green">
            Add Chapter
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
          <ModalHeader>
            {isEditMode ? "Edit Chapter" : "Add New Chapter"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Course Selection */}
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedSubjectForModal}
                onChange={(e) => {
                  setSelectedSubjectForModal(e.target.value);
                }}
              >
                {allSubjects.map((course: any) => (
                  <option key={course.subject_id} value={course.subject_id}>
                    {course.subject_name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter Name"
                value={preChapterTestTitle}
                onChange={(e) => setPreChapterTestTitle(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <ExamEditorComponent
                  data={description}
                  onChange={setDescription}
                  holder="concepts-chapter-description-editor"
                />
              </div>
              {/* <Input
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              /> */}
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

export default StepathonChapter;

"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
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
import { TbReceiptYuan } from "react-icons/tb";
import { sub } from "framer-motion/client";

ModuleRegistry.registerModules([AllCommunityModule]);

const SubjectMaster = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    fetchData();
    fetchCourseData();
  }, []);

  async function fetchCourseData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/masters/courses/get-all-courses/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log(data);
      setallCourse(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/masters/subjects/get-all-subjects/${token}`,
        {
          method: "GET",
        }
      );

      // if (!response.ok) {
      //   throw new Error("Network response was not ok");
      // }

      const data = await response.json();
      setRowData(data);
      console.log(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const [rowData, setRowData] = useState<any[]>();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
      cellRenderer: (params: any) => {
        return params.node.rowIndex + 1;
      },
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Course Name",
      field: "course_name",
      // minWidth: 180,
    },
    {
      headerName: "Subject Name",
      field: "subject_name",
      // minWidth: 180,
    },
    // {
    //   headerName: "Course Code",
    //   field: "course_id",
    //   cellStyle: { textAlign: "center" },
    //   // maxWidth: 120,
    // },
    {
      headerName: "Course Created By",
      field: "created_admin_user_id",
      cellRenderer: (params: any) => {
        // console.log(params);
        return params.value == 1 ? "Admin" : "Sub Admin";
      },
    },
    {
      field: "subject_status",
      headerName: "Status",
      filter: false,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        // console.log(params.value),
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Switch
            colorScheme="green"
            onChange={(event) => handleToggle(params.data)}
            defaultChecked={params.value === 1 ? true : false}
          />
        </div>
      ),
    },
    {
      headerName: "Creation date",
      field: "created_date",
    },
    {
      headerName: "Actions",
      filter: false,
      cellRenderer: (params: any) => {
        return (
          <HStack spacing={2}>
            <Button
              // leftIcon={<EditIcon />}
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
              variant="outline"
            >
              Edit
            </Button>
            {/* <Button
                // leftIcon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                onClick={() => handleDelete(params.data)}
                variant="outline"
              >
                Delete
              </Button> */}
          </HStack>
        );
      },
    },
  ]);

  //toggle function for switch button
  const handleToggle = async (data: any) => {
    console.log(data);
    try {
      const token = localStorage.getItem("token") ?? "";
      const status = data.course_status == 1 ? 0 : 1; // Toggle status between 0 and 1
      console.log(status);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/subjects/update-subject-status/${status}/${data.subject_id}/${token}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
  };

  // State for Add Subject Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Subject Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const [currentSubject, setCurrentSubject] = useState<any>(null);
  const [subjectName, setSubjectName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [createdAdminUserId, setCreatedAdminUserId] = useState("");
  const [subjectId, setsubjectId] = useState<any>([]);
  // const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [allCourse, setallCourse] = useState<any>([]);

  const handleEdit = (data: any) => {
    // console.log(data)
    setSubjectName(data.subject_name);
    setCourseId(data.course_id);
    setsubjectId(data.subject_id);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev?.filter((subject) => subject.id !== data.id));
  };

  const handleAddSubject = async () => {
    console.log(subjectName, courseId, createdAdminUserId);
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("subjectName", subjectName);
      form.append("courseId", courseId);
      form.append("token", token);
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/subjects/add`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      //  console.log(responseData);
      fetchData();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Subject added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      resetForm();
      onAddModalClose();
    }
  };

  const handleUpdateSubject = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("subjectName", subjectName);
      form.append("subjectId", subjectId);
      form.append("courseId", courseId);
      form.append("token", token);
      // console.log(Object.fromEntries(form.entries()));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/subjects/update-subject`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      fetchData();
      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Subject updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      resetForm();
      onEditModalClose();
    }
  };

  const resetForm = () => {
    setSubjectName("");
    setCourseId("");
    setCreatedAdminUserId("");

    setCurrentSubject(null);
  };

  return (
    <div style={{ width: "80vw", height: "60vh" }}>
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Subject</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Subject
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

      {/* Add Subject Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Subject Name</FormLabel>
              <Input
                placeholder="Enter Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />

              <FormLabel> Select Course</FormLabel>
              <Select
                placeholder="Select option"
                onChange={(e) => setCourseId(e.target.value)}
              >
                {allCourse.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddSubject}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Subject Name</FormLabel>
              <Input
                placeholder="Enter Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
              <FormLabel>Select Course</FormLabel>
              <Select
                placeholder="Select option"
                onChange={(e) => setCourseId(e.target.value)}
              >
                {allCourse.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUpdateSubject}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubjectMaster;

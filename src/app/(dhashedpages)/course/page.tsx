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
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  IconButton,
  HStack,
  useToast,
} from "@chakra-ui/react";
// import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

import Select from "react-select";

ModuleRegistry.registerModules([AllCommunityModule]);

const CourseMaster = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const toast = useToast();
  useEffect(() => {
    fetcherData();
  }, []);

  //fetcher to get all course data

  async function fetcherData() {
    // const tok =
    //   typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const tok = localStorage.getItem("token");
    // console.log(tok);
    try {
      const response = await fetch(
        `${baseUrl}/masters/courses/get-all-courses/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      setRowData(responseData);
    } catch {
      (error: Error) => {
        console.error("Error fetching data:", error);
      };
    }
  }

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
      field: "course_name",
      minWidth: 180,
    },
    // {
    //   headerName: "Assigned Subjects",
    //   field: "subjects",
    //   cellRenderer: (params: any) => {
    //     return params.value.join(", ");
    //   },
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
      field: "status",
      headerName: "Access",
      filter: false,
      maxWidth: 150,
      cellRenderer: (params: any) => (
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
            defaultChecked={params.data.status}
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
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState(""); // Added discount price state
  const [editRowId, setEditRowId] = useState("");
  const [createdAdminUserId, setcreatedAdminUserId] = useState("");

  const handleEdit = (data: any) => {
    // setCurrentCourse(data);
    setEditRowId(data.id);
    setCourseName(data.name);
    // setTeacherSubjects(data.subjects);
    // setPrice(data.price);
    // setDiscountPrice(data.discountPrice); // Set discount price
    // setcreatedAdminUserId(data.createdAdminUserId);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((course) => course.id !== data.id));
  };

  //toggle function for switch button
  const handleToggle = async (data: any) => {

    console.log(data.id);
    try{
      const token = localStorage.getItem("token") ?? "";
const status = data.status ? 0 : 1; // Toggle status between 0 and 1
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/courses/change-course-status/${status}/${data.id}/${token}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);

    } catch (error) {
      console.error("Error toggling course status:", error);
    }

  }

  const handleAddCourse = async () => {
    // const newCourse = {
    //   id: String(rowData.length + 1),
    //   name: courseName,
    //   // subjects: teacherSubjects,
    //   // price: price,
    //   // discountPrice: discountPrice, // Added discount price
    //   createdAdminUserId: createdAdminUserId,
    // };
    // setRowData((prev) => [...prev, newCourse]);
    try{
      const form = new FormData();
      form.append("courseName", courseName);
      form.append("createdAdminUserId", createdAdminUserId);
      form.append("token", localStorage.getItem("token") ?? "");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/courses/add`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      fetcherData(); // Fetch updated data after adding a new course
      // setRowData((prev) => [...prev, responseData]);
        
      if (responseData.errFlag == 0) {
        toast({
          title: "Course added successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Error adding course.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }


    }
    catch (error) {
      console.error("Error adding course:", error);
    }
    finally {
      // console.log("we are at finally block");
    resetForm();
    onAddModalClose();
    }
  };

  const handleUpdateCourse = async () => {
    // const updatedCourse = {
    //   id: currentCourse.id,
    //   name: courseName,
    //   // subjects: teacherSubjects,
    //   price: price,
    //   discountPrice: discountPrice, // Added discount price
    //   createdAdminUserId: createdAdminUserId,
    // };
    // setRowData((prev) =>
    //   prev.map((course) =>
    //     course.id === currentCourse.id ? updatedCourse : course
    //   )
    // );

       try {
         const form = new FormData();
         form.append("courseName", courseName);
         form.append("courseId", editRowId);
         form.append("token", localStorage.getItem("token") ?? "");

         console.log(Object.fromEntries(form));

         const response = await fetch(
           `${process.env.NEXT_PUBLIC_BASE_URL}/masters/courses/update-course`,
           {
             method: "POST",
             body: form,
           }
         );
         const responseData = await response.json();
         console.log(responseData);
         fetcherData(); // Fetch updated data after adding a new course
         // setRowData((prev) => [...prev, responseData]);

         if (responseData.errFlag == 0) {
           toast({
             title: "Course updated successfully.",
             description: responseData.message,
             status: "success",
             duration: 3000,
             isClosable: true,
             position: "top",
           });
         } else {
           toast({
             title: "Error updating course.",
             description: responseData.message,
             status: "error",
             duration: 3000,
             isClosable: true,
             position: "top",
           });
         }
       } catch (error) {
         console.error("Error adding course:", error);
       } finally {
         // console.log("we are at finally block");
         resetForm();
         onAddModalClose();
       }
    resetForm();
    onEditModalClose();
  };

  const resetForm = () => {
    setCourseName("");
    setTeacherSubjects([]);
    setPrice("");
    setDiscountPrice(""); // Reset discount price
    setcreatedAdminUserId("");
    setCurrentCourse(null);
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
          suppressCellFocus={true}
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
              {/* <FormLabel>Assign Subject</FormLabel>
              <Select
                isMulti
                options={subjectOptions}
                value={subjectOptions.filter((option) =>
                  teacherSubjects.includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  setTeacherSubjects(
                    selectedOptions.map((option) => option.value)
                  )
                }
              /> */}
              <br />
              {/* <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
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
              </Grid> */}
              <FormLabel>createdAdminUserId</FormLabel>
              <Input
                placeholder="Enter created Admin User Id"
                value={createdAdminUserId}
                onChange={(e) => setcreatedAdminUserId(e.target.value)}
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
              {/* <FormLabel>Assign Subject</FormLabel>
              <Select
                isMulti
                options={subjectOptions}
                value={subjectOptions.filter((option) =>
                  teacherSubjects.includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  setTeacherSubjects(
                    selectedOptions.map((option) => option.value)
                  )
                }
              /> */}

              <br />
              {/* <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
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
              </Grid> */}
              {/* <FormLabel>created Admin User Id</FormLabel>
              <Input
                placeholder="Enter created Admin User Id"
                value={createdAdminUserId}
                onChange={(e) => setcreatedAdminUserId(e.target.value)}
              /> */}
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

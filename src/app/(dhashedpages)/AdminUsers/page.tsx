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
import { Spinner, Center, CircularProgress } from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const AdminUsers = () => {
  const toast = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/admin-users/get-all-Admin-users/${token}`,
        {
          method: "GET",
        }
      );
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
      headerName: "Name",
      field: "username",
      // minWidth: 180,
    },
    {
      headerName: "Email",
      field: "email",
    },
    {
      headerName: "Creation date",
      field: "created_date",
    },
    {
      field: "status",
      headerName: "Access",
      filter: false,
      maxWidth: 100,
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
      headerName: "Actions",
      filter: false,
      maxWidth: 100,
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
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const status = data.status == 1 ? 0 : 1;
      console.log(status);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin-users/change-user-status/${status}/${data.id}/${token}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
    setLoading(false);
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

  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [role, setrole] = useState("");
  const [userId, setuserId] = useState("");
  const [password, setpassword] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  // const [allCourse, setallCourse] = useState<any>([]);

  const handleEdit = (data: any) => {
    // console.log(data);
    setname(data.username);
    setemail(data.email);
    setrole(data.role);
    setpassword(data.password);
    setuserId(data.id);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev?.filter((subject) => subject.id !== data.id));
  };

  const handleAddSubject = async () => {
    // console.log(name, email, role , password);
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("username", name);
      form.append("email", email);
      form.append("password", password);
      form.append("role", role);
      form.append("token", token);
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin-users/add`,
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
          description: "Subject added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchData();
        resetForm();
        onAddModalClose();
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
    }

    setLoading(false);
  };

  const handleUpdateSubject = async () => {
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("username", name);
      form.append("email", email);
      form.append("password", password);
      form.append("roleId", role);
      form.append("adminUserId", userId);
      form.append("token", token);
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin-users/update-admin-user`,
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
        resetForm();
        onEditModalClose();
      } else {
        toast({
          title: "Error",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    setname("");
    setemail("");
    setrole("");
    setpassword("");
  };

  const allRole = [
    { id: 0, course_name: "Admin" },
    { id: 1, course_name: "Teacher" },
    // { id: 3, course_name: "Student" },
  ];

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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Admin Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add New User
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
          // getRowHeight={function (params) {
          //   const description = params.data?.banner_description || "";
          //   const words = description.split(" ").length;
          //   const baseHeight = 50;
          //   const heightPerWord = 6;
          //   const minHeight = 50;
          //   const calculatedHeight = baseHeight + words * heightPerWord;
          //   return Math.max(minHeight, calculatedHeight);
          // }}
          domLayout="autoHeight"
          suppressCellFocus={true}
        />
      </div>

      {/* Add Subject Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />

              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />

              <FormLabel>password</FormLabel>
              <Input
                placeholder="Enter password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
              />

              <FormLabel>Role</FormLabel>
              <Select
                placeholder="Select option"
                onChange={(e) => setrole(e.target.value)}
              >
                {allRole.map((course: any) => (
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
            <Button
              colorScheme="green"
              onClick={handleAddSubject}
              isLoading={loading}
            >
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
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter Subject Name"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />

              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
              />

              <FormLabel>password</FormLabel>
              <Input
                placeholder="Enter password"
                value={password}
                onChange={(e) => setpassword(e.target.value)}
              />

              <FormLabel>Role</FormLabel>
              <Select
                placeholder="Select option"
                onChange={(e) => setrole(e.target.value)}
              >
                {allRole.map((course: any) => (
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
            <Button
              colorScheme="green"
              onClick={handleUpdateSubject}
              isLoading={loading}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {loading && (
        <Center
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={10}
        >
          <Spinner
            size="xl"
            color="blue.500"
            thickness="4px"
            emptyColor="gray.200"
            speed="0.65s"
          />
        </Center>
      )}
    </div>
  );
};

export default AdminUsers;

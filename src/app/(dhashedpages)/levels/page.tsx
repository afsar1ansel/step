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

const Levels = () => {
  const toast = useToast();
  const baseUrl = 'https://step-game-app-jvzwm.ondigitalocean.app/api';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/admin/game/get-all-levels/${token}`,
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

  // [
  //   {
  //     created_admin_user_id: 5,
  //     created_date: "Tue, 01 Jul 2025 00:00:00 GMT",
  //     description: "Leve 1 for 1st year all subjects ",
  //     id: 1,
  //     level_name: "LEVEL 1",
  //     status: 1,
  //   },
  // ];

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
      cellRenderer: (params: any) => {
        return params.node.rowIndex + 1;
      },
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Level",
      field: "level_name",
      // minWidth: 180,
    },
    {
      headerName: "Priority",
      field: "priority",
    },
    {
      headerName: "Description",
      field: "description",
      minWidth: 200,
      cellStyle: { textAlign: "left" },
    },
    {
      field: "status",
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
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const status = data.status == 1 ? 0 : 1;
      console.log(status);
      const response = await fetch(
        `${baseUrl}/admin/game/change-level-status/${data.id}/${status}/${token}`,
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

  const [levelName, setlevelName] = useState("");
  const [discription, setDescription] = useState("");
  const [Priority, setPriority] = useState(0);
  const [levelId, setLevelId] = useState("");
  const [loading, setLoading] = useState(false);
  // const [allCourse, setallCourse] = useState<any>([]);

  const handleEdit = (data: any) => {
    // console.log(data);
    setlevelName(data.level_name);
    setDescription(data.description);
    setLevelId(data.id);
    setPriority(parseInt(data.priority, 10) || 0); // Ensure integer
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev?.filter((subject) => subject.id !== data.id));
  };

  const handleAddLevel = async () => {
    //  levelName,  description
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const form = new FormData();
      form.append("levelName", levelName);
      form.append("description", discription);
      form.append("token", token);
      form.append("priority", Priority.toString());
      form.append("courseId", "1"); // Hardcode courseId
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(
        `${baseUrl}/admin/game/add-level`,
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
          description: "Level added successfully",
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
      form.append("levelName", levelName);
      form.append("description", discription);
      form.append("levelId", levelId);
      form.append("token", token);
      form.append("priority", Priority.toString());
      form.append("courseId", "1");
      console.log(Object.fromEntries(form.entries()));

      const response = await fetch(
        `${baseUrl}/admin/game/update-level`,
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
    setlevelName("");
    setDescription("");
    setPriority(0);
    setLevelId("");
  };

  const allRole = [
    { id: 0, course_name: "Admin" },
    { id: 1, course_name: "Teacher" },
    // { id: 3, course_name: "Student" },
  ];

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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Levels</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add New Level
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
          paginationPageSizeSelector={[5, 10, 20, 30]}
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

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          onAddModalClose();
          resetForm(); // Reset when closing
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Level</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Level</FormLabel>
              <Input
                placeholder="Enter Name"
                value={levelName}
                onChange={(e) => setlevelName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Input
                placeholder="Enter Priority"
                value={Priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)} // Parse to integer
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter Description"
                value={discription}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddLevel}
              isLoading={loading}
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          onEditModalClose();
          resetForm(); // Reset when closing
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Level</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Level</FormLabel>
              <Input
                placeholder="Enter Subject Name"
                value={levelName}
                onChange={(e) => setlevelName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Input
                placeholder="Enter Priority"
                value={Priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)} // Parse to integer
              />
            </FormControl>
            <FormControl>
              <FormLabel>Discription</FormLabel>
              <Input
                placeholder="Enter Discription"
                value={discription}
                onChange={(e) => setDescription(e.target.value)}
              />
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

export default Levels;

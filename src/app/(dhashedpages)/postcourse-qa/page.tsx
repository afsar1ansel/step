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
  Select,
  useToast,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const postcourseqa = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const [testId, setTestId] = useState("1");
  const [testOptions, settestOptions] = useState<any[]>([]);
  const [postCourseTestQuestionsMasterId, setpostCourseTestQuestionsMasterId] =
    useState("");
    const [questionNo, setquestionNo] = useState("");
    const [editQuestion, setEditQuestion] = useState("");
     const [ testIdAdd, setTestIdAdd] = useState("");
  const toast = useToast();
  useEffect(() => {
    fetchTest();
    fetcherDrop();
  }, []);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  async function fetchTest() {
    const token = localStorage.getItem("token") ?? "";
    try {
      const response = await fetch(
        `${baseUrl}/masters/post-course-test/questions/view/${testId}/${token}`,
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

  //fetcher to get all test data
  async function fetcherDrop() {
    // const tok =
    //   typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const tok = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${baseUrl}/masters/post-course-test-detail/get-all/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      // console.log(responseData);
      settestOptions(responseData);
    } catch {
      (error: Error) => {
        console.error("Error fetching data:", error);
      };
    }
  }

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "question_no",
      headerName: "No.",
      maxWidth: 80,
      filter: false,
    },
    {
      field: "question",
      headerName: "Question",
      // width: 250,
      // filter: true,
    },
    {
      headerName: "Option 1",
      filter: false,
      valueGetter: (params) => params.data.options?.[0]?.option_text,
      cellStyle: (params) => ({
        backgroundColor: params.data.options?.[0]?.correct_option
          ? "#e6f7e6"
          : "white",
      }),
      // width: 150,
    },
    {
      headerName: "Option 2",
      filter: false,
      valueGetter: (params) => params.data.options?.[1]?.option_text,
      cellStyle: (params) => ({
        backgroundColor: params.data.options?.[1]?.correct_option
          ? "#e6f7e6"
          : "white",
      }),
      // width: 150,
    },
    {
      headerName: "Option 3",
      filter: false,
      valueGetter: (params) => params.data.options?.[2]?.option_text,
      cellStyle: (params) => ({
        backgroundColor: params.data.options?.[2]?.correct_option
          ? "#e6f7e6"
          : "white",
      }),
      // width: 150,
    },
    {
      headerName: "Option 4",
      filter: false,
      valueGetter: (params) => params.data.options?.[3]?.option_text,
      cellStyle: (params) => ({
        backgroundColor: params.data.options?.[3]?.correct_option
          ? "#e6f7e6"
          : "white",
      }),
      // width: 150,
    },
    {
      field: "question_id",
      headerName: "Actions",
      filter: false,
      cellStyle: { backgroundColor: "white" },
      cellRenderer: (params: any) => {
        // console.log(params)
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "10px",
              padding: "5px",
            }}
          >
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
              style={{ marginRight: "10px" }}
              variant="outline"
            >
              Edit
            </Button>
          </div>
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

  const [sheetId, setsheetId] = useState("");
  const [SheetName, setSheetName] = useState("");
  const [testCourseId, settestCourseId] = useState("");

  const handleEdit = (data: any) => {
   setpostCourseTestQuestionsMasterId(data.question_id);
    setquestionNo(data.question_no);
    setEditQuestion(data.question);
    // console.log(data)
    onEditModalOpen(); 
  };

  const handleAddCourse = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      form.append("sheetId", sheetId);
      form.append("sheetName", SheetName);
      form.append("postCourseTestId", testId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/post-course-test/fetch-questions`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      
      if (responseData.errFlag == 0) {
        toast({
          title: "Test added successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Error adding test.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error adding Test:", error);
    } finally {
      // console.log("we are at finally block");
      resetForm();
      onAddModalClose();
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      form.append("postCourseTestQuestionsMasterId", postCourseTestQuestionsMasterId);
      form.append("postCourseTestId", testId);
      form.append("questionNo", questionNo);
      form.append("question", editQuestion);

      console.log(Object.fromEntries(form));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/post-course-test/questions/update`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);
      //  fetcherData(); // Fetch updated data after adding a new course
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
    setsheetId("");
    setSheetName("");
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
        <div style={{ display: "flex", gap: "12px" }}>
          <Select
            placeholder="Select test"
            onChange={(e) => setTestId(e.target.value)}
          >
            {testOptions &&
              testOptions.map((item: any, index: number) => (
                <option key={item.id} value={item.id}>
                  {item.post_course_test_title}
                </option>
              ))}
          </Select>
          <Button onClick={onAddModalOpen} colorScheme="green">
            Add test
          </Button>
        </div>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
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
          <ModalHeader>Inset Test Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Sheet Id</FormLabel>
              <Input
                placeholder="Enter Sheet Id"
                value={sheetId}
                onChange={(e) => setsheetId(e.target.value)}
              />
              <FormLabel>Sheet Name</FormLabel>
              <Input
                placeholder="Enter Sheet Name"
                value={SheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
              <FormLabel>Select Test</FormLabel>
              <Select
                placeholder="Select test"
                onChange={(e) => setTestIdAdd(e.target.value)}
              >
                {testOptions &&
                  testOptions.map((item: any, index: number) => (
                    <option key={item.id} value={item.id}>
                      {item.post_course_test_title}
                    </option>
                  ))}
              </Select>
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
              <FormLabel>Question</FormLabel>
              <Input
                placeholder="Enter Question"
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
              />
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

export default postcourseqa;

"use client";

import { AgGridReact } from "ag-grid-react";
import React, { useState } from "react";
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
  useDisclosure,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const TestsTab = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [rowData, setRowData] = useState<any[]>([
    {
      id: "01",
      testName: "Anatomy Quiz 1",
      subject: "Anatomy",
      questions: 50,
      type: "Pre",
      link: "#",
    },
    {
      id: "02",
      testName: "Biochemistry MCQ",
      subject: "Biochemistry",
      questions: 30,
      type: "Post",
      link: "#",
    },
  ]);

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 80,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "Test Name",
      field: "testName",
      minWidth: 180,
    },
    {
      headerName: "Subject",
      field: "subject",
      minWidth: 150,
    },
    {
      headerName: "No. of Questions",
      field: "questions",
      maxWidth: 150,
    },
    {
      headerName: "Test Type",
      field: "type",
      maxWidth: 100,
    },
    {
      headerName: "Google Sheet Link",
      field: "link",
      cellRenderer: (params: any) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          View
        </a>
      ),
    },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => (
        <div>
          <button
            onClick={() => handleEdit(params.data)}
            style={{ marginRight: "10px" }}
          >
            Edit
          </button>
          <button onClick={() => handleDelete(params.data)}>Delete</button>
        </div>
      ),
    },
  ]);

  // State for Add/Edit Test Modal
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<number | "">("");
  const [type, setType] = useState("");
  const [link, setLink] = useState("");

  const handleEdit = (data: any) => {
    setIsEditMode(true);
    setCurrentTest(data);
    setTestName(data.testName);
    setSubject(data.subject);
    setQuestions(data.questions);
    setType(data.type);
    setLink(data.link);
    onModalOpen();
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((test) => test.id !== data.id));
  };

  const handleAddOrUpdateTest = () => {
    if (isEditMode) {
      const updatedTest = {
        id: currentTest.id,
        testName,
        subject,
        questions,
        type,
        link,
      };
      setRowData((prev) =>
        prev.map((test) => (test.id === currentTest.id ? updatedTest : test))
      );
    } else {
      const newTest = {
        id: String(rowData.length + 1),
        testName,
        subject,
        questions,
        type,
        link,
      };
      setRowData((prev) => [...prev, newTest]);
    }
    resetForm();
    onModalClose();
  };

  const resetForm = () => {
    setTestName("");
    setSubject("");
    setQuestions("");
    setType("");
    setLink("");
    setIsEditMode(false);
    setCurrentTest(null);
  };

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
          paginationPageSize={10}
          paginationAutoPageSize={true}
        />
      </div>

      {/* Add/Edit Test Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? "Edit Test" : "Add New Test"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Test Name</FormLabel>
              <Input
                placeholder="Enter Test Name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Input
                placeholder="Enter Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>No. of Questions</FormLabel>
              <Input
                type="number"
                placeholder="Enter Number of Questions"
                value={questions}
                onChange={(e) => setQuestions(Number(e.target.value))}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Test Type</FormLabel>
              <Select
                placeholder="Select Test Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Pre">Pre</option>
                <option value="Post">Post</option>
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Google Sheet Link</FormLabel>
              <Input
                placeholder="Enter Google Sheet Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onModalClose}>
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

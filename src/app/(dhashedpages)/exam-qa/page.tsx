"use client";
import dynamic from "next/dynamic";
const EditorComponent = dynamic(() => import("@/app/componant/editor"), {
  ssr: false,
});
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
  Textarea,
  HStack,
} from "@chakra-ui/react";
import ContentFormatter from "@/app/componant/ContentFormatter";
// import styles from "./page.module.css"; // If you create a corresponding CSS module

ModuleRegistry.registerModules([AllCommunityModule]);

const PrecourseQaPage = () => { 
  const baseUrl = "https://step-exam-app-3utka.ondigitalocean.app"; 
  const [rowData, setRowData] = useState<any[]>([]);
  const [testId, setTestId] = useState(""); // This will represent examId for selecting an exam
  const [testOptions, settestOptions] = useState<any[]>([]); // To be populated by exams
  // const [preCourseTestQuestionsMasterId, setPreCourseTestQuestionsMasterId] = useState(""); // This state seems unused in the original precourse-qa
  const [questionNo, setQuestionNo] = useState("");
  const [editQuestion, setEditQuestion] = useState<any>({ blocks: [] }); // Initialize for EditorJS
  const [testIdAdd, setTestIdAdd] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [questionid, setQuestionId] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [solutionText, setSolutionText] = useState<any>({ blocks: [] }); // Initialize for EditorJS

  // New state for Add Question modal
  const [newQuestionNo, setNewQuestionNo] = useState("");
  const [newQuestionData, setNewQuestionData] = useState<any>({ blocks: [] }); // For EditorJS
  const [newOption1, setNewOption1] = useState("");
  const [newOption2, setNewOption2] = useState("");
  const [newOption3, setNewOption3] = useState("");
  const [newOption4, setNewOption4] = useState("");
  const [newCorrectOption, setNewCorrectOption] = useState("");
  const [newSolutionText, setNewSolutionText] = useState<any>({ blocks: [] }); // For EditorJS
  const [newTestId, setNewTestId] = useState("");

  const toast = useToast();

  useEffect(() => {
    fetcherDrop(); 
  }, []);

  useEffect(() => {
    if (testId) { 
      fetchTestQuestions(); // Renamed for clarity
    } else {
      setRowData([]); 
    }
  }, [testId]);

  async function fetchTestQuestions() { // Renamed from fetchTest
    const token = localStorage.getItem("token") ?? "";
    if (!testId) return; 
    try {
      const response = await fetch(
        `${baseUrl}/admin/masters/exam/questions/view/${testId}`, // Changed endpoint
        {
          method: "GET",
          headers: { // Added headers for token
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        const responseData = await response.json();
        setRowData(responseData || []); // API returns array directly
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch exam questions." }));
        setRowData([]);
        toast({ title: "Error", description: errorData.message || "Failed to fetch exam questions.", status: "error", duration: 3000, isClosable: true });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setRowData([]);
      toast({ title: "Error", description: "Failed to fetch exam questions.", status: "error", duration: 3000, isClosable: true });
    }
  }

  async function fetcherDrop() { // Fetches exams for the dropdown
    const tok = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${baseUrl}/masters/exam/get-all`, // Changed endpoint
        {
          method: "GET",
          headers: { // Added headers for token
            'Authorization': `Bearer ${tok}`
          }
        }
      );
      const responseData = await response.json();
      if (responseData && responseData.length > 0) {
        settestOptions(responseData);
      } else {
        settestOptions([]);
      }
    } catch (error) {
      console.error("Error fetching exam options:", error);
      settestOptions([]);
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
      field: "question_text", // Changed from question
      headerName: "Question",
      editable: false,
      flex: 2,
       cellRenderer: (params: any) => {
             return <ContentFormatter content={params.value} />;
           },
      cellStyle: {
        height: "100%",
        padding: "0px", // Cell padding handled by renderer
        display: 'flex',
        alignItems: 'center'
      },
      autoHeight: true, // Let ag-grid manage height based on content
    },
    {
      headerName: "Option 1",
      filter: false,
      flex: 1,
      valueGetter: (params) => params.data.options?.[0]?.option_text,
      cellRenderer: (params: any) => {
        const optionText = params.data.options?.[0]?.option_text || "";
        return (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              overflowY: "auto",
              height: "100%",
              maxHeight: "280px",
              scrollbarWidth: "thin",
              padding: "8px",
              backgroundColor: params.data.options?.[0]?.correct_option
                ? "#e6f7e6"
                : "transparent",
            }}
          >
            {optionText}
          </div>
        );
      },
       cellStyle: { height: "100%", padding: "0px", display: 'flex', alignItems: 'center' },
       autoHeight: true,
    },
    {
      headerName: "Option 2",
      filter: false,
      flex: 1,
      valueGetter: (params) => params.data.options?.[1]?.option_text,
      cellRenderer: (params: any) => {
        const optionText = params.data.options?.[1]?.option_text || "";
        return (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              overflowY: "auto",
              height: "100%",
              maxHeight: "280px",
              scrollbarWidth: "thin",
              padding: "8px",
              backgroundColor: params.data.options?.[1]?.correct_option
                ? "#e6f7e6"
                : "transparent",
            }}
          >
            {optionText}
          </div>
        );
      },
      cellStyle: { height: "100%", padding: "0px", display: 'flex', alignItems: 'center' },
      autoHeight: true,
    },
    {
      headerName: "Option 3",
      filter: false,
      flex: 1,
      valueGetter: (params) => params.data.options?.[2]?.option_text,
      cellRenderer: (params: any) => {
        const optionText = params.data.options?.[2]?.option_text || "";
        return (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              overflowY: "auto",
              height: "100%",
              maxHeight: "280px",
              scrollbarWidth: "thin",
              padding: "8px",
              backgroundColor: params.data.options?.[2]?.correct_option
                ? "#e6f7e6"
                : "transparent",
            }}
          >
            {optionText}
          </div>
        );
      },
      cellStyle: { height: "100%", padding: "0px", display: 'flex', alignItems: 'center' },
      autoHeight: true,
    },
    {
      headerName: "Option 4",
      filter: false,
      flex: 1,
      valueGetter: (params) => params.data.options?.[3]?.option_text,
      cellRenderer: (params: any) => {
        const optionText = params.data.options?.[3]?.option_text || "";
        return (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              overflowY: "auto",
              height: "100%",
              maxHeight: "280px",
              scrollbarWidth: "thin",
              padding: "8px",
              backgroundColor: params.data.options?.[3]?.correct_option
                ? "#e6f7e6"
                : "transparent",
            }}
          >
            {optionText}
          </div>
        );
      },
      cellStyle: {
        height: "100%",
        padding: "0px", // Cell padding handled by renderer
        display: 'flex',
        alignItems: 'center'
      },
      autoHeight: true,
    },
    {
      field: "solution_text",
      headerName: "Solution",
      filter: false,
      flex: 2,
      cellRenderer: (params: any) => {
            return <ContentFormatter content={params.value} />;
          },
      cellStyle: { height: "100%", padding: "0px", display: 'flex', alignItems: 'center' },
      autoHeight: true,
    },
    {
      field: "question_id", // Assuming this is the unique ID for actions
      headerName: "Actions",
      maxWidth: 100,
      filter: false,
      cellRenderer: (params: any) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center", // Align button vertically
              height: "100%", // Ensure div takes full cell height
              // flexDirection: "column", // If multiple buttons, otherwise not needed
              // gap: "10px",
              // padding: "5px",
            }}
          >
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
              // style={{ marginRight: "10px" }} // Not needed if only one button
              variant="outline"
            >
              Edit
            </Button>
          </div>
        );
      },
      cellStyle: { padding: "0px" } // Remove padding for cell itself
    },
  ]);

  // State for Add Test Modal (from Google Sheet)
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Question Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  // State for Add Question Modal
  const {
    isOpen: isAddQuestionModalOpen,
    onOpen: onAddQuestionModalOpen,
    onClose: onAddQuestionModalClose,
  } = useDisclosure();

  const [sheetId, setsheetId] = useState("");
  const [SheetName, setSheetName] = useState("");
  // const [testCourseId, settestCourseId] = useState(""); // This state seems unused

  const handleEdit = (data: any) => {
    setQuestionNo(data.question_no);

    let questionValue;
    try {
      // Assuming question_text is the field from API for EditorJS JSON
      questionValue = typeof data.question_text === "string" ? JSON.parse(data.question_text) : data.question_text;
      if (typeof questionValue !== 'object' || !questionValue.blocks) { 
        questionValue = { blocks: [{ type: "paragraph", data: { text: data.question_text || "" } }] };
      }
    } catch {
      questionValue = { blocks: [{ type: "paragraph", data: { text: data.question_text || "" } }] };
    }
    setEditQuestion(questionValue);

    setQuestionId(data.question_id);
    setOption1(data.options?.[0]?.option_text || "");
    setOption2(data.options?.[1]?.option_text || "");
    setOption3(data.options?.[2]?.option_text || "");
    setOption4(data.options?.[3]?.option_text || "");

    const correctOpt = data.options?.find((opt: any) => opt.correct_option === 1);
    setCorrectOption(correctOpt ? (data.options.indexOf(correctOpt) + 1).toString() : "");


    let solutionValue;
    try {
      solutionValue = typeof data.solution_text === "string" ? JSON.parse(data.solution_text) : data.solution_text;
       if (typeof solutionValue !== 'object' || !solutionValue.blocks) { // Ensure it's valid EditorJS structure
        solutionValue = { blocks: [{ type: "paragraph", data: { text: data.solution_text || "" } }] };
      }
    } catch {
      solutionValue = { blocks: [{ type: "paragraph", data: { text: data.solution_text || "" } }] };
    }
    setSolutionText(solutionValue);
    onEditModalOpen();
  };

  const handleAddCourse = async () => { // This is "Add Questions from Sheet"
    if (!testIdAdd) { // testIdAdd is the selected examId
      toast({ title: "Error", description: "Please select an exam to add questions to.", status: "error", duration: 3000, isClosable: true, position: "top" });
      return;
    }
    const token = localStorage.getItem("token") ?? "";
    try {
      const form = new FormData();
      // form.append("token", token); // Token in header
      form.append("sheetId", sheetId);
      form.append("sheetName", SheetName);
      form.append("examId", testIdAdd); // Changed from preCourseTestId

      const response = await fetch(
        `${baseUrl}/admin/masters/exam/questions/fetch-questions`, // Changed endpoint and used baseUrl
        {
          method: "POST",
          headers: { // Added headers for token
            'Authorization': `Bearer ${token}`
          },
          body: form,
        }
      );
      const responseData = await response.json();

      if (responseData.errFlag == 0) {
        toast({
          title: "Exam questions added successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        if (testIdAdd === testId) fetchTestQuestions(); // Refresh if current exam was updated
        resetSheetForm();
        onAddModalClose();
      } else {
        toast({
          title: "Error adding exam questions.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error adding Test from sheet:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", status: "error", duration: 3000, isClosable: true, position: "top" });
    }
  };

  const handleAddQuestion = async () => {
    if (!newTestId || !newQuestionNo || !newCorrectOption) { // newTestId is examId
         toast({ title: "Validation Error", description: "Please fill all required fields (Exam, Question No, Correct Option).", status: "warning", duration: 3000, isClosable: true, position: "top" });
         return;
    }
    const token = localStorage.getItem("token") ?? "";
    try {
      const form = new FormData();
      // form.append("token", token); // Token in header
      form.append("examId", newTestId); // Changed from preCourseTestId
      form.append("questionNo", newQuestionNo);
      form.append("questionText", JSON.stringify(newQuestionData)); // Changed from question
      form.append("solutionText", JSON.stringify(newSolutionText)); 
      form.append("correctOption", newCorrectOption);
      form.append("option1", newOption1);
      form.append("option2", newOption2);
      form.append("option3", newOption3);
      form.append("option4", newOption4);

      const response = await fetch(
        `${baseUrl}/admin/masters/exam/questions/add`, // Changed endpoint and used baseUrl
        {
          method: "POST",
          headers: { // Added headers for token
            'Authorization': `Bearer ${token}`
          },
          body: form,
        }
      );
      const responseData = await response.json();

      if (responseData.errFlag == 0) {
        if (newTestId === testId) fetchTestQuestions(); // Refresh if current exam was updated
        toast({
          title: "Question added successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        resetAddQuestionForm();
        onAddQuestionModalClose();
      } else {
        toast({
          title: "Error adding question.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", status: "error", duration: 3000, isClosable: true, position: "top" });
    }
  };

  const handleUpdateCourse = async () => { // This is "Update Question"
    if (!correctOption) {
         toast({ title: "Validation Error", description: "Please select a correct option.", status: "warning", duration: 3000, isClosable: true, position: "top" });
         return;
    }
    const token = localStorage.getItem("token") ?? "";
    try {
      const form = new FormData();
      // form.append("token", token); // Token in header
      form.append("examId", testId); // Changed from preCourseTestId, testId is current examId
      form.append("questionNo", questionNo);
      form.append("questionText", JSON.stringify(editQuestion)); // Changed from question
      form.append("solutionText", JSON.stringify(solutionText)); 
      form.append("correctOption", correctOption);
      form.append("option1", option1);
      form.append("option2", option2);
      form.append("option3", option3);
      form.append("option4", option4);
      form.append("questionId", questionid);


      const response = await fetch(
        `${baseUrl}/admin/masters/exam/questions/edit`, // Changed endpoint and used baseUrl
        {
          method: "POST",
          headers: { // Added headers for token
            'Authorization': `Bearer ${token}`
          },
          body: form,
        }
      );
      const responseData = await response.json();

      if (responseData.errFlag == 0) {
        fetchTestQuestions(); // Refresh the current exam's questions
        toast({
          title: "Question updated successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onEditModalClose(); // Close modal on success
      } else {
        toast({
          title: "Error updating question.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast({ title: "Error", description: "An unexpected error occurred.", status: "error", duration: 3000, isClosable: true, position: "top" });
    }
    // resetEditForm(); // Optional: if you want to clear edit form fields after closing
  };

  const resetSheetForm = () => {
    setsheetId("");
    setSheetName("");
    setTestIdAdd(""); // Reset selected exam for adding from sheet
  };

  const resetAddQuestionForm = () => {
    setNewQuestionNo("");
    setNewQuestionData({ blocks: [] });
    setNewOption1("");
    setNewOption2("");
    setNewOption3("");
    setNewOption4("");
    setNewCorrectOption("");
    setNewSolutionText({ blocks: [] });
    setNewTestId(""); // Reset selected exam for new question
  };


  return (
    <div style={{ width: "80vw", height: "calc(100vh - 120px)" /* Adjust height as needed */ }}>
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
          marginBottom: "1px solid #eee" 
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Exam Q/A Data</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <Select
            placeholder="Select Exam" // Changed from Test
            value={testId} // testId here is examId
            onChange={(e) => setTestId(e.target.value)}
            minW="200px" 
          >
            {testOptions &&
              testOptions.map((item: any) => ( 
                <option key={item.id} value={item.id}>
                  {item.exam_title} {/* Changed from pre_course_test_title */}
                </option>
              ))}
          </Select>
          <HStack spacing={4}>
            <Button onClick={() => { resetAddQuestionForm(); if(testOptions.length > 0 && !newTestId) setNewTestId(testId || testOptions[0].id); onAddQuestionModalOpen();}} colorScheme="blue" px={6} isDisabled={testOptions.length === 0}>
              Add Question
            </Button>
            <Button onClick={() => { resetSheetForm(); if(testOptions.length > 0 && !testIdAdd) setTestIdAdd(testId || testOptions[0].id); onAddModalOpen();}} colorScheme="green" px={6} isDisabled={testOptions.length === 0}>
              Add From Sheet
            </Button>
          </HStack>
        </div>
      </div>
      <div style={{ height: "calc(100% - 60px)", width: "100%" }} className="ag-theme-alpine"> {/* Ensure ag-grid theme class */}
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5} // Adjust as needed
          paginationPageSizeSelector={[5, 10, 20]}
          defaultColDef={{
            sortable: true,
            filter: true,
            floatingFilter: true,
            resizable: true,
            flex: 1,
            filterParams: {
              debounceMs: 0, // Set to 0 for immediate filtering
              buttons: ["reset"], // Show reset button in filter
            },
          }}
          // domLayout="autoHeight" // autoHeight can be slow with many rows/complex renderers. Consider 'normal' or 'print'.
          getRowHeight={(params: any) => 300} // Fixed row height for EditorJS content
          suppressCellFocus={true} // Improves UX by not highlighting cell on click
          onGridReady={(params) => params.api.sizeColumnsToFit()} // Example: size columns to fit
        />
      </div>

      {/* Add Test Modal (from Google Sheet) */}
      <Modal isOpen={isAddModalOpen} onClose={() => { resetSheetForm(); onAddModalClose();}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Insert Exam Questions from Google Sheet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Select Exam to Add Questions To</FormLabel>
              <Select
                placeholder="Select Exam"
                value={testIdAdd} // testIdAdd is examId
                onChange={(e) => setTestIdAdd(e.target.value)}
              >
                {testOptions &&
                  testOptions.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.exam_title} {/* Changed from pre_course_test_title */}
                    </option>
                  ))}
              </Select>
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Sheet Id</FormLabel>
              <Input
                placeholder="Enter Sheet Id"
                value={sheetId}
                onChange={(e) => setsheetId(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Sheet Name</FormLabel>
              <Input
                placeholder="Enter Sheet Name (e.g., Sheet1)"
                value={SheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={() => { resetSheetForm(); onAddModalClose();}}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddCourse} isDisabled={!sheetId || !SheetName || !testIdAdd}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={() => { resetAddQuestionForm(); onAddQuestionModalClose();}}
        size="xl" 
      >
        <ModalOverlay />
        <ModalContent maxW="container.md"> 
          <ModalHeader>Add New Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" maxHeight="70vh"> 
            <FormControl isRequired>
              <FormLabel>Select Exam</FormLabel>
              <Select
                placeholder="Select Exam"
                onChange={(e) => setNewTestId(e.target.value)} // newTestId is examId
                value={newTestId}
              >
                {testOptions &&
                  testOptions.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.exam_title} {/* Changed from pre_course_test_title */}
                    </option>
                  ))}
              </Select>
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Question No</FormLabel>
              <Input
                type="number"
                placeholder="Enter Question Number"
                value={newQuestionNo}
                onChange={(e) => setNewQuestionNo(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Question</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <EditorComponent
                  data={newQuestionData}
                  onChange={setNewQuestionData}
                  holder="add-question-editor"
                />
              </div>
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 1</FormLabel>
              <Input
                placeholder="Enter Option 1"
                value={newOption1}
                onChange={(e) => setNewOption1(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 2</FormLabel>
              <Input
                placeholder="Enter Option 2"
                value={newOption2}
                onChange={(e) => setNewOption2(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 3</FormLabel>
              <Input
                placeholder="Enter Option 3"
                value={newOption3}
                onChange={(e) => setNewOption3(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 4</FormLabel>
              <Input
                placeholder="Enter Option 4"
                value={newOption4}
                onChange={(e) => setNewOption4(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Correct Option</FormLabel>
              <Select
                placeholder="Select correct option"
                onChange={(e) => setNewCorrectOption(e.target.value)}
                value={newCorrectOption}
              >
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
              </Select>
            </FormControl>
            <FormControl mt={4}> {/* Solution is optional */}
              <FormLabel>Solution</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <EditorComponent
                  data={newSolutionText}
                  onChange={setNewSolutionText}
                  holder="add-question-solution-editor"
                />
              </div>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={() => { resetAddQuestionForm(); onAddQuestionModalClose();}}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddQuestion} isDisabled={!newTestId || !newQuestionNo || !newCorrectOption || !newOption1 || !newOption2 || !newOption3 || !newOption4}>
              Add Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Question Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { /* resetEditForm(); */ onEditModalClose();}} size="xl">
         <ModalOverlay />
        <ModalContent maxW="container.md">
          <ModalHeader>Edit Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" maxHeight="70vh">
            <FormControl isRequired>
              <FormLabel>Question No</FormLabel>
              <Input
                type="number"
                placeholder="Enter Question Number"
                value={questionNo}
                onChange={(e) => setQuestionNo(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Question</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <EditorComponent
                  data={editQuestion}
                  onChange={setEditQuestion}
                  holder="edit-question-editor"
                />
              </div>
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 1</FormLabel>
              <Input
                placeholder="Enter Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 2</FormLabel>
              <Input
                placeholder="Enter Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 3</FormLabel>
              <Input
                placeholder="Enter Option 3"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Option 4</FormLabel>
              <Input
                placeholder="Enter Option 4"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Correct Option</FormLabel>
              <Select
                placeholder="Select correct option"
                onChange={(e) => setCorrectOption(e.target.value)}
                value={correctOption}
              >
                <option value="1">Option 1: {option1}</option>
                <option value="2">Option 2: {option2}</option>
                <option value="3">Option 3: {option3}</option>
                <option value="4">Option 4: {option4}</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Solution</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <EditorComponent
                  data={solutionText}
                  onChange={setSolutionText}
                  holder="edit-solution-editor"
                />
              </div>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={() => { /* resetEditForm(); */ onEditModalClose();}}>
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

export default PrecourseQaPage;

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
  const [testIdAdd, setTestIdAdd] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [questionid, setQuestionId] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [newQuestionNo, setNewQuestionNo] = useState("");
  const [newQuestionData, setNewQuestionData] = useState<any>({ blocks: [] });
  const [newOption1, setNewOption1] = useState("");
  const [newOption2, setNewOption2] = useState("");
  const [newOption3, setNewOption3] = useState("");
  const [newOption4, setNewOption4] = useState("");
  const [newCorrectOption, setNewCorrectOption] = useState("");
  const [newSolutionText, setNewSolutionText] = useState("");
  const [newTestId, setNewTestId] = useState("");

  const toast = useToast();
  useEffect(() => {
    fetchTest();
    fetcherDrop();
  }, []);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  async function fetchTest() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
    const tok =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    // const tok = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${baseUrl}/masters/post-course-test-detail/get-all/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      // { errFlag: 1, message: 'Invalid token' }
      if (
        responseData.message == "Invalid token" ||
        responseData.errFlag == 1
      ) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
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
      editable: false,
      flex: 2,
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
              overflow: "auto",
              height: "100%",
              scrollbarWidth: "none",
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
              overflow: "auto",
              height: "100%",
              scrollbarWidth: "none",
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
              overflow: "auto",
              height: "100%",
              scrollbarWidth: "none",
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
              overflow: "auto",
              height: "100%",
              scrollbarWidth: "none",
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
        padding: "0px",
      },
    },
    {
      field: "solution_text",
      headerName: "Solution",
      filter: false,
      cellRenderer: (params: any) => {
        return <ContentFormatter content={params.value} />;
      },
      flex: 2,
    },
    {
      field: "question_id",
      headerName: "Actions",
      maxWidth: 100,
      filter: false,
      cellRenderer: (params: any) => {
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
    setquestionNo(data.question_no);

    // Parse question data
    let questionValue;
    try {
      questionValue =
        typeof data.question === "string"
          ? JSON.parse(data.question)
          : data.question;
    } catch {
      // If parsing fails or it's plain text, convert to EditorJS format
      questionValue = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: data.question || "",
            },
          },
        ],
      };
    }

    // Parse solution data
    let solutionValue;
    try {
      solutionValue =
        typeof data.solution_text === "string"
          ? JSON.parse(data.solution_text)
          : data.solution_text;
    } catch {
      solutionValue = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: data.solution_text || "",
            },
          },
        ],
      };
    }
    setEditQuestion(questionValue);

    setQuestionId(data.question_id);
    setOption1(data.options[0].option_text);
    setOption2(data.options[1].option_text);
    setOption3(data.options[2].option_text);
    setOption4(data.options[3].option_text);

    // Handle solution_text (parse if JSON)
    // let solutionValue = data.solution_text;
    // try {
    //   const parsedSolution = JSON.parse(data.solution_text);
    //   if (typeof parsedSolution === "object" && parsedSolution !== null) {
    //     solutionValue = parsedSolution;
    //   }
    // } catch {
    //   // If parsing fails, keep as string
    // }
    setSolutionText(solutionValue);

    onEditModalOpen();
  };

  const handleAddCourse = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const form = new FormData();
      form.append("token", token ?? "");
      form.append("sheetId", sheetId);
      form.append("sheetName", SheetName);
      form.append("postCourseTestId", testIdAdd);
      console.log(Object.fromEntries(form));

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
      // form.append("postCourseTestQuestionsMasterId", postCourseTestQuestionsMasterId);
      form.append("postCourseTestId", testId);
      form.append("questionNo", questionNo);
      form.append("question", JSON.stringify(editQuestion));
      form.append("option1", option1);
      form.append("option2", option2);
      form.append("option3", option3);
      form.append("option4", option4);
      form.append("questionId", questionid);
      form.append("solutionText", JSON.stringify(solutionText));
      form.append("correctOption", correctOption);

      console.log(Object.fromEntries(form));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/post-course-test/questions/edit`,
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
        fetchTest();
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

  // Add this function to reset the modal state
  const resetAddQuestionForm = () => {
    setNewQuestionNo("");
    setNewQuestionData({ blocks: [] });
    setNewOption1("");
    setNewOption2("");
    setNewOption3("");
    setNewOption4("");
    setNewCorrectOption("");
    setNewSolutionText("");
    setNewTestId("");
  };

  // Add this handler for posting a new question
  const handleAddQuestion = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      form.append("postCourseTestId", newTestId);
      form.append("questionNo", newQuestionNo);

      // Stringify question if it's an object (EditorJS data)
      const questionToStore =
        typeof newQuestionData === "object"
          ? JSON.stringify(newQuestionData)
          : newQuestionData;
      form.append("question", questionToStore);

      // Stringify solution if it's an object (EditorJS data)
      const solutionToStore =
        typeof newSolutionText === "object"
          ? JSON.stringify(newSolutionText)
          : newSolutionText;
      form.append("solutionText", solutionToStore);

      form.append("correctOption", newCorrectOption);
      form.append("option1", newOption1);
      form.append("option2", newOption2);
      form.append("option3", newOption3);
      form.append("option4", newOption4);

      if (newCorrectOption === "") {
        toast({
          title: "Please select a correct option.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/post-course-test/questions/add`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();

      if (responseData.errFlag == 0) {
        fetchTest();
        toast({
          title: "Question added successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        handleAddQuestionModalClose();
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
      toast({
        title: "Error adding question.",
        description: "An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleAddQuestionModalClose = () => {
    setIsAddQuestionModalOpen(false);
    resetAddQuestionForm();
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
          <HStack spacing={4}>
            <Button
              onClick={() => setIsAddQuestionModalOpen(true)}
              colorScheme="blue"
              px={6}
            >
              Add Question
            </Button>
            <Button onClick={onAddModalOpen} colorScheme="green">
              Add test
            </Button>
          </HStack>
        </div>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 30]}
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
          getRowHeight={(params: any) => {
            // console.log({ params });
            return 300;
            // if (params?.data.sub_category_data.length > 1) {
            //   return params.data.sub_category_data.length * 45;
            // } else {
            //   return 80;
            // }
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
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size={"4xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mt={4}>
              <FormLabel>Question No</FormLabel>
              <Input
                placeholder="Enter Question Number"
                value={questionNo}
                onChange={(e) => setquestionNo(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Question</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <EditorComponent
                  data={editQuestion}
                  onChange={setEditQuestion}
                  holder="edit-question-editor"
                />
              </div>
            </FormControl>
            <FormControl>
              <FormLabel>Option 1</FormLabel>
              <Input
                placeholder="Enter Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Option 2</FormLabel>
              <Input
                placeholder="Enter Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Option 3</FormLabel>
              <Input
                placeholder="Enter Option 3"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Option 4</FormLabel>
              <Input
                placeholder="Enter Option 4"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Correct Option</FormLabel>
              <Select
                placeholder="Select correct option"
                onChange={(e) => setCorrectOption(e.target.value)}
              >
                <option value="1">{option1}</option>
                <option value="2">{option2}</option>
                <option value="3">{option3}</option>
                <option value="4">{option4}</option>
              </Select>
            </FormControl>
            <FormControl>
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
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUpdateCourse}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={handleAddQuestionModalClose}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Select Test</FormLabel>
              <Select
                placeholder="Select Test"
                onChange={(e) => setNewTestId(e.target.value)}
                value={newTestId}
              >
                {testOptions &&
                  testOptions.map((item: any, index: number) => (
                    <option key={item.id} value={item.id}>
                      {item.post_course_test_title}
                    </option>
                  ))}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Question No</FormLabel>
              <Input
                placeholder="Enter Question Number"
                value={newQuestionNo}
                onChange={(e) => setNewQuestionNo(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Question</FormLabel>
              <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                <EditorComponent
                  data={newQuestionData}
                  onChange={setNewQuestionData}
                  holder="add-question-editor"
                />
              </div>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 1</FormLabel>
              <Input
                placeholder="Enter Option 1"
                value={newOption1}
                onChange={(e) => setNewOption1(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 2</FormLabel>
              <Input
                placeholder="Enter Option 2"
                value={newOption2}
                onChange={(e) => setNewOption2(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 3</FormLabel>
              <Input
                placeholder="Enter Option 3"
                value={newOption3}
                onChange={(e) => setNewOption3(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 4</FormLabel>
              <Input
                placeholder="Enter Option 4"
                value={newOption4}
                onChange={(e) => setNewOption4(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
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
            <FormControl mt={4}>
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
            <Button
              colorScheme="gray"
              mr={3}
              onClick={handleAddQuestionModalClose}
            >
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddQuestion}>
              Add Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default postcourseqa;

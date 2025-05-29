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
  Textarea,
  HStack,
} from "@chakra-ui/react";
import EditorComponent from "@/app/componant/editor";

ModuleRegistry.registerModules([AllCommunityModule]);

const precourseqa = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const [testId, setTestId] = useState("1");
  const [testOptions, settestOptions] = useState<any[]>([]);
  const [preCourseTestQuestionsMasterId, setPreCourseTestQuestionsMasterId] =
    useState("");
  const [questionNo, setQuestionNo] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [testIdAdd, setTestIdAdd] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [questionid, setQuestionId] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [solutionText, setSolutionText] = useState("");

  // New state for Add Question modal
  const [newQuestionNo, setNewQuestionNo] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newOption1, setNewOption1] = useState("");
  const [newOption2, setNewOption2] = useState("");
  const [newOption3, setNewOption3] = useState("");
  const [newOption4, setNewOption4] = useState("");
  const [newCorrectOption, setNewCorrectOption] = useState("");
  const [newSolutionText, setNewSolutionText] = useState("");
  const [newTestId, setNewTestId] = useState("");

  const [newQuestionData, setNewQuestionData] = useState<any>({ blocks: [] });

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
        `${baseUrl}/masters/pre-course-test/questions/view/${testId}/${token}`,
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

  async function fetcherDrop() {
    const tok = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${baseUrl}/masters/pre-course-test/get-all/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);
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
      cellRenderer: (params: any) => {
        const isJson = (str: string) => {
          try {
            const parsed = JSON.parse(str);
            // Optionally check for structure, e.g., if it has expected keys
            return typeof parsed === "object" && parsed !== null;
          } catch (e) {
            return false;
          }
        };

        const questionData = params.data.question;

        if (typeof questionData === "string" && isJson(questionData)) {
          const parsedData = JSON.parse(questionData);
          return (
            <EditorComponent
              data={parsedData}
              onChange={(data: any) => {
                params.data.question = JSON.stringify(data);
              }}
              // readOnlytoggle={true}
              holder="add-question-editor"
            />
          );
        } else {
          return (
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                overflow: "auto",
                maxHeight: "200px", // optional: scroll if too tall
              }}
            >
              {questionData}
            </div>
          );
        }
      },
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
    },
    {
      field: "solution_text",
      headerName: "Solution Text",
      filter: false,
      cellStyle: { backgroundColor: "white" },
    },
    {
      field: "question_id",
      headerName: "Actions",
      filter: false,
      cellStyle: { backgroundColor: "white" },
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
  const [testCourseId, settestCourseId] = useState("");

  const handleEdit = (data: any) => {
    console.log(data);
    setQuestionNo(data.question_no);
    setEditQuestion(JSON.parse(data.question));
    console.log(JSON.parse(data.question));
    setQuestionId(data.question_id);
    setOption1(data.options[0].option_text);
    setOption2(data.options[1].option_text);
    setOption3(data.options[2].option_text);
    setOption4(data.options[3].option_text);

    // Find which option is correct
    // const correctOption = data.options.find(
    //   (opt: any) => opt.correct_option === 1
    // );
    // setCorrectOption(correctOption ? correctOption.option_no.toString() : "");

    setSolutionText(data.solution_text);
    onEditModalOpen();
  };

  const handleAddCourse = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      form.append("sheetId", sheetId);
      form.append("sheetName", SheetName);
      form.append("preCourseTestId", testIdAdd);

      console.log(Object.fromEntries(form));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/pre-course-test/fetch-questions`,
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
      resetForm();
      onAddModalClose();
    }
  };

  const handleAddQuestion = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      form.append("preCourseTestId", newTestId);
      form.append("questionNo", newQuestionNo);
      form.append("question", JSON.stringify(newQuestionData));
      form.append("solutionText", newSolutionText);
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

      console.log(Object.fromEntries(form));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/pre-course-test/questions/add`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);

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
        resetAddQuestionForm();
        onAddQuestionModalClose(); // <-- Only close on success!
      } else {
        toast({
          title: "Error adding question.",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        // Do NOT close the modal here!
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
      // Do NOT close the modal here!
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      form.append("preCourseTestId", testId);
      form.append("questionNo", questionNo);
      // form.append("question", editQuestion);
      form.append("question", JSON.stringify(editQuestion));
      form.append("solutionText", solutionText);
      form.append("correctOption", correctOption);
      form.append("option1", option1);
      form.append("option2", option2);
      form.append("option3", option3);
      form.append("option4", option4);
      form.append("questionId", questionid);

      if (correctOption === "") {
        toast({
          title: "Please select a correct option.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      console.log(Object.fromEntries(form));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/pre-course-test/questions/edit`,
        {
          method: "POST",
          body: form,
        }
      );
      const responseData = await response.json();
      console.log(responseData);

      if (responseData.errFlag == 0) {
        fetchTest();
        toast({
          title: "Question updated successfully.",
          description: responseData.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
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
    } finally {
      resetForm();
      onEditModalClose();
    }
  };

  const resetForm = () => {
    setsheetId("");
    setSheetName("");
  };

  const resetAddQuestionForm = () => {
    setNewQuestionNo("");
    setNewQuestion("");
    setNewOption1("");
    setNewOption2("");
    setNewOption3("");
    setNewOption4("");
    setNewCorrectOption("");
    setNewSolutionText("");
    setNewTestId("");
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
          // border: "1px solid black",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Course Data</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <Select
            placeholder="Select Test"
            onChange={(e) => setTestId(e.target.value)}
          >
            {testOptions &&
              testOptions.map((item: any, index: number) => (
                <option key={item.id} value={item.id}>
                  {item.pre_course_test_title}
                </option>
              ))}
          </Select>
          <HStack spacing={4}>
            <Button onClick={onAddQuestionModalOpen} colorScheme="blue" px={6}>
              Add Question
            </Button>
            <Button onClick={onAddModalOpen} colorScheme="green" px={6}>
              Add Test
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
          getRowHeight={(params : any) => {
            // console.log({ params });
            return (
              150
            )
            // if (params?.data.sub_category_data.length > 1) {
            //   return params.data.sub_category_data.length * 45;
            // } else {
            //   return 80;
            // }
          }}
          suppressCellFocus={true}
        />
      </div>

      {/* Add Test Modal (from Google Sheet) */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Insert Test Questions from Google Sheet</ModalHeader>
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
                placeholder="Select Test"
                onChange={(e) => setTestIdAdd(e.target.value)}
              >
                {testOptions &&
                  testOptions.map((item: any, index: number) => (
                    <option key={item.id} value={item.id}>
                      {item.pre_course_test_title}
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

      {/* Add Question Modal */}
      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={onAddQuestionModalClose}
        size="xl"
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
                      {item.pre_course_test_title}
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
              <FormLabel>Solution Text</FormLabel>
              <Textarea
                placeholder="Enter Solution Text"
                value={newSolutionText}
                onChange={(e) => setNewSolutionText(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddQuestionModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddQuestion}>
              Add Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Question Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Question No</FormLabel>
              <Input
                placeholder="Enter Question Number"
                value={questionNo}
                onChange={(e) => setQuestionNo(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Question</FormLabel>
              <EditorComponent
                data={editQuestion}
                onChange={setEditQuestion}
                holder="add-question-editor"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 1</FormLabel>
              <Input
                placeholder="Enter Option 1"
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 2</FormLabel>
              <Input
                placeholder="Enter Option 2"
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 3</FormLabel>
              <Input
                placeholder="Enter Option 3"
                value={option3}
                onChange={(e) => setOption3(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Option 4</FormLabel>
              <Input
                placeholder="Enter Option 4"
                value={option4}
                onChange={(e) => setOption4(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
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
              <FormLabel>Solution Text</FormLabel>
              <Textarea
                placeholder="Enter Solution Text"
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
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

export default precourseqa;

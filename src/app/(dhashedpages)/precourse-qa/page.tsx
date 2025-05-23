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
} from "@chakra-ui/react";

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
    const [ testIdAdd, setTestIdAdd] = useState("");
    const [option1, setOption1] = useState("");
    const [option2, setOption2] = useState("");
     const [option3, setOption3] = useState("");
     const [option4, setOption4] = useState("");
         const [questionid, setQuestionId] = useState("");
         const [correctOption, setCorrectOption] = useState("");
         const [solutionText, setSolutionText] = useState("");
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

  //fetcher to get all test data
  async function fetcherDrop() {
    // const tok =
    //   typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
    console.log(data); 
  //  setPreCourseTestQuestionsMasterId(data.question_id);
    setQuestionNo(data.question_no);
    setEditQuestion(data.question);
    setQuestionId(data.question_id);
    setOption1(data.options[0].option_text);
    setOption2(data.options[1].option_text);
    setOption3(data.options[2].option_text);
    setOption4(data.options[3].option_text);
    // const correct = data.options.find((opt: any) => opt.correct_option === 1);
    // setCorrectOption(correct ? correct.option_id : "");
    setSolutionText(data.solution_text);
    // console.log(data)
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
      // console.log("we are at finally block");
      resetForm();
      onAddModalClose();
    }
  };

//   {
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiNS1hZnNhckBnbWFpbC5jb20tMjAyNTA1MjMxMDE3MjAifQ._YmbjiV7IBLUHBVLwXMX8sBCpGZByLcxhQV2HvGNGO4",
//     "preCourseTestId": "1",
//     "questionNo": "1",
//     "question": "What is the best indicator of monitoring adequate growth
//  in an infant with a birth weight of 2.9 kg during the first year of life?",
//     "solutionText": "A. Increase in length of 25 centimeters in the first year\nLength (or height) is one of the most reliable indicators of adequate growth in infancy. During the first year, a healthy infant typically increases in length by approximately 25 cm, which represents rapid skeletal growth and overall nutritional adequacy. This is a key marker of normal growth.\n\nIncorrect Options:\nB. Weight gain of 300 grams per month till 1 year\nWhile weight gain is an important parameter, the typical weight gain during the first 3 months is around 20-30g per day, which slows to 400-500 grams per month upto 1 year. Option in the question shows inadequate growth.\nC. Anterior fontanelle closure by 6 months of age\nThe anterior fontanelle typically closes by 12-18 months, not by 6 months. Its closure is not a primary indicator of adequate growth during infancy.\nD. Weight under the 75th percentile and height under the 25th percentile\nPercentiles are used to track growth patterns. A weight under the 75th percentile and height under the 25th percentile indicates disproportionate growth and does not reflect adequate overall growth.\n\nConcept Box: Indicators of Adequate Growth in Infancy\n\nReferences:\nNelson Textbook of Pediatrics, 21st Edition: Growth and development milestones in infancy P.No. 151, 3055\nGhai Essential Pediatrics, 9th Edition: Guidelines on growth monitoring and expected changes in weight, length, and head circumference P. No.13,31",
//     "correctOption": "3",
//     "option1": "Increase in length of 25 centimeters in the first year.",
//     "option2": "Weight gain of 300 grams per month till 1 year.",
//     "option3": "Anterior fontanelle closure by 6 months of age.",
//     "option4": "Weight under the 75th percentile and height under the 25th percentile.",
//     "questionId": "144"
// }


// token,
//   questionId,
//   preCourseTestId,
//   questionNo,
//   question,
//   solutionText,
//   correctOption,
//   option1,
//   option2,
//   option3,
//   option4; 

  const handleUpdateCourse = async () => {
    try {
      const form = new FormData();
      form.append("token", localStorage.getItem("token") ?? "");
      // form.append(
      //   "preCourseTestQuestionsMasterId",
      //   preCourseTestQuestionsMasterId
      // );
      form.append("preCourseTestId", testId);
      form.append("questionNo", questionNo);
      form.append("question", editQuestion);
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

      {/* Edit Course Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl"> 
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
                value={correctOption}
              >
                <option value="1">{option1}</option>
                <option value="2">{option2}</option>
                <option value="3">{option3}</option>
                <option value="4">{option4}</option>
              </Select>
            </FormControl>
            <FormControl>
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

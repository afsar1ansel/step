"use client";
import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  Box,
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
  VStack,
} from "@chakra-ui/react";
import { Spinner, Center, CircularProgress } from "@chakra-ui/react";
import { FormHelperText } from "@chakra-ui/react";

import dynamic from "next/dynamic";
import ContentFormatter from "@/app/componant/ContentFormatter";

ModuleRegistry.registerModules([AllCommunityModule]);

const EditorComponent = dynamic(() => import("@/app/componant/editor"), {
  ssr: false,
});

const GameQuestionsPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const toast = useToast();
  const {
    isOpen: isQuestionModalOpen,
    onOpen: onQuestionModalOpen,
    onClose: onQuestionModalClose,
  } = useDisclosure();

  // Top filter states
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Search filter states
  const [selectedModule, setSelectedModule] = useState("Game Module");
  const [searchText, setSearchText] = useState("");

  // AG Grid state
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);

  // Modal states
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalTitle, setModalTitle] = useState("Create New Question");
  const [questionNo, setQuestionNo] = useState("");
  const [questionData, setQuestionData] = useState<any>({ blocks: [] });
  const [solutionData, setSolutionData] = useState<any>({ blocks: [] });
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [modalSelectedSubject, setModalSelectedSubject] = useState("");
  const [questionId, setQuestionId] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [createBtnLoading, setCreateBtnLoading] = useState(false); // NEW
  const [editBtnLoadingId, setEditBtnLoadingId] = useState<string | null>(null); // NEW
  const [addAsIsLoadingId, setAddAsIsLoadingId] = useState<string | null>(null); // NEW

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreQuestions, setHasMoreQuestions] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Data loading
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedModule) {
      fetchQuestions();
    }
  }, [selectedSubject, selectedModule]);

  // Fetch subjects for dropdown
  async function fetchSubjects() {
    const token = localStorage.getItem("token") ?? "";

    if (!baseUrl || !token) {
      toast({
        title: "Configuration Error",
        description: "Missing API configuration or authentication",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      // Updated endpoint to match your backend
      const url = `${baseUrl}/admin/game/subjects/get-all/${token}`;
      console.log("Fetching subjects from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Subjects API Response:", responseData);

      if (responseData.errFlag === 0) {
        setSubjects(Array.isArray(responseData.data) ? responseData.data : []);
      } else {
        throw new Error(responseData.message || "Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setSubjects([]);
    }
  }

  // Fetch questions based on module and subject
  async function fetchQuestions(page = 1, append = false) {
    if (!selectedSubject) {
      setRowData([]);
      return;
    }

    const token = localStorage.getItem("token") ?? "";

    if (!append) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let endpoint = "";
      const pageSize = 20; // Ensure this matches your backend default

      // Updated endpoints with pagination parameters
      switch (selectedModule) {
        case "Game Module":
          endpoint = `${baseUrl}/admin/game/questions/get-by-subject/${selectedSubject}/${token}?page=${page}&limit=${pageSize}`;
          break;
        case "PreCourse Test":
          endpoint = `${baseUrl}/admin/game/questions/get-precourse/${selectedSubject}/${token}`;
          break;
        case "Postcourse Test":
          endpoint = `${baseUrl}/admin/game/questions/get-postcourse/${selectedSubject}/${token}`;
          break;
        case "Subject Test":
          endpoint = `${baseUrl}/admin/game/questions/get-exam/${selectedSubject}/${token}`;
          break;
        default:
          setRowData([]);
          return;
      }

      console.log(`Fetching questions from: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Questions API Response:", responseData);

      // Handle response data
      let parsedData = [];
      if (responseData.errFlag === 0) {
        parsedData = responseData.data || [];

        // Update pagination state only for Game Module (which supports pagination)
        if (selectedModule === "Game Module") {
          setCurrentPage(responseData.page || page);
          setHasMoreQuestions(responseData.hasMore || false);
        }
      } else {
        throw new Error(responseData.message || "Failed to fetch questions");
      }

      // Parse JSON strings in question and solution fields if needed
      parsedData = parsedData.map((row: any) => {
        let questionValue, solutionValue;

        // Parse question data
        try {
          const questionField = row.question || row.question_text;
          questionValue =
            typeof questionField === "string"
              ? JSON.parse(questionField)
              : questionField;
        } catch {
          questionValue = {
            blocks: [
              {
                type: "paragraph",
                data: { text: row.question || row.question_text || "" },
              },
            ],
          };
        }

        // Parse solution data
        try {
          solutionValue =
            typeof row.solution_text === "string"
              ? JSON.parse(row.solution_text)
              : row.solution_text;
        } catch {
          solutionValue = {
            blocks: [
              { type: "paragraph", data: { text: row.solution_text || "" } },
            ],
          };
        }

        return {
          ...row,
          question: questionValue,
          question_text: questionValue,
          solution_text: solutionValue,
        };
      });

      // If loading more pages, append to existing data rather than replacing
      if (append) {
        setRowData((prevData) => [...prevData, ...parsedData]);
      } else {
        setRowData(parsedData);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      if (!append) {
        setRowData([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  // Function to load the next page of data
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreQuestions) {
      fetchQuestions(currentPage + 1, true);
    }
  };

  const handleSearch = () => {
    if (!selectedSubject) {
      toast({
        title: "Subject required",
        description: "Please select a subject before searching.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    fetchQuestions();
  };

  // Create new game module question
  async function handleSaveQuestion() {
    const token = localStorage.getItem("token") ?? "";

    // Updated validation - questionNo is required for all modes now
    if (
      !questionNo ||
      !modalSelectedSubject ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctOption
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("subjectId", modalSelectedSubject);
      formData.append("questionNo", questionNo);
      formData.append("question", JSON.stringify(questionData));
      formData.append("solutionText", JSON.stringify(solutionData));
      formData.append("option1", option1);
      formData.append("option2", option2);
      formData.append("option3", option3);
      formData.append("option4", option4);
      formData.append("correctOption", correctOption);

      let endpoint = "";
      if (isEditMode && modalTitle === "Edit Question") {
        formData.append("questionId", questionId);
        endpoint = `${baseUrl}/admin/game/questions/update`;
      } else if (isEditMode && modalTitle === "Edit & Add Question") {
        // For Edit & Add, we still send questionNo as it's now manual
        formData.append("sourceQuestionId", questionId);
        formData.append("sourceModule", selectedModule);
        endpoint = `${baseUrl}/admin/game/questions/copy-from-module`;
      } else {
        endpoint = `${baseUrl}/admin/game/questions/create`;
      }

      console.log("Sending request to:", endpoint);
      console.log("Form data entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description:
            responseData.message ||
            `Question ${
              modalTitle === "Edit & Add Question"
                ? "copied to Game Module"
                : isEditMode
                ? "updated"
                : "created"
            } successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        onQuestionModalClose();
        fetchQuestions(); // Refresh the grid
      } else {
        throw new Error(responseData.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          modalTitle === "Edit & Add Question"
            ? "copy question"
            : isEditMode
            ? "update"
            : "create"
        } question`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  }

  // Edit and Add question (from other modules to Game Module)
  async function handleEditAndAdd(questionData: any) {
    const token = localStorage.getItem("token") ?? "";

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("sourceQuestionId", questionData.id);
      formData.append("sourceModule", selectedModule);
      formData.append("subjectId", selectedSubject);

      // Get the next question number for "Add as is"
      const nextQuestionResponse = await fetch(
        `${baseUrl}/admin/game/questions/get-next-question-no/${selectedSubject}/${token}`,
        { method: "GET" }
      );

      let nextQuestionNo = 1;
      if (nextQuestionResponse.ok) {
        const nextQuestionData = await nextQuestionResponse.json();
        if (nextQuestionData.errFlag === 0) {
          nextQuestionNo = nextQuestionData.data.next_question_no;
        }
      }

      formData.append("questionNo", nextQuestionNo.toString());
      formData.append("question", JSON.stringify(questionData.question));
      formData.append(
        "solutionText",
        JSON.stringify(questionData.solution_text)
      );
      formData.append("option1", questionData.options?.[0]?.option_text || "");
      formData.append("option2", questionData.options?.[1]?.option_text || "");
      formData.append("option3", questionData.options?.[2]?.option_text || "");
      formData.append("option4", questionData.options?.[3]?.option_text || "");

      // Find correct option
      const correctOpt = questionData.options?.find(
        (opt: any) => opt.correct_option === 1 || opt.correct_option === "1"
      );
      const correctOptIndex = correctOpt
        ? questionData.options.indexOf(correctOpt) + 1
        : 1;
      formData.append("correctOption", correctOptIndex.toString());

      const response = await fetch(
        `${baseUrl}/admin/game/questions/copy-from-module`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Question added to Game Module successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        // Remove from current view if not already in Game Module
        if (selectedModule !== "Game Module") {
          setRowData((prev) => prev.filter((q) => q.id !== questionData.id));
        }
      } else {
        throw new Error(responseData.message || "Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question to Game Module",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  }

  // Change question status
  async function handleStatusChange(
    questionId: string,
    currentStatus: boolean
  ) {
    const token = localStorage.getItem("token") ?? "";
    const newStatus = currentStatus ? "0" : "1"; // Toggle status

    try {
      const response = await fetch(
        `${baseUrl}/admin/game/questions/change-status/${questionId}/${newStatus}/${token}`,
        {
          method: "GET",
        }
      );

      const responseData = await response.json();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: `Question ${
            currentStatus ? "disabled" : "enabled"
          } successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        fetchQuestions(); // Refresh the grid
      } else {
        throw new Error(responseData.message || "Failed to change status");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast({
        title: "Error",
        description: "Failed to change question status",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  }

  useEffect(() => {
    const actionsCellRenderer = (params: any) => {
      const handleEdit = () => {
        setEditBtnLoadingId(params.data.id); // NEW
        setIsEditMode(true);
        setModalTitle("Edit Question");
        setQuestionNo(params.data.question_no);

        // Handle question data parsing
        let questionValue = params.data.question || params.data.question_text;
        if (typeof questionValue === "string") {
          try {
            questionValue = JSON.parse(questionValue);
          } catch {
            questionValue = {
              blocks: [
                { type: "paragraph", data: { text: questionValue || "" } },
              ],
            };
          }
        }
        setQuestionData(questionValue || { blocks: [] });

        // Handle solution data parsing
        let solutionValue = params.data.solution_text;
        if (typeof solutionValue === "string") {
          try {
            solutionValue = JSON.parse(solutionValue);
          } catch {
            solutionValue = {
              blocks: [
                { type: "paragraph", data: { text: solutionValue || "" } },
              ],
            };
          }
        }
        setSolutionData(solutionValue || { blocks: [] });

        setOption1(params.data.options?.[0]?.option_text || "");
        setOption2(params.data.options?.[1]?.option_text || "");
        setOption3(params.data.options?.[2]?.option_text || "");
        setOption4(params.data.options?.[3]?.option_text || "");

        // Find correct option
        const correctOpt = params.data.options?.find(
          (opt: any) => opt.correct_option === 1 || opt.correct_option === "1"
        );
        if (correctOpt) {
          const optionIndex = params.data.options.indexOf(correctOpt);
          setCorrectOption((optionIndex + 1).toString());
        } else {
          setCorrectOption("1");
        }

        setQuestionId(params.data.id);
        setModalSelectedSubject(selectedSubject);
        onQuestionModalOpen();
        setTimeout(() => setEditBtnLoadingId(null), 500); // NEW
      };

      const handleEditAndAddClick = () => {
        setIsEditMode(true);
        setModalTitle("Edit & Add Question");
        // Set the current question no as starting point for Edit & Add
        setQuestionNo(params.data.question_no);

        // Same logic as handleEdit for pre-filling
        let questionValue = params.data.question || params.data.question_text;
        if (typeof questionValue === "string") {
          try {
            questionValue = JSON.parse(questionValue);
          } catch {
            questionValue = {
              blocks: [
                { type: "paragraph", data: { text: questionValue || "" } },
              ],
            };
          }
        }
        setQuestionData(questionValue || { blocks: [] });

        let solutionValue = params.data.solution_text;
        if (typeof solutionValue === "string") {
          try {
            solutionValue = JSON.parse(solutionValue);
          } catch {
            solutionValue = {
              blocks: [
                { type: "paragraph", data: { text: solutionValue || "" } },
              ],
            };
          }
        }
        setSolutionData(solutionValue || { blocks: [] });

        setOption1(params.data.options?.[0]?.option_text || "");
        setOption2(params.data.options?.[1]?.option_text || "");
        setOption3(params.data.options?.[2]?.option_text || "");
        setOption4(params.data.options?.[3]?.option_text || "");

        const correctOpt = params.data.options?.find(
          (opt: any) => opt.correct_option === 1 || opt.correct_option === "1"
        );
        if (correctOpt) {
          const optionIndex = params.data.options.indexOf(correctOpt);
          setCorrectOption((optionIndex + 1).toString());
        } else {
          setCorrectOption("1");
        }

        // Set the questionId for "Edit & Add" mode - this is needed for the backend
        setQuestionId(params.data.id);
        setModalSelectedSubject(selectedSubject);
        onQuestionModalOpen();
      };

      const handleAddAsIs = () => {
        setAddAsIsLoadingId(params.data.id); // NEW
        handleEditAndAdd(params.data);
        setTimeout(() => setAddAsIsLoadingId(null), 500); // NEW
      };

      if (selectedModule === "Game Module") {
        return (
          <HStack spacing={2}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleEdit}
              isDisabled={editBtnLoadingId === params.data.id}
            >
              {editBtnLoadingId === params.data.id ? (
                <HStack>
                  <Spinner size="xs" /> <span>Loading...</span>
                </HStack>
              ) : (
                "Edit"
              )}
            </Button>
            <Switch
              isChecked={params.data.status === 1}
              onChange={() =>
                handleStatusChange(params.data.id, params.data.status === 1)
              }
              colorScheme="green"
            />
          </HStack>
        );
      } else {
        return (
          <HStack spacing={2}>
            <Button
              colorScheme="green"
              size="sm"
              onClick={handleAddAsIs}
              isDisabled={addAsIsLoadingId === params.data.id}
            >
              {addAsIsLoadingId === params.data.id ? (
                <HStack>
                  <Spinner size="xs" /> <span>Loading...</span>
                </HStack>
              ) : (
                "Add as is"
              )}
            </Button>
            <Button
              colorScheme="purple"
              size="sm"
              onClick={handleEditAndAddClick}
            >
              Edit & Add
            </Button>
          </HStack>
        );
      }
    };

    setColumnDefs([
      {
        headerName: "S.No.",
        maxWidth: 80,
        filter: false,
        valueGetter: (params: any) => {
          // Get the current page and page size
          const startIndex =
            params.api.paginationGetCurrentPage() *
            params.api.paginationGetPageSize();
          return startIndex + params.node.rowIndex + 1;
        },
        cellStyle: { textAlign: "center" },
      },
      {
        field: "question_no",
        headerName: "Q.No.",
        maxWidth: 80,
        filter: false,
      },
      {
        field: "question",
        headerName: "Question",
        cellRenderer: (params: any) => (
          <ContentFormatter
            content={params.value || params.data.question_text}
          />
        ),
        flex: 2,
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
          const isCorrect =
            params.data.options?.[0]?.correct_option === 1 ||
            params.data.options?.[0]?.correct_option === "1";
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
                backgroundColor: isCorrect ? "#e6f7e6" : "transparent",
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
          const isCorrect =
            params.data.options?.[1]?.correct_option === 1 ||
            params.data.options?.[1]?.correct_option === "1";
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
                backgroundColor: isCorrect ? "#e6f7e6" : "transparent",
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
          const isCorrect =
            params.data.options?.[2]?.correct_option === 1 ||
            params.data.options?.[2]?.correct_option === "1";
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
                backgroundColor: isCorrect ? "#e6f7e6" : "transparent",
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
          const isCorrect =
            params.data.options?.[3]?.correct_option === 1 ||
            params.data.options?.[3]?.correct_option === "1";
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
                backgroundColor: isCorrect ? "#e6f7e6" : "transparent",
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
        flex: 2,
        cellRenderer: (params: any) => {
          return <ContentFormatter content={params.value} />;
        },
      },
      {
        headerName: "Actions",
        cellRenderer: actionsCellRenderer,
        flex: 1,
        minWidth: 240,
        filter: false,
      },
    ]);
  }, [selectedModule, onQuestionModalOpen, toast, selectedSubject]);

  const resetModalForm = () => {
    setQuestionNo("");
    setQuestionData({ blocks: [] });
    setSolutionData({ blocks: [] });
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setCorrectOption("");
    setModalSelectedSubject("");
    setQuestionId("");
  };

  const handleCreateNewQuestion = () => {
    setCreateBtnLoading(true); // NEW
    setIsEditMode(false);
    setModalTitle("Create New Question");
    resetModalForm();
    setModalSelectedSubject(selectedSubject);
    onQuestionModalOpen();
    setTimeout(() => setCreateBtnLoading(false), 500); // NEW: Prevent double click for 0.5s
  };

  // const handleSaveQuestion = handleSaveQuestion; // Use the new implementation

  return (
    <Box p={4} w="80vw">
      <VStack spacing={4} align="stretch">
        {/* Combined Filters and Actions Row */}
        <Box p={4} bg="white" borderRadius="md" shadow="sm">
          <HStack spacing={4} justify="space-between" align="flex-end">
            <HStack spacing={4} flex={1}>
              <FormControl>
                <FormLabel>Select Module</FormLabel>
                <Select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <option value="Game Module">Game Module</option>
                  <option value="PreCourse Test">PreCourse Test</option>
                  <option value="Postcourse Test">Postcourse Test</option>
                  <option value="Subject Test">Subject Test</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Select Subject</FormLabel>
                <Select
                  placeholder="Select Subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option
                      key={subject.id || subject.subject_id}
                      value={subject.id || subject.subject_id}
                    >
                      {subject.subject_name || subject.name || subject.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>
            <Button
              colorScheme="blue"
              onClick={handleCreateNewQuestion}
              whiteSpace="nowrap"
              isDisabled={!selectedSubject || createBtnLoading}
            >
              {createBtnLoading ? (
                <HStack>
                  <Spinner size="xs" /> <span>Loading...</span>
                </HStack>
              ) : (
                "Create New Question"
              )}
            </Button>
          </HStack>
        </Box>

        {/* Grid */}
        <Box p={4} bg="white" borderRadius="md" shadow="sm">
          {isLoading ? (
            <Center h="400px">
              <CircularProgress isIndeterminate color="blue.300" />
            </Center>
          ) : (
            <VStack spacing={0} align="stretch">
              <Box className="ag-theme-alpine" h="auto" minH="400px" w="100%">
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                  pagination={true}
                  paginationPageSize={5} // This determines how many rows show per page
                  paginationPageSizeSelector={[5, 10, 20, 50]}
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
                    return 300;
                  }}
                  suppressCellFocus={true}
                />
              </Box>

              {/* Load more button for Game Module only - outside grid but still in the white box */}
              {selectedModule === "Game Module" && (
                <Box mt={4} textAlign="center" pb={2}>
                  {isLoadingMore && <Spinner size="md" color="blue.500" />}

                  {hasMoreQuestions && !isLoadingMore && (
                    <Button
                      colorScheme="blue"
                      onClick={handleLoadMore}
                      size="lg"
                      leftIcon={<span>⏬</span>}
                    >
                      Load More Questions
                    </Button>
                  )}
                </Box>
              )}
            </VStack>
          )}
        </Box>
      </VStack>

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={onQuestionModalClose}
        size="4xl"
        onCloseComplete={resetModalForm}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" maxHeight="70vh">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Select Subject</FormLabel>
                <Select
                  placeholder="Select Subject"
                  value={modalSelectedSubject}
                  onChange={(e) => setModalSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option
                      key={subject.id || subject.subject_id}
                      value={subject.id || subject.subject_id}
                    >
                      {subject.subject_name || subject.name || subject.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Question No field is now always visible */}
              <FormControl isRequired>
                <FormLabel>Question No</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter Question Number"
                  value={questionNo}
                  onChange={(e) => setQuestionNo(e.target.value)}
                />
                {modalTitle === "Edit & Add Question" && (
                  <FormHelperText color="blue.600">
                    You can modify this question number as needed
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Question</FormLabel>
                <Box border="1px solid #ccc" borderRadius="md" p={2}>
                  <EditorComponent
                    data={questionData}
                    onChange={setQuestionData}
                    holder="question-editor"
                  />
                </Box>
              </FormControl>
              <FormControl>
                <FormLabel>Solution Text</FormLabel>
                <Box border="1px solid #ccc" borderRadius="md" p={2}>
                  <EditorComponent
                    data={solutionData}
                    onChange={setSolutionData}
                    holder="solution-editor"
                  />
                </Box>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Option 1</FormLabel>
                <Input
                  placeholder="Enter Option 1"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Option 2</FormLabel>
                <Input
                  placeholder="Enter Option 2"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Option 3</FormLabel>
                <Input
                  placeholder="Enter Option 3"
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Option 4</FormLabel>
                <Input
                  placeholder="Enter Option 4"
                  value={option4}
                  onChange={(e) => setOption4(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Correct Option</FormLabel>
                <Select
                  placeholder="Select correct option"
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                >
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                  <option value="4">Option 4</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onQuestionModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={async () => {
                if (isLoading) return;
                await handleSaveQuestion();
              }}
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              {isLoading ? (
                <HStack>
                  <Spinner size="xs" /> <span>Loading...</span>
                </HStack>
              ) : modalTitle === "Edit & Add Question" ? (
                "Edit & Add"
              ) : isEditMode ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GameQuestionsPage;

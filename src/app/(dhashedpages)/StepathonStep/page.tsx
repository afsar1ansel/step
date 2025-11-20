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
  Text,
} from "@chakra-ui/react";

import dynamic from "next/dynamic";
// Dynamically importing ExamEditorComponent to prevent SSR issues
const ExamEditorComponent = dynamic(
  () => import("@/app/componant/examEditor"),
  {
    ssr: false,
  }
);

// Assuming these imports are available relative to StepathonStep.tsx
import ContentFormatter from "@/app/componant/ContentFormatter";

ModuleRegistry.registerModules([AllCommunityModule]);

// Utility function to format date
const formatDate = (dateValue: any) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return date.toLocaleDateString("en-IN", options);
};

// Utility function to safely parse EditorJS JSON data
const safeParseEditorData = (data: string | any): any => {
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return parsed.blocks && Array.isArray(parsed.blocks)
        ? parsed
        : { blocks: [] };
    } catch (error) {
      console.warn("Error parsing EditorJS JSON:", error);
      return { blocks: [] };
    }
  }
  return data && data.blocks && Array.isArray(data.blocks)
    ? data
    : { blocks: [] };
};

// Define Option structure (using snake_case for internal state/submission)
interface Option {
  id: number | null;
  option_text: any; // EditorJS data
  explanation_text: any; // EditorJS data
  is_correct: 0 | 1;
}

// Define Question/Step structure
interface QuestionRow {
  id: number;
  concept_id: number;
  question_text: any; // EditorJS data
  hint: any; // EditorJS data
  created_at: string;
  status: 0 | 1;
  // Note: Data fetching returns options with camelCase, but we define the type
  // based on the expected final structure or how the API response is used.
  // The columnDefs below access the camelCase properties directly from the rowData.
  options?: any[];
}

const emptyEditorData = { blocks: [] };
const initialOptionsState: Option[] = [
  {
    id: null,
    option_text: emptyEditorData,
    explanation_text: emptyEditorData,
    is_correct: 0,
  },
  {
    id: null,
    option_text: emptyEditorData,
    explanation_text: emptyEditorData,
    is_correct: 0,
  },
  {
    id: null,
    option_text: emptyEditorData,
    explanation_text: emptyEditorData,
    is_correct: 0,
  },
  {
    id: null,
    option_text: emptyEditorData,
    explanation_text: emptyEditorData,
    is_correct: 0,
  },
];
const optionLabels = ["A", "B", "C", "D"];

const StepathonStep = () => {
  // Environment variables and hooks
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const gameUrl = process.env.NEXT_PUBLIC_GAME_URL;
  const toast = useToast();

  // Data states
  const [rowData, setRowData] = useState<QuestionRow[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [chaptersBySubject, setChaptersBySubject] = useState<any[]>([]);
  const [allConcepts, setAllConcepts] = useState<any[]>([]);

  // Filter states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");
  const [selectedChapterFilter, setSelectedChapterFilter] = useState("");
  const [selectedConceptFilter, setSelectedConceptFilter] = useState("");

  // Modal states
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null
  );

  // Form states
  const [questionText, setQuestionText] = useState<any>({ blocks: [] });
  const [hintText, setHintText] = useState<any>({ blocks: [] });
  const [options, setOptions] = useState<Option[]>(initialOptionsState);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(
    null
  ); // 0, 1, 2, or 3

  // Modal Dropdowns (Subject/Chapter/Concept)
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState("");
  const [chaptersForModal, setChaptersForModal] = useState<any[]>([]);
  const [selectedChapterForModal, setSelectedChapterForModal] = useState("");
  const [conceptsForModal, setConceptsForModal] = useState<any[]>([]);
  const [selectedConceptForModal, setSelectedConceptForModal] = useState("");

  // --- Fetch Data Logic (Keep original logic) ---

  // 1. Fetch all subjects
  useEffect(() => {
    if (token && baseUrl) {
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
        .then((response) => response.json())
        .then((data) => {
          setAllSubjects(data);
          const defaultSubject = data[0];
          if (defaultSubject) {
            setSelectedSubjectFilter(defaultSubject.subject_id.toString());
          }
        })
        .catch((error) => console.error("Error fetching subjects:", error));
    }
  }, [token, baseUrl]);

  // 2. Fetch chapters based on selected subject filter/modal subject
  const fetchChapters = (
    subjectId: string,
    setTarget: React.Dispatch<React.SetStateAction<any[]>>,
    setDefaultChapter: boolean
  ) => {
    if (token && gameUrl && subjectId) {
      const url = `${gameUrl}/masters/chapter/get-by-subject/${subjectId}`;
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.json())
        .then((data) => {
          const chaptersArray = Array.isArray(data) ? data : [];
          setTarget(chaptersArray);
          if (setDefaultChapter && chaptersArray.length > 0) {
            setSelectedChapterFilter(chaptersArray[0].id.toString());
          }
        })
        .catch((error) => console.error("Error fetching chapters:", error));
    } else {
      setTarget([]);
      if (setDefaultChapter) setSelectedChapterFilter("");
    }
  };

  useEffect(() => {
    fetchChapters(selectedSubjectFilter, setChaptersBySubject, true);
  }, [selectedSubjectFilter, token, gameUrl]);

  useEffect(() => {
    fetchChapters(selectedSubjectForModal, setChaptersForModal, false);
    setSelectedConceptForModal(""); // Reset concept when modal chapter changes
    setConceptsForModal([]);
  }, [selectedSubjectForModal, token, gameUrl]);

  // 3. Fetch concepts based on selected chapter filter/modal chapter
  const fetchConcepts = (
    chapterId: string,
    setTarget: React.Dispatch<React.SetStateAction<any[]>>,
    setDefaultConcept: boolean
  ) => {
    if (token && gameUrl && chapterId) {
      const url = `${gameUrl}/masters/concept/get-by-chapter/${chapterId}`;
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.json())
        .then((data) => {
          const conceptsArray = Array.isArray(data?.data) ? data.data : [];
          setTarget(conceptsArray);
          if (setDefaultConcept && conceptsArray.length > 0) {
            setSelectedConceptFilter(conceptsArray[0].id.toString());
          }
        })
        .catch((error) => console.error("Error fetching concepts:", error));
    } else {
      setTarget([]);
      if (setDefaultConcept) setSelectedConceptFilter("");
    }
  };

  useEffect(() => {
    fetchConcepts(selectedChapterFilter, setAllConcepts, true);
  }, [selectedChapterFilter, token, gameUrl]);

  useEffect(() => {
    fetchConcepts(selectedChapterForModal, setConceptsForModal, false);
  }, [selectedChapterForModal, token, gameUrl]);

  // 4. Fetch questions (steps) based on selected concept filter
  const fetchQuestions = React.useCallback(async () => {
    if (token && gameUrl && selectedConceptFilter) {
      const url = `${gameUrl}/masters/question/get-by-concept/${selectedConceptFilter}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setRowData(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setRowData([]);
      }
    } else {
      setRowData([]);
    }
  }, [token, gameUrl, selectedConceptFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // --- Grid Column Definitions ---

  const [columnDefs] = useState<ColDef<QuestionRow>[]>([
    {
      headerName: "S.No.",
      valueGetter: "node.rowIndex + 1", // Use row index for S.No.
      maxWidth: 80,
      filter: false,
    },
    {
      headerName: "Question",
      field: "question_text",
      minWidth: 250,
      filter: false,
      cellRenderer: (params: any) => {
        const contentData = safeParseEditorData(params.value);
        return <ContentFormatter content={contentData} />;
      },
      cellStyle: { height: "100%", padding: "8px" },
      autoHeight: true,
    },
    // {
    //   headerName: "Hint",
    //   field: "hint",
    //   minWidth: 150,
    //   filter: false,
    //   valueGetter: (params) => (params.data?.hint ? "View Hint" : "N/A"),
    // },
    // Dynamically create columns for Options A, B, C, D
    ...(optionLabels.map((label, index) => ({
      headerName: `Option ${label}`,
      minWidth: 150,
      filter: false,
      valueGetter: (params: any) => {
        // Note: Accessing camelCase properties from the provided API data structure
        return params.data?.options?.[index]?.optionText;
      },
      cellRenderer: (params: any) => {
        const optionContent = params.data?.options?.[index]?.optionText;
        const contentData = safeParseEditorData(optionContent);
        return <ContentFormatter content={contentData} />;
      },
      cellStyle: (params: any) => ({
        height: "100%",
        padding: "8px",
        // Highlight the correct option (using camelCase isCorrect from API data)
        backgroundColor:
          params.data?.options?.[index]?.isCorrect === 1 ? "#e6fffa" : "white",
      }),
      autoHeight: true,
    })) as ColDef<QuestionRow>[]),
    {
      headerName: "Correct",
      field: "options",
      maxWidth: 100,
      filter: false,
      valueGetter: (params) => {
        const correctIndex = params.data?.options?.findIndex(
          // Note: Accessing camelCase isCorrect from the provided API data structure
          (opt: any) => opt.isCorrect === 1
        );
        return correctIndex !== undefined && correctIndex !== -1
          ? optionLabels[correctIndex]
          : "N/A";
      },
      cellStyle: { textAlign: "center", fontWeight: "bold" },
    },
    // {
    //   headerName: "Created At",
    //   field: "created_at",
    //   maxWidth: 120,
    //   cellRenderer: (params: { value: any }) => formatDate(params.value),
    // },
    {
      headerName: "Status",
      field: "status",
      cellStyle: { textAlign: "center" },
      filter: false,
      maxWidth: 100,
      cellRenderer: (params: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80%",
          }}
        >
          <Switch
            colorScheme="green"
            onChange={() => handleToggle(params.data)}
            defaultChecked={params.value === 1}
          />
        </div>
      ),
    },
    {
      headerName: "Actions",
      filter: false,
      maxWidth: 100,
      cellRenderer: (params: any) => (
        <div>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => handleEdit(params.data)}
            variant="outline"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ]);

  // --- Form & Modal Handlers (Minor Fixes to handle Option property naming) ---

  const resetForm = () => {
    setQuestionText(emptyEditorData);
    setHintText(emptyEditorData);
    setOptions(initialOptionsState);
    setCorrectOptionIndex(null);
    setIsEditMode(false);
    setCurrentQuestionId(null);

    // Set modal filters to current table filters
    const currentConcept = allConcepts.find(
      (c) => c.id.toString() === selectedConceptFilter
    );
    if (currentConcept) {
      const currentChapter = chaptersBySubject.find(
        (ch) => ch.id === currentConcept.chapter_id
      );
      if (currentChapter) {
        setSelectedSubjectForModal(currentChapter.subject_id.toString());
        setSelectedChapterForModal(currentChapter.id.toString());
      }
      setSelectedConceptForModal(selectedConceptFilter);
    } else {
      setSelectedSubjectForModal(selectedSubjectFilter);
      setSelectedChapterForModal(selectedChapterFilter);
      setSelectedConceptForModal("");
    }
  };

  const handleModalOpen = () => {
    resetForm();
    onModalOpen();
  };

  const handleModalClose = () => {
    resetForm();
    onModalClose();
  };

  const handleEdit = async (questionData: QuestionRow) => {
    setIsEditMode(true);
    setCurrentQuestionId(questionData.id);

    // 1. Set Question/Hint Text
    setQuestionText(safeParseEditorData(questionData.question_text));
    setHintText(safeParseEditorData(questionData.hint));

    // 2. Set Dropdowns (Need to find parent concept/chapter/subject from questionData)
    setSelectedConceptForModal(questionData.concept_id.toString());

    const concept = allConcepts.find((c) => c.id === questionData.concept_id);
    if (concept) {
      const chapter = chaptersBySubject.find(
        (ch) => ch.id === concept.chapter_id
      );
      if (chapter) {
        setSelectedSubjectForModal(chapter.subject_id.toString());
        setSelectedChapterForModal(chapter.id.toString());
      }
    }

    // 3. Fetch Options (using the nested options data if available, or the separate API call)
    try {
      let optionsData = questionData.options;

      // If options are not directly available in rowData, call the separate API
      if (!optionsData) {
        const optionsUrl = `${gameUrl}/masters/question/get-options/${questionData.id}`;
        const response = await fetch(optionsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        // console.log(data);
        optionsData = data.data;
      }

      if (Array.isArray(optionsData) && optionsData.length === 4) {
        const fetchedOptions = optionsData.map((opt: any) => ({
          id: opt.id,
          // FIX: Use opt.optionText and opt.explanationText from the fetched data
          option_text: safeParseEditorData(opt.optionText),
          explanation_text: safeParseEditorData(opt.explanationText),
          is_correct: opt.isCorrect, // FIX: Use opt.isCorrect
        }));

        setOptions(fetchedOptions);
        const correctIndex = fetchedOptions.findIndex(
          (opt: Option) => opt.is_correct === 1
        );
        setCorrectOptionIndex(correctIndex >= 0 ? correctIndex : null);
      } else {
        setOptions(initialOptionsState);
        setCorrectOptionIndex(null);
        toast({
          title: "Warning",
          description:
            "Options data for this question is incomplete or missing.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      toast({
        title: "Error",
        description: "Failed to fetch question options.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setOptions(initialOptionsState);
      setCorrectOptionIndex(null);
    }

    onModalOpen();
  };

  const handleOptionChange = (index: number, key: keyof Option, value: any) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt))
    );
  };

  const handleToggle = async (data: QuestionRow) => {
    const newStatus = data.status === 1 ? 0 : 1;
    try {
      const response = await fetch(
        `${gameUrl}/masters/question/change-status/${newStatus}/${data.id}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      const resData = await response.json();

      if (response.ok && resData.errFlag === 0) {
        setRowData((prev) =>
          prev.map((row) =>
            row.id === data.id ? { ...row, status: newStatus } : row
          )
        );
        toast({
          title: "Success",
          description: resData.message || "Status updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: resData.message || "Failed to update status.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddOrUpdateStep = () => {
    // 1. Validation
    if (
      !selectedConceptForModal ||
      questionText.blocks.length === 0 ||
      correctOptionIndex === null ||
      options.some(
        (opt) =>
          opt.option_text.blocks.length === 0 ||
          opt.explanation_text.blocks.length === 0
      )
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Question, Options, Explanations) and select the Correct Option.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // 2. Prepare nested data structure for submission
    // FIX: Mapping internal snake_case to external camelCase
    const submittedOptions = options.map((opt, index) => ({
      // Pass ID for updates, null for new
      id: opt.id,
      // Map internal option_text (EditorJS object) to external optionText (JSON string)
      optionText: JSON.stringify(opt.option_text),
      // Map internal explanation_text (EditorJS object) to external explanationText (JSON string)
      explanationText: JSON.stringify(opt.explanation_text),
      // Set the correct option flag using the calculated index
      isCorrect: index === correctOptionIndex ? 1 : 0,
    }));

    const formData = new FormData();
    formData.append("token", token || "");
    formData.append("conceptId", selectedConceptForModal);
    formData.append("questionText", JSON.stringify(questionText));
    formData.append("hint", JSON.stringify(hintText));
    formData.append("options", JSON.stringify(submittedOptions));
    if (isEditMode) {
      formData.append("questionId", String(currentQuestionId));
    }
    console.log(Object.fromEntries(formData));

    const url = isEditMode
      ? `${gameUrl}/masters/question/update`
      : `${gameUrl}/masters/question/add`;

    // NOTE: Sending as JSON content type for nested payload
    // We remove the intermediate FormData usage and send the JSON payload directly.
    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.errFlag === 0) {
          toast({
            title: "Success",
            description: data.message,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          fetchQuestions();
          handleModalClose();
        } else {
          toast({
            title: isEditMode
              ? "Error Updating Question"
              : "Error Adding Question",
            description: data.message,
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error submitting question:", error);
        toast({
          title: "Error",
          description: `An error occurred while ${
            isEditMode ? "updating" : "adding"
          } the question.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <div style={{ width: "100%", height: "auto" }}>
      {/* Header and Filters */}
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Steps/Questions</p>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Subject Filter Dropdown */}
          <Box minW="150px">
            <Select
              placeholder="Subject"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            >
              {allSubjects.map((subject: any) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </Select>
          </Box>

          {/* Chapter Filter Dropdown */}
          <Box minW="150px">
            <Select
              placeholder="Chapter"
              value={selectedChapterFilter}
              onChange={(e) => setSelectedChapterFilter(e.target.value)}
              isDisabled={!chaptersBySubject || chaptersBySubject.length === 0}
            >
              {chaptersBySubject.map((chapter: any) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </Select>
          </Box>

          {/* Concept Filter Dropdown */}
          <Box minW="150px">
            <Select
              placeholder="Concept"
              value={selectedConceptFilter}
              onChange={(e) => setSelectedConceptFilter(e.target.value)}
              isDisabled={!allConcepts || allConcepts.length === 0}
            >
              {allConcepts.map((concept: any) => (
                <option key={concept.id} value={concept.id}>
                  {concept.name}
                </option>
              ))}
            </Select>
          </Box>

          <Button
            onClick={handleModalOpen}
            colorScheme="green"
            // disabled={!selectedConceptFilter}
          >
            Add Step
          </Button>
        </div>
      </div>
      <hr />

      {/* AG Grid Table for Questions */}
      <div style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={false}
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
          suppressCellFocus={true}
        />
      </div>

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Edit Question/Step" : "Add New Question/Step"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Subject, Chapter, Concept Selectors */}
              <Box display="flex" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    placeholder="Select Subject"
                    value={selectedSubjectForModal}
                    onChange={(e) => setSelectedSubjectForModal(e.target.value)}
                    isDisabled={isEditMode}
                  >
                    {allSubjects.map((subject: any) => (
                      <option
                        key={subject.subject_id}
                        value={subject.subject_id}
                      >
                        {subject.subject_name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Chapter</FormLabel>
                  <Select
                    placeholder="Select Chapter"
                    value={selectedChapterForModal}
                    onChange={(e) => setSelectedChapterForModal(e.target.value)}
                    isDisabled={!chaptersForModal.length || isEditMode}
                  >
                    {chaptersForModal.map((chapter: any) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Concept</FormLabel>
                  <Select
                    placeholder="Select Concept"
                    value={selectedConceptForModal}
                    onChange={(e) => setSelectedConceptForModal(e.target.value)}
                    isDisabled={!conceptsForModal.length || isEditMode}
                  >
                    {conceptsForModal.map((concept: any) => (
                      <option key={concept.id} value={concept.id}>
                        {concept.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Question */}
              <FormControl isRequired>
                <FormLabel>Question Text</FormLabel>
                <Box border="1px solid #ccc" padding="10px" borderRadius="md">
                  <ExamEditorComponent
                    data={questionText}
                    onChange={setQuestionText}
                    holder="questions-question-editor"
                  />
                </Box>
              </FormControl>

              {/* Hint */}
              <FormControl>
                <FormLabel>Hint (Optional)</FormLabel>
                <Box border="1px solid #ccc" padding="10px" borderRadius="md">
                  <ExamEditorComponent
                    data={hintText}
                    onChange={setHintText}
                    holder="questions-hint-editor"
                  />
                </Box>
              </FormControl>

              <Text fontSize="lg" fontWeight="semibold" mt={4}>
                Options and Explanations (4 Required)
              </Text>

              {/* Options Loop (A, B, C, D) */}
              {options.map((opt, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg={index === correctOptionIndex ? "green.50" : "gray.50"}
                >
                  <Text fontWeight="bold" mb={2}>
                    Option {optionLabels[index]}
                  </Text>

                  {/* Option Text */}
                  <FormControl isRequired mb={2}>
                    <FormLabel fontSize="sm">
                      Option {optionLabels[index]} Text
                    </FormLabel>
                    <Box
                      border="1px solid #ddd"
                      padding="8px"
                      borderRadius="md"
                    >
                      <ExamEditorComponent
                        data={opt.option_text}
                        onChange={(data: any) =>
                          handleOptionChange(index, "option_text", data)
                        }
                        holder={`questions-option${optionLabels[
                          index
                        ].toLowerCase()}-editor`}
                      />
                    </Box>
                  </FormControl>

                  {/* Option Explanation */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">
                      Explanation for Option {optionLabels[index]}
                    </FormLabel>
                    <Box
                      border="1px solid #ddd"
                      padding="8px"
                      borderRadius="md"
                    >
                      <ExamEditorComponent
                        data={opt.explanation_text}
                        onChange={(data: any) =>
                          handleOptionChange(index, "explanation_text", data)
                        }
                        holder={`questions-explanation${optionLabels[
                          index
                        ].toLowerCase()}-editor`}
                      />
                    </Box>
                  </FormControl>
                </Box>
              ))}

              {/* Correct Option Selector */}
              <FormControl isRequired mt={4}>
                <FormLabel>Select Correct Option</FormLabel>
                <Select
                  placeholder="Choose Correct Option"
                  value={
                    correctOptionIndex === null
                      ? ""
                      : correctOptionIndex.toString()
                  }
                  onChange={(e) =>
                    setCorrectOptionIndex(parseInt(e.target.value))
                  }
                >
                  {optionLabels.map((label, index) => (
                    <option key={index} value={index}>
                      Option {label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={handleModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddOrUpdateStep}>
              {isEditMode ? "Update" : "Add"} Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StepathonStep;

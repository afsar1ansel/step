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

import dynamic from "next/dynamic";
import ContentFormatter from "@/app/componant/ContentFormatter";

const EditorComponent = dynamic(() => import("@/app/componant/editor"), {
  ssr: false,
});

const GameQuestionsPage = () => {
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
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctOption, setCorrectOption] = useState("");

  // Dummy data loading
  useEffect(() => {
    // Dummy data for levels and subjects
    setLevels([
      { id: 1, name: "Beginner" },
      { id: 2, name: "Intermediate" },
      { id: 3, name: "Advanced" },
    ]);
    setSubjects([
      { id: 1, name: "Mathematics" },
      { id: 2, name: "Physics" },
      { id: 3, name: "Chemistry" },
    ]);
  }, []);

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
    // Dummy search logic
    console.log(
      "Searching for:",
      { selectedLevel, selectedSubject, selectedModule, searchText }
    );
    const dummyQuestions = [
      {
        id: 1,
        question_no: 1,
        question: JSON.stringify({
          blocks: [{ type: "paragraph", data: { text: "What is 2 + 2?" } }],
        }),
        options: [
          { option_text: "3" },
          { option_text: "4" },
          { option_text: "5" },
          { option_text: "6" },
        ],
        correct_option: "2",
      },
      {
        id: 2,
        question_no: 2,
        question: JSON.stringify({
          blocks: [
            { type: "paragraph", data: { text: "What is the capital of France?" } },
          ],
        }),
        options: [
          { option_text: "Berlin" },
          { option_text: "Madrid" },
          { option_text: "Paris" },
          { option_text: "Rome" },
        ],
        correct_option: "3",
      },
    ];
    setRowData(dummyQuestions);
  };

  useEffect(() => {
    const actionsCellRenderer = (params: any) => {
      const handleEdit = () => {
        setIsEditMode(true);
        setModalTitle("Edit Question");
        setQuestionNo(params.data.question_no);
        setQuestionData(JSON.parse(params.data.question));
        setOption1(params.data.options[0]?.option_text || "");
        setOption2(params.data.options[1]?.option_text || "");
        setOption3(params.data.options[2]?.option_text || "");
        setOption4(params.data.options[3]?.option_text || "");
        setCorrectOption(params.data.correct_option);
        onQuestionModalOpen();
      };

      const handleEditAndAdd = () => {
        setIsEditMode(true);
        setModalTitle("Edit & Add Question");
        setQuestionNo(params.data.question_no);
        setQuestionData(JSON.parse(params.data.question));
        setOption1(params.data.options[0]?.option_text || "");
        setOption2(params.data.options[1]?.option_text || "");
        setOption3(params.data.options[2]?.option_text || "");
        setOption4(params.data.options[3]?.option_text || "");
        setCorrectOption(params.data.correct_option);
        onQuestionModalOpen();
      };

      const handleAddAsIs = () => {
        toast({
          title: "Question Added",
          description: `Question No. ${params.data.question_no} added to Game Module.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // This would normally trigger an API call and then a data refresh
        setRowData((prev) => prev.filter((q) => q.id !== params.data.id));
      };

      if (selectedModule === "Game Module") {
        return (
          <Button colorScheme="blue" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        );
      } else {
        return (
          <HStack spacing={2}>
            <Button colorScheme="green" size="sm" onClick={handleAddAsIs}>
              Add as is
            </Button>
            <Button colorScheme="purple" size="sm" onClick={handleEditAndAdd}>
              Edit & Add
            </Button>
          </HStack>
        );
      }
    };

    setColumnDefs([
      { field: "question_no", headerName: "No.", maxWidth: 80 },
      {
        field: "question",
        headerName: "Question",
        cellRenderer: (params: any) => (
          <ContentFormatter content={params.value} />
        ),
        flex: 2,
      },
      {
        field: "options",
        headerName: "Options",
        cellRenderer: (params: any) =>
          params.data.options
            .map((opt: any, index: number) => `${index + 1}. ${opt.option_text}`)
            .join("\n"),
        autoHeight: true,
        wrapText: true,
        flex: 1,
      },
      {
        field: "correct_option",
        headerName: "Correct",
        maxWidth: 100,
      },
      {
        headerName: "Actions",
        cellRenderer: actionsCellRenderer,
        flex: 1,
        minWidth: 180,
      },
    ]);
  }, [selectedModule, onQuestionModalOpen, toast]);

  const resetModalForm = () => {
    setQuestionNo("");
    setQuestionData({ blocks: [] });
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setCorrectOption("");
  };

  const handleCreateNewQuestion = () => {
    setIsEditMode(false);
    setModalTitle("Create New Question");
    resetModalForm();
    onQuestionModalOpen();
  };

  const handleSaveQuestion = () => {
    // Dummy save logic
    const action = isEditMode ? "updated" : "created";
    toast({
      title: `Question ${action}`,
      description: `The question has been successfully ${action}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    onQuestionModalClose();
  };

  return (
    <Box p={4} w="80vw">
      <VStack spacing={4} align="stretch">
        {/* Top Filters */}
        <Box p={4} bg="white" borderRadius="md" shadow="sm">
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Select Level</FormLabel>
              <Select
                placeholder="Select Level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
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
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              onClick={handleCreateNewQuestion}
              alignSelf="flex-end"
              whiteSpace="nowrap"
            >
              Create New Question
            </Button>
          </HStack>
        </Box>

        {/* Search and Grid */}
        <Box p={4} bg="white" borderRadius="md" shadow="sm">
          <HStack spacing={4} mb={4}>
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
              <FormLabel>Search</FormLabel>
              <Input
                placeholder="Search by Keyword"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="teal"
              onClick={handleSearch}
              alignSelf="flex-end"
            >
              Search
            </Button>
          </HStack>

          <Box
            className="ag-theme-alpine"
            h="400px"
            w="100%"
          >
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
          </Box>
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
                <FormLabel>Question No</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter Question Number"
                  value={questionNo}
                  onChange={(e) => setQuestionNo(e.target.value)}
                />
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
            <Button colorScheme="green" onClick={handleSaveQuestion}>
              {isEditMode ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GameQuestionsPage;
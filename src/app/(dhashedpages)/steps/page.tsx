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
  Textarea,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa6";

ModuleRegistry.registerModules([AllCommunityModule]);

const StepsTab = () => {
  const [rowData, setRowData] = useState<any[]>([
    {
      id: "01",
      subject: "Anatomy",
      steps: 5,
    },
    {
      id: "02",
      subject: "Biochemistry",
      steps: 3,
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
      headerName: "Subject Name",
      field: "subject",
      minWidth: 180,
    },
    {
      headerName: "No. of Steps",
      field: "steps",
    },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => {
        return (
          <div>
            <button
              onClick={() => handleEdit(params.data)}
              style={{ marginRight: "10px" }}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(params.data)}>Delete</button>
          </div>
        );
      },
    },
  ]);

  // State for Add Step Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Step Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  const [currentStep, setCurrentStep] = useState<any>(null);
  const [stepNumber, setStepNumber] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [preTestLink, setPreTestLink] = useState("");
  const [preTestSyllabus, setPreTestSyllabus] = useState("");
  const [preTestInstructions, setPreTestInstructions] = useState("");
  const [preTestExamDetails, setPreTestExamDetails] = useState("");
  const [postTestLink, setPostTestLink] = useState("");
  const [postTestSyllabus, setPostTestSyllabus] = useState("");
  const [postTestInstructions, setPostTestInstructions] = useState("");
  const [postTestExamDetails, setPostTestExamDetails] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [notes, setNotes] = useState([{ title: "", description: "" }]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [notesTitle, setNotesTitle] = useState("");
  const [notesDescription, setNotesDescription] = useState("");

  const handleEdit = (data: any) => {
    setCurrentStep(data);
    setStepNumber(data.steps);
    setSelectedSubject(data.subject);
    onEditModalOpen(); // Open Edit Modal
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((step) => step.id !== data.id));
  };

  const handleAddStep = () => {
    const newStep = {
      id: String(rowData.length + 1),
      subject: selectedSubject,
      steps: stepNumber,
      preTest: {
        link: preTestLink,
        syllabus: preTestSyllabus,
        instructions: preTestInstructions,
        examDetails: preTestExamDetails,
      },
      postTest: {
        link: postTestLink,
        syllabus: postTestSyllabus,
        instructions: postTestInstructions,
        examDetails: postTestExamDetails,
      },
      video: {
        link: videoLink,
        title: videoTitle,
        description: videoDescription,
        duration: videoDuration,
      },
      notes: notes,
      attachedFiles: attachedFiles,
    };

    // Log all details to the console
    console.log("New Step Details:", newStep);

    setRowData((prev) => [...prev, newStep]);
    resetForm();
    onAddModalClose();
  };

  const handleUpdateStep = () => {
    const updatedStep = {
      id: currentStep.id,
      subject: selectedSubject,
      steps: stepNumber,
    };
    setRowData((prev) =>
      prev.map((step) => (step.id === currentStep.id ? updatedStep : step))
    );
    resetForm();
    onEditModalClose();
  };

  const resetForm = () => {
    setStepNumber("");
    setSelectedSubject("");
    setSelectedTeacher("");
    setPreTestLink("");
    setPreTestSyllabus("");
    setPreTestInstructions("");
    setPreTestExamDetails("");
    setPostTestLink("");
    setPostTestSyllabus("");
    setPostTestInstructions("");
    setPostTestExamDetails("");
    setVideoLink("");
    setVideoTitle("");
    setVideoDescription("");
    setVideoDuration("");
    setNotes([{ title: "", description: "" }]);
    setAttachedFiles([]);
    setCurrentStep(null);
  };

  const handleAddNoteGroup = () => {
    setNotes([...notes, { title: "", description: "" }]);
  };

  const handleDeleteNoteGroup = (index: number) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
  };

  const handleNoteChange = (index: number, field: string, value: string) => {
    const newNotes = [...notes];
    newNotes[index][field as keyof (typeof newNotes)[0]] = value;
    setNotes(newNotes);
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Steps Data</p>
        <Button onClick={onAddModalOpen} colorScheme="green">
          Add Step
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

      {/* Add Step Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Step</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <FormControl>
                  <FormLabel>Step Number</FormLabel>
                  <Input
                    placeholder="Enter Step Number"
                    value={stepNumber}
                    onChange={(e) => setStepNumber(e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Select Subject</FormLabel>
                  <Select
                    placeholder="Select Subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="Anatomy">Anatomy</option>
                    <option value="Biochemistry">Biochemistry</option>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Select Teacher</FormLabel>
                  <Select
                    placeholder="Select Teacher"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                  >
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. John">Dr. John</option>
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Video Details</FormLabel>
                  <Input
                    placeholder="Video Link"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                  <Input
                    placeholder="Title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Duration"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Tabs mt={6}>
              <TabList>
                <Tab>Pre-Test Details</Tab>
                <Tab>Post-Test Details</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Pre Test MCQ Google Sheet Link</FormLabel>
                        <Input
                          placeholder="Enter Pre Test Link"
                          value={preTestLink}
                          onChange={(e) => setPreTestLink(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Pre Test Details</FormLabel>
                        <Textarea
                          placeholder="Syllabus"
                          value={preTestSyllabus}
                          onChange={(e) => setPreTestSyllabus(e.target.value)}
                        />
                        <Textarea
                          placeholder="Instructions"
                          value={preTestInstructions}
                          onChange={(e) =>
                            setPreTestInstructions(e.target.value)
                          }
                        />
                        <Textarea
                          placeholder="Exam Details"
                          value={preTestExamDetails}
                          onChange={(e) =>
                            setPreTestExamDetails(e.target.value)
                          }
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </TabPanel>
                <TabPanel>
                  <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Post Test MCQ Google Sheet Link</FormLabel>
                        <Input
                          placeholder="Enter Post Test Link"
                          value={postTestLink}
                          onChange={(e) => setPostTestLink(e.target.value)}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Post Test Details</FormLabel>
                        <Textarea
                          placeholder="Syllabus"
                          value={postTestSyllabus}
                          onChange={(e) => setPostTestSyllabus(e.target.value)}
                        />
                        <Textarea
                          placeholder="Instructions"
                          value={postTestInstructions}
                          onChange={(e) =>
                            setPostTestInstructions(e.target.value)
                          }
                        />
                        <Textarea
                          placeholder="Exam Details"
                          value={postTestExamDetails}
                          onChange={(e) =>
                            setPostTestExamDetails(e.target.value)
                          }
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Box mt={6}>
              <FormLabel>Notes Section</FormLabel>
              {notes.map((note, index) => (
                <Box key={index} mb={4} display="flex" alignItems="center">
                  <Box flex={1}>
                    <Input
                      placeholder="Add Notes Title"
                      value={note.title}
                      onChange={(e) =>
                        handleNoteChange(index, "title", e.target.value)
                      }
                    />
                    <Textarea
                      placeholder="Add Notes Description"
                      value={note.description}
                      onChange={(e) =>
                        handleNoteChange(index, "description", e.target.value)
                      }
                    />
                  </Box>
                  <IconButton
                    aria-label="Delete note group"
                    icon={<FaTrash />}
                    colorScheme="red"
                    ml={2}
                    onClick={() => handleDeleteNoteGroup(index)}
                  />
                </Box>
              ))}
              <IconButton
                aria-label="Add note group"
                icon={<FaPlus />}
                onClick={handleAddNoteGroup}
              />
            </Box>

            <FormControl mt={6}>
              <FormLabel>Attach Files (PDF, PPT, etc.)</FormLabel>
              <Input
                type="file"
                multiple
                onChange={(e) =>
                  setAttachedFiles(Array.from(e.target.files || []))
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddStep}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Step Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Step</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Step Number</FormLabel>
              <Input
                placeholder="Enter Step Number"
                value={stepNumber}
                onChange={(e) => setStepNumber(e.target.value)}
              />
              <FormLabel>Select Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="Anatomy">Anatomy</option>
                <option value="Biochemistry">Biochemistry</option>
              </Select>
              <FormLabel>Select Teacher</FormLabel>
              <Select
                placeholder="Select Teacher"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="Dr. Smith">Dr. Smith</option>
                <option value="Dr. John">Dr. John</option>
              </Select>
              <FormLabel>Pre Test MCQ Google Sheet Link</FormLabel>
              <Input
                placeholder="Enter Pre Test Link"
                value={preTestLink}
                onChange={(e) => setPreTestLink(e.target.value)}
              />
              <FormLabel>Pre Test Details</FormLabel>
              <Textarea
                placeholder="Syllabus"
                value={preTestSyllabus}
                onChange={(e) => setPreTestSyllabus(e.target.value)}
              />
              <Textarea
                placeholder="Instructions"
                value={preTestInstructions}
                onChange={(e) => setPreTestInstructions(e.target.value)}
              />
              <Textarea
                placeholder="Exam Details"
                value={preTestExamDetails}
                onChange={(e) => setPreTestExamDetails(e.target.value)}
              />
              <FormLabel>Post Test MCQ Google Sheet Link</FormLabel>
              <Input
                placeholder="Enter Post Test Link"
                value={postTestLink}
                onChange={(e) => setPostTestLink(e.target.value)}
              />
              <FormLabel>Post Test Details</FormLabel>
              <Textarea
                placeholder="Syllabus"
                value={postTestSyllabus}
                onChange={(e) => setPostTestSyllabus(e.target.value)}
              />
              <Textarea
                placeholder="Instructions"
                value={postTestInstructions}
                onChange={(e) => setPostTestInstructions(e.target.value)}
              />
              <Textarea
                placeholder="Exam Details"
                value={postTestExamDetails}
                onChange={(e) => setPostTestExamDetails(e.target.value)}
              />
              <FormLabel>Video Details</FormLabel>
              <Input
                placeholder="Video Link"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
              <Input
                placeholder="Title & Description"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <Input
                placeholder="Duration"
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
              />
              <FormLabel>Notes Section</FormLabel>
              <Input
                placeholder="Add Notes Title"
                value={notesTitle}
                onChange={(e) => setNotesTitle(e.target.value)}
              />
              <Textarea
                placeholder="Add Notes Description"
                value={notesDescription}
                onChange={(e) => setNotesDescription(e.target.value)}
              />
              <FormLabel>Attach Files (PDF, PPT, etc.)</FormLabel>
              <Input
                type="file"
                multiple
                onChange={(e) =>
                  setAttachedFiles(Array.from(e.target.files || []))
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleUpdateStep}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StepsTab;

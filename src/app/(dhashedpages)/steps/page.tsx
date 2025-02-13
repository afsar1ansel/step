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
} from "@chakra-ui/react";

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
  const [notesTitle, setNotesTitle] = useState("");
  const [notesDescription, setNotesDescription] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

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
    };
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
    setNotesTitle("");
    setNotesDescription("");
    setAttachedFiles([]);
    setCurrentStep(null);
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
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Step</ModalHeader>
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

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
} from "@chakra-ui/react";

import dynamic from "next/dynamic";
// Dynamically importing ExamEditorComponent to prevent SSR issues
const ExamEditorComponent = dynamic(
  () => import("@/app/componant/examEditor"),
  {
    ssr: false,
  }
);

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

// Define the shape of a Concept row (based on your DB structure)
interface ConceptRow {
  id: number;
  chapter_id: number;
  name: string;
  duration: string;
  story: any;
  step0: any;
  cover_picture: string; // URL
  recap: any;
  created_at: string;
  status: 0 | 1;
}

const StepathonConcepts = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const gameUrl = process.env.NEXT_PUBLIC_EXAM_BASE_URL;
  const toast = useToast();

  // Data states
  const [rowData, setRowData] = useState<ConceptRow[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [chaptersBySubject, setChaptersBySubject] = useState<any[]>([]);

  // Filter states
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");
  const [selectedChapterFilter, setSelectedChapterFilter] = useState("");

  // Modal states
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentConceptId, setCurrentConceptId] = useState<number | null>(null);

  // Form states
  const [conceptName, setConceptName] = useState("");
  const [conceptDuration, setConceptDuration] = useState("");
  const [conceptStory, setConceptStory] = useState<any>({ blocks: [] });
  const [conceptStep0, setConceptStep0] = useState<any>({ blocks: [] });
  const [conceptRecap, setConceptRecap] = useState<any>({ blocks: [] });

  // New state to hold the uploaded cover image URL or the current URL in edit mode
  const [conceptCoverPictureUrl, setConceptCoverPictureUrl] =
    useState<string>("");
  // State for the file chosen by the user (only used for uploading)
  const [conceptCoverPictureFile, setConceptCoverPictureFile] =
    useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal Subject/Chapter states
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState("");
  const [selectedChapterForModal, setSelectedChapterForModal] = useState("");
  const [chaptersForModal, setChaptersForModal] = useState<any[]>([]);

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

  // --- Fetch Data Logic (kept same) ---

  // 1. Fetch all subjects
  useEffect(() => {
    if (token && baseUrl) {
      fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
        .then((response) => response.json())
        .then((data) => {
          setAllSubjects(data);
          const defaultSubject =
            data.find((c: any) => c.subject_id === 1) || data[0];
          if (defaultSubject) {
            setSelectedSubjectFilter(defaultSubject.subject_id.toString());
            setSelectedSubjectForModal(defaultSubject.subject_id.toString());
          }
        })
        .catch((error) => console.error("Error fetching subjects:", error));
    }
  }, [token, baseUrl]);

  // 2. Fetch chapters based on selected subject filter
  useEffect(() => {
    if (token && gameUrl && selectedSubjectFilter) {
      const url = `${gameUrl}/masters/chapter/get-by-subject/${selectedSubjectFilter}`;
      fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const chaptersArray = Array.isArray(data) ? data : [];
          setChaptersBySubject(chaptersArray);
          if (chaptersArray && chaptersArray.length > 0) {
            setSelectedChapterFilter(chaptersArray[0].id.toString());
          } else {
            setSelectedChapterFilter("");
          }
        })
        .catch((error) => console.error("Error fetching chapters:", error));
    } else {
      setChaptersBySubject([]);
      setSelectedChapterFilter("");
    }
  }, [token, gameUrl, selectedSubjectFilter]);

  // 2a. Fetch chapters for the modal based on selected modal subject
  useEffect(() => {
    if (token && gameUrl && selectedSubjectForModal) {
      const url = `${gameUrl}/masters/chapter/get-by-subject/${selectedSubjectForModal}`;
      fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          const chaptersArray = Array.isArray(data) ? data : [];
          setChaptersForModal(chaptersArray);
        })
        .catch((error) =>
          console.error("Error fetching chapters for modal:", error)
        );
    } else {
      setChaptersForModal([]);
    }
  }, [token, gameUrl, selectedSubjectForModal]);

  // 3. Fetch concepts based on selected chapter filter
  const fetchConcepts = React.useCallback(() => {
    if (token && gameUrl && selectedChapterFilter) {
      const url = `${gameUrl}/masters/concept/get-by-chapter/${selectedChapterFilter}`;
      fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setRowData(data.data);
        })
        .catch((error) => console.error("Error fetching concept data:", error));
    } else {
      setRowData([]);
    }
  }, [token, gameUrl, selectedChapterFilter]);

  useEffect(() => {
    fetchConcepts();
  }, [fetchConcepts]);

  // --- Grid Column Definitions (kept same) ---

  const [columnDefs] = useState<ColDef<ConceptRow>[]>([
    {
      headerName: "Name",
      field: "name",
      minWidth: 150,
    },
    {
      headerName: "Duration",
      field: "duration",
      maxWidth: 100,
      filter: false,
    },
    {
      headerName: "Story",
      field: "story",
      minWidth: 200,
      filter: false,
      cellRenderer: (params: any) => {
        const contentData = safeParseEditorData(params.value);
        return <ContentFormatter content={contentData} />;
      },
      cellStyle: { height: "100%", padding: "8px" },
      autoHeight: true,
    },
    {
      headerName: "Step 0",
      field: "step0",
      minWidth: 100,
      filter: false,
      cellRenderer: (params: any) => {
        const contentData = safeParseEditorData(params.value);
        return <ContentFormatter content={contentData} />;
      },
      cellStyle: { height: "100%", padding: "8px" },
      autoHeight: true,
    },
    {
      headerName: "Recap",
      field: "recap",
      minWidth: 100,
      filter: false,
      cellRenderer: (params: any) => {
        const contentData = safeParseEditorData(params.value);
        return <ContentFormatter content={contentData} />;
      },
      cellStyle: { height: "100%", padding: "8px" },
      autoHeight: true,
    },
    {
      headerName: "Picture",
      field: "cover_picture",
      maxWidth: 100,
      filter: false,
      valueGetter: (params) => (params.data?.cover_picture ? "View" : "N/A"),
    },
    {
      headerName: "Created At",
      field: "created_at",
      maxWidth: 120,
      cellRenderer: (params: { value: any }) => formatDate(params.value),
    },
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

  // --- Handler Functions ---

  const emptyEditorData = { blocks: [] };

  const resetForm = () => {
    // Reset form states
    setConceptName("");
    setConceptDuration("");
    setConceptStory(emptyEditorData);
    setConceptStep0(emptyEditorData);
    setConceptRecap(emptyEditorData);
    setConceptCoverPictureFile(null);
    setConceptCoverPictureUrl("");
    setIsEditMode(false);
    setCurrentConceptId(null);
    setIsUploading(false);

    // Reset modal dropdowns, keep subject for convenience
    const defaultChapterId =
      selectedChapterFilter ||
      (chaptersBySubject.length > 0 ? chaptersBySubject[0].id.toString() : "");
    setSelectedChapterForModal(defaultChapterId);
    setSelectedSubjectForModal(selectedSubjectFilter);
  };

  const handleModalOpen = () => {
    resetForm();
    onModalOpen();
  };

  const handleModalClose = () => {
    resetForm();
    onModalClose();
  };

  const handleEdit = (data: ConceptRow) => {
    setIsEditMode(true);
    setCurrentConceptId(data.id);

    // Set form values for editing
    setConceptName(data.name);
    setConceptDuration(data.duration);
    setConceptStory(safeParseEditorData(data.story));
    setConceptStep0(safeParseEditorData(data.step0));
    setConceptRecap(safeParseEditorData(data.recap));
    // Set the existing URL for preview and submission
    setConceptCoverPictureUrl(data.cover_picture);
    setConceptCoverPictureFile(null); // Clear file input

    // Set dropdowns
    const currentChapter = chaptersBySubject.find(
      (c) => c.id === data.chapter_id
    );
    if (currentChapter) {
      setSelectedSubjectForModal(currentChapter.subject_id.toString());
      setSelectedChapterForModal(data.chapter_id.toString());
    }

    onModalOpen();
  };

  const uploadCoverImage = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("imageFile", file);
    // Use 'concepts' as the folder name as discussed
    formData.append("folderName", "concepts");

    try {
      const response = await fetch(`${gameUrl}/masters/sps/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success === 1) {
        toast({
          title: "Image Uploaded",
          description: `Cover image uploaded successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        setConceptCoverPictureUrl(result.file.url);
        return result.file.url;
      } else {
        throw new Error(result.message || "Cover image upload failed");
      }
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConceptCoverPictureFile(file);
      // Immediately trigger upload
      uploadCoverImage(file);
    }
  };

  const handleToggle = async (data: ConceptRow) => {
    const newStatus = data.status === 1 ? 0 : 1;
    try {
      const response = await fetch(
        `${gameUrl}/masters/concept/change-status/${newStatus}/${data.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  const handleAddOrUpdateConcept = async () => {
    // 1. Validate required fields
    if (
      !selectedSubjectForModal ||
      !selectedChapterForModal ||
      !conceptName ||
      !conceptDuration ||
      conceptStory.blocks.length === 0 ||
      conceptStep0.blocks.length === 0 ||
      conceptRecap.blocks.length === 0 ||
      (!isEditMode && !conceptCoverPictureUrl) || // Must have a URL if adding
      (isEditMode && !conceptCoverPictureUrl) // Must have a URL if editing
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and ensure the Concept Cover Picture has been uploaded/selected.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (isUploading) {
      toast({
        title: "Wait",
        description: "Please wait for the cover picture to finish uploading.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("token", token || "");
    formData.append("chapterId", selectedChapterForModal);
    formData.append("name", conceptName);
    formData.append("duration", conceptDuration);
    formData.append("story", JSON.stringify(conceptStory));
    formData.append("step0", JSON.stringify(conceptStep0));
    formData.append("recap", JSON.stringify(conceptRecap));

    // 2. Use the uploaded URL here
    formData.append("coverPicture", conceptCoverPictureUrl);

    const url = isEditMode
      ? `${gameUrl}/masters/concept/update`
      : `${gameUrl}/masters/concept/add`;
    const method = "POST";

    if (isEditMode) {
      formData.append("conceptId", String(currentConceptId));
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: method,
        body: formData,
      });

      const data = await response.json();

      if (data.errFlag === 0) {
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchConcepts();
        handleModalClose();
      } else {
        toast({
          title: isEditMode ? "Error Updating Concept" : "Error Adding Concept",
          description: data.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error submitting concept:", error);
      toast({
        title: "Error",
        description: `An error occurred while ${
          isEditMode ? "updating" : "adding"
        } the concept.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Concepts</p>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Subject Filter Dropdown */}
          <Box minW="200px">
            <Select
              placeholder="Select Subject"
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
          <Box minW="200px">
            <Select
              placeholder="Select Chapter"
              value={selectedChapterFilter}
              onChange={(e) => setSelectedChapterFilter(e.target.value)}
              isDisabled={!chaptersBySubject || chaptersBySubject.length === 0}
            >
              {chaptersBySubject &&
                chaptersBySubject.map((chapter: any) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
            </Select>
          </Box>

          <Button onClick={handleModalOpen} colorScheme="green">
            Add Concept
          </Button>
        </div>
      </div>
      <hr />

      {/* AG Grid Table for Concepts */}
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

      {/* Add/Edit Concept Modal */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? "Edit Concept" : "Add New Concept"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Subject Selection */}
            <FormControl mb={4} isRequired>
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedSubjectForModal}
                onChange={(e) => {
                  setSelectedSubjectForModal(e.target.value);
                  setSelectedChapterForModal(""); // Reset chapter when subject changes
                }}
                isDisabled={isEditMode} // Usually you don't change subject on edit
              >
                {allSubjects.map((subject: any) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Chapter Selection */}
            <FormControl mb={4} isRequired>
              <FormLabel>Chapter</FormLabel>
              <Select
                placeholder="Select Chapter"
                value={selectedChapterForModal}
                onChange={(e) => setSelectedChapterForModal(e.target.value)}
                isDisabled={!chaptersForModal || chaptersForModal.length === 0}
              >
                {chaptersForModal &&
                  chaptersForModal.map((chapter: any) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
              </Select>
            </FormControl>

            {/* Name */}
            <FormControl mb={4} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter Concept Name"
                value={conceptName}
                onChange={(e) => setConceptName(e.target.value)}
              />
            </FormControl>

            {/* Duration */}
            <FormControl mb={4} isRequired>
              <FormLabel>Duration (in Seconds e.g., 300)</FormLabel>
              <Input
                placeholder="Enter Duration (in Seconds)"
                value={conceptDuration}
                onChange={(e) => setConceptDuration(e.target.value)}
                type="number"
              />
            </FormControl>

            {/* Story (EditorJS) */}
            <FormControl mb={4} isRequired>
              <FormLabel>Story</FormLabel>
              <Box border="1px solid #ccc" padding="10px">
                <ExamEditorComponent
                  data={conceptStory}
                  onChange={setConceptStory}
                  holder="concepts-story-editor"
                />
              </Box>
            </FormControl>

            {/* Step 0 (EditorJS) */}
            <FormControl mb={4} isRequired>
              <FormLabel>Step 0</FormLabel>
              <Box border="1px solid #ccc" padding="10px">
                <ExamEditorComponent
                  data={conceptStep0}
                  onChange={setConceptStep0}
                  holder="concepts-step0-editor"
                />
              </Box>
            </FormControl>

            {/* Recap (EditorJS) */}
            <FormControl mb={4} isRequired>
              <FormLabel>Recap</FormLabel>
              <Box border="1px solid #ccc" padding="10px">
                <ExamEditorComponent
                  data={conceptRecap}
                  onChange={setConceptRecap}
                  holder="concepts-recap-editor"
                />
              </Box>
            </FormControl>

            {/* Concept Cover Picture */}
            <FormControl
              mb={4}
              isRequired={!isEditMode || !conceptCoverPictureUrl}
            >
              <FormLabel>Concept Cover Picture</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                p={1}
                disabled={isUploading}
              />
              {isUploading && (
                <Box mt={2} color="orange.500" fontSize="sm">
                  Uploading image... Please wait.
                </Box>
              )}
              {conceptCoverPictureUrl && (
                <Box mt={2}>
                  <FormLabel fontSize="sm">
                    {isEditMode
                      ? "Current/New Picture URL:"
                      : "Uploaded Picture URL:"}
                  </FormLabel>
                  <Input
                    value={conceptCoverPictureUrl}
                    isReadOnly
                    fontSize="xs"
                    // Display image preview
                    sx={{
                      backgroundColor: "gray.50",
                      borderColor: "green.300",
                    }}
                  />
                  <img
                    src={conceptCoverPictureUrl}
                    alt="Concept Cover Preview"
                    style={{
                      maxHeight: "100px",
                      marginTop: "8px",
                      maxWidth: "150px",
                    }}
                  />
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={handleModalClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddOrUpdateConcept}
              isLoading={isUploading}
              loadingText={isEditMode ? "Updating" : "Adding"}
            >
              {isEditMode ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StepathonConcepts;

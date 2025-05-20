"use client";

import { AgGridReact } from "ag-grid-react";
import React, { use, useEffect, useState } from "react";
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
  Heading,
  Center,
  Image,
  Spinner,
  useToast,
  Switch,
} from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { CgFontHeight } from "react-icons/cg";
import { line } from "framer-motion/client";
import { useDropzone } from "react-dropzone";

ModuleRegistry.registerModules([AllCommunityModule]);

const StepsTab = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const toast = useToast();
  const [rowData, setRowData] = useState<any[]>();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    // {
    //   headerName: "Step No.",
    //   field: "step_no",
    //   maxWidth: 80,
    // },
    {
      headerName: "Step Title",
      field: "course_step_title",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      headerName: "Subject",
      field: "subject_name",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      headerName: "Image",
      field: "banner_image_name",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
      // minWidth: 180,
      cellRenderer: (params: any) => (
        <Button
          variant="link"
          colorScheme="blue"
          onClick={() => fetchImage(params.value)}
        >
          View Image
        </Button>
      ),
    },
    {
      headerName: "Access Time",
      field: "course_overview_access_time_text",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      headerName: "Downloadable Text",
      field: "course_overview_downloadable_text",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      headerName: "Course Overview Hours",
      field: "course_overview_hours_text",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      headerName: "Course Overview Description",
      field: "course_step_description",
      cellClass: "ag-cell-wrap-text",
      minWidth: 220,
      autoHeight: true,
      wrapText: true,
      cellStyle: {
        whiteSpace: "normal",
        lineHeight: "1.5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },

    {
      headerName: "Created Date",
      field: "created_date",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      headerName: "No. of Test",
      field: "no_of_test_text",
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      },
    },
    {
      field: "status",
      headerName: "Status",
      // cellStyle: { textAlign: "center" },
      filter: false,
      maxWidth: 75,
      cellRenderer: (params: any) => (
        // console.log(params.value),
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
            onChange={(event) => handleToggle(params.data)}
            defaultChecked={params.value == 1 ? true : false}
          />
        </div>
      ),
    },
    {
      headerName: "Actions",
      filter: false,
      cellRenderer: (params: any) => {
        // console.log(params.data)
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "80%",
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
            {/* <button onClick={() => handleDelete(params.data)}>Delete</button> */}
            {/* <Button
              onClick={() => handleShowDetails(params.data)}
              colorScheme="green"
              size="sm"
              variant={"outline"}
            >
              Show
            </Button> */}
          </div>
        );
      },
    },
  ]);

  async function fetchData() {
    // console.log(step);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const response = await fetch(
        `${baseUrl}/masters/get-all-course-step-details/${step}/${token}`
      );

      const data = await response.json();
      if (data.errFlag === 1) {
        toast({ title: data.message, status: "error", duration: 3000, isClosable: true });
      }
      setRowData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // function handleShowDetails(data: any) {
  //  console.log(data)
  // }

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

  //state for show detail
  const [currentStepDetails, setCurrentStepDetails] = useState<any[]>([
    {
      stepNumber: 1,
      preTestLink: "https://docs.google.com/spreadsheets/d/pre-test-link-1",
      preTestSyllabus: "Introduction to Anatomy, Basic Terminology",
      preTestInstructions: "Complete the test within 30 minutes.",
      preTestExamDetails: "20 MCQs, 30 minutes duration",
      postTestLink: "https://docs.google.com/spreadsheets/d/post-test-link-1",
      postTestSyllabus: "Review of Anatomy Basics, Advanced Terminology",
      postTestInstructions: "Complete the test within 45 minutes.",
      postTestExamDetails: "30 MCQs, 45 minutes duration",
      videoLink: "https://www.youtube.com/watch?v=anatomy-intro",
      videoTitle: "Introduction to Anatomy",
      videoDescription: "This video covers the basics of human anatomy.",
      videoDuration: "15:30",
      notes: [
        {
          title: "Anatomy Basics",
          description: "Key terms and concepts for understanding anatomy.",
        },
        {
          title: "Important Definitions",
          description:
            "Definitions of anatomical terms like proximal, distal, etc.",
        },
      ],
    },
    {
      stepNumber: 2,
      preTestLink: "https://docs.google.com/spreadsheets/d/pre-test-link-2",
      preTestSyllabus: "Skeletal System, Bone Structure",
      preTestInstructions: "Complete the test within 25 minutes.",
      preTestExamDetails: "15 MCQs, 25 minutes duration",
      postTestLink: "https://docs.google.com/spreadsheets/d/post-test-link-2",
      postTestSyllabus: "Advanced Skeletal System, Joints and Ligaments",
      postTestInstructions: "Complete the test within 40 minutes.",
      postTestExamDetails: "25 MCQs, 40 minutes duration",
      videoLink: "https://www.youtube.com/watch?v=skeletal-system",
      videoTitle: "The Skeletal System",
      videoDescription:
        "This video explains the structure and function of the skeletal system.",
      videoDuration: "20:45",
      notes: [
        {
          title: "Bone Structure",
          description: "Details about the composition and types of bones.",
        },
        {
          title: "Joints and Ligaments",
          description:
            "Explanation of different types of joints and their functions.",
        },
      ],
    },
    {
      stepNumber: 3,
      preTestLink: "https://docs.google.com/spreadsheets/d/pre-test-link-3",
      preTestSyllabus: "Muscular System, Muscle Types",
      preTestInstructions: "Complete the test within 20 minutes.",
      preTestExamDetails: "10 MCQs, 20 minutes duration",
      postTestLink: "https://docs.google.com/spreadsheets/d/post-test-link-3",
      postTestSyllabus: "Advanced Muscular System, Muscle Contraction",
      postTestInstructions: "Complete the test within 35 minutes.",
      postTestExamDetails: "20 MCQs, 35 minutes duration",
      videoLink: "https://www.youtube.com/watch?v=muscular-system",
      videoTitle: "The Muscular System",
      videoDescription:
        "This video covers the types of muscles and their functions.",
      videoDuration: "18:10",
      notes: [
        {
          title: "Muscle Types",
          description: "Overview of skeletal, smooth, and cardiac muscles.",
        },
        {
          title: "Muscle Contraction",
          description: "Explanation of how muscles contract and relax.",
        },
      ],
    },
  ]);

  const {
    isOpen: isShowModalOpen,
    onOpen: onShowModalOpen,
    onClose: onShowModalClose,
  } = useDisclosure();

  // Add this with your other modal states
  const {
    isOpen: isImageModalOpen,
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
  } = useDisclosure();

  async function handleToggle(data: any) {
    console.log(data.status, data.id);
    //  const token = localStorage.getItem("token") ?? "";
    const status = data.status == 1 ? 0 : 1;
    console.log(status);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/masters/update-course-step-status/${data.id}/${status}/${token}`,
        {
          method: "GET",
        }
      );
      const data1 = await response.json();
      // console.log(data1);
    } catch (error) {
      console.log(error);
    }
  }

  const handleShowDetails = async (data: any) => {
    // try {
    //   // Fetch step details from the URL
    //   const response = await fetch(`https://api.example.com/steps/${data.id}`);
    //   const stepDetails = await response.json();
    //   setCurrentStepDetails(stepDetails);
    onShowModalOpen();
    // } catch (error) {
    //   console.error("Error fetching step details:", error);
    // }
  };

  const [step, setStep] = useState<any>("1");
  const [stepTitle, setStepTitle] = useState("");
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [stepNumber, setStepNumber] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [stepDecription, setStepDecription] = useState("");
  const [courseOverviewHoursText, setcourseOverViewHoursText] =
    useState<string>("");
  const [courseOverviewDownloadableText, setcourseOverviewDownloadableText] =
    useState<string>("");
  const [courseOverviewAccessTimeText, setcourseOverviewAccessTimeText] =
    useState<string>("");
  const [preTestLink, setPreTestLink] = useState("");
  const [preTestSyllabus, setPreTestSyllabus] = useState("");
  const [preTestInstructions, setPreTestInstructions] = useState("");
  const [preTestExamDetails, setPreTestExamDetails] = useState("");
  const [postTestLink, setPostTestLink] = useState("");
  const [postTestSyllabus, setPostTestSyllabus] = useState("");
  const [postTestInstructions, setPostTestInstructions] = useState("");
  const [postTestExamDetails, setPostTestExamDetails] = useState("");
  const [noOfTestText, setnoOfTestText] = useState<string>("");
  const [videoLink, setVideoLink] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [notes, setNotes] = useState([{ title: "", description: "" }]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notesTitle, setNotesTitle] = useState("");
  const [notesDescription, setNotesDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any>([]);
  const [subject, setSubject] = useState<any>([]);
  const [courseDrop, setCourseDrop] = useState<any>([]);

  const handleEdit = (data: any) => {
    // console.log(data)
    fetchTeachers();
    fetchSubjects();
    fetchCourse();
    onShowModalClose();
    setSelectedCourse(data.course_id);
    setSelectedSubject(data.subject_id);
    setStepNumber(data.step_no);
    setStepTitle(data.course_step_title);
    setStepDecription(data.course_step_description);
    setcourseOverViewHoursText(data.course_overview_hours_text);
    setcourseOverviewDownloadableText(data.course_overview_downloadable_text);
    setcourseOverviewAccessTimeText(data.course_overview_access_time_text);
    setnoOfTestText(data.no_of_test_text);
    setSelectedTeacher(data.doctor_id);
    setSelectedImage(data.banner_image_name);
    setCurrentStep(data.id);

    onEditModalOpen(); // Open Edit Modal
  };

  // const handleDelete = (data: any) => {
  //   setRowData((prev) => prev.filter((step) => step.id !== data.id));
  // };

  function openAddModal() {
    resetForm();
    fetchTeachers();
    fetchSubjects();
    fetchCourse();

    isAddModalOpen ? onAddModalClose() : onAddModalOpen();
    onShowModalClose();
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // courseId,
  //   subjectId,
  //   stepNo,
  //   courseStepTitle,
  //   courseStepDescription,
  //   courseOverviewHoursText,
  //   courseOverviewDownloadableText,
  //   courseOverviewAccessTimeText,
  //   noOfTestText,
  //   doctorId,
  //   bannerImage(file - Type),
  //   token;
  const handleAddStep = async () => {
    setIsSubmitting(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const form = new FormData();
    form.append("courseStepTitle", stepTitle);
    form.append("stepNo", stepNumber);
    form.append("courseId", selectedCourse);
    form.append("subjectId", selectedSubject);
    form.append("doctorId", selectedTeacher);
    form.append("courseStepDescription", stepDecription);
    form.append("courseOverviewHoursText", courseOverviewHoursText);
    form.append(
      "courseOverviewDownloadableText",
      courseOverviewDownloadableText
    );
    form.append("courseOverviewAccessTimeText", courseOverviewAccessTimeText);
    form.append("noOfTestText", noOfTestText);
    form.append("token", token || "");

    if (selectedImage) {
      form.append("bannerImage", selectedImage);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/course-step/add`,
        {
          method: "POST",
          body: form,
        }
      );

      const responseData = await response.json();

      console.log(responseData);

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Step added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        onAddModalClose();
        fetchData();
      } else {
        toast({
          title: "Error",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add step",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
        onAddModalClose();
    }
  };

  const handleUpdateStep = async () => {
    setIsSubmitting(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const form = new FormData();
    form.append("courseStepTitle", stepTitle);
    form.append("stepNo", stepNumber);
    form.append("courseId", selectedCourse);
    form.append("subjectId", selectedSubject);
    form.append("doctorId", selectedTeacher);
    form.append("courseStepDescription", stepDecription);
    form.append("courseOverviewHoursText", courseOverviewHoursText);
    form.append("courseStepId", currentStep);
    form.append(
      "courseOverviewDownloadableText",
      courseOverviewDownloadableText
    );
    form.append("courseOverviewAccessTimeText", courseOverviewAccessTimeText);
    form.append("noOfTestText", noOfTestText);
    form.append("token", token || "");

    if (selectedImage) {
      form.append("bannerImage", selectedImage);
    }
    // console.log(Object.fromEntries(form.entries()));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/masters/update-course-step-detail`,
        {
          method: "POST",
          body: form,
        }
      );

      const responseData = await response.json();

      if (responseData.errFlag === 0) {
        toast({
          title: "Success",
          description: "Step added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
        onAddModalClose();
        fetchData();
      } else {
        toast({
          title: "Error",
          description: responseData.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add step",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }

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
    // setAttachedFiles([]);
    setCurrentStep(null);
    setSelectedImage(null);
    setPreview(null);
    setNotesTitle("");
    setNotesDescription("");
    setcourseOverViewHoursText("");
    setcourseOverviewDownloadableText("");
    setcourseOverviewAccessTimeText("");
    setStepTitle("");
    setStepDecription("");
    setSelectedCourse("");
    setnoOfTestText("");
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

  useEffect(() => {
    fetchCource();
    fetchData();
    fetchSubjects(); 
  }, []);

  useEffect(() => {
    fetchData();
    // console.log(step)
  }, [step]);

  const [course, setCourse] = useState<any>([]);
  async function fetchCource() {
    const tok = localStorage.getItem("token");
    // console.log(tok);
    try {
      const response = await fetch(
        `${baseUrl}/masters/courses/get-all-courses/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      console.log(responseData);

      if (responseData.message == "Invalid token") {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
        return;
      }

      setCourse(responseData);
    } catch {
      (error: Error) => {
        console.error("Error fetching data:", error);
      };
    }
  }

  const fetchImage = async (id: any) => {
    // console.log(id);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/masters/course-step-banner-image/${token}/${id}`,
        {
          method: "GET",
        }
      );

      //  console.log(response.url);
      setLoading(false);
      setCurrentImageUrl(response.url);
      onImageModalOpen();

      // console.log(response.url);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  async function fetchTeachers() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/doctors/get-all-doctors/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setTeachers(data);
      // console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchSubjects() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/masters/subjects/get-all-subjects/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setSubject(data);
       console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchCourse() {
    const tok = localStorage.getItem("token");
    // console.log(tok);
    try {
      const response = await fetch(
        `${baseUrl}/masters/courses/get-all-courses/${tok}`,
        {
          method: "GET",
        }
      );
      const responseData = await response.json();
      // console.log(responseData);
      setCourseDrop(responseData);
    } catch {
      (error: Error) => {
        console.error("Error fetching data:", error);
      };
    }
  }

  return (
    <div
      style={{
        width: "82vw",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* <Box p={4} mb={2}>
   
        <Select
          placeholder="Select Subject"
          onChange={(e) => setStep(e.target.value)}
        >
          {subject &&
            subject.map((item: any, index: number) => (
              <option key={item.id} value={item.course_id}>
                {item.subject_name}
              </option>
            ))}
        </Select>
      </Box> */}
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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>
          Course Step Details
        </p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Box>
            <Select
              placeholder="Select Subject"
              onChange={(e) => setStep(e.target.value)}
            >
              {subject &&
                subject.map((item: any, index: number) => (
                  <option key={item.id} value={item.subject_id}>
                    {item.subject_name}
                  </option>
                ))}
            </Select>
          </Box>
          <Button onClick={openAddModal} colorScheme="green">
            Add Step
          </Button>
        </div>
      </div>
      <div style={{ height: "100%", width: "100%", border: "1px solid #ccc" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          // pagination={true}
          defaultColDef={{
            sortable: true,
            resizable: true,
            flex: 1,
            filterParams: {
              debounceMs: 0,
              buttons: ["reset"],
            },
          }}
          getRowHeight={(params) => {
            const description = params.data?.course_step_description || "";
            const words = description.split(" ").length;
            const baseHeight = 80;
            const heightPerWord = 1.5;
            const calculatedHeight = baseHeight + words * heightPerWord;
            return Math.max(120, calculatedHeight); // minimum height of 120px
          }}
          suppressCellFocus={true}
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
                  <FormLabel>Title </FormLabel>
                  <Input
                    placeholder="Enter Step Title"
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                  />
                </FormControl>
              </GridItem>
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
                    {!subject
                      ? "Loading"
                      : subject.map((item: any) => (
                          <option key={item.subject_id} value={item.subject_id}>
                            {item.subject_name}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Select Doctor</FormLabel>
                  <Select
                    placeholder="Select Doctor"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                  >
                    {!teachers
                      ? "Loading"
                      : teachers.map((teacher: any) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.doctor_full_name}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Select Course</FormLabel>
                  <Select
                    placeholder="Select Course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    {!courseDrop
                      ? "Loading"
                      : courseDrop.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.course_name}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              </GridItem>
              {/* <GridItem>
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
              </GridItem> */}
              <GridItem>
                <FormControl>
                  <FormLabel>Course Overview</FormLabel>
                  <Input
                    placeholder="Enter Course Overview Hours"
                    value={courseOverviewHoursText}
                    onChange={(e) => setcourseOverViewHoursText(e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Course Overview Downloadable</FormLabel>
                  <Input
                    placeholder="Enter Course Overview Downloadable materials"
                    value={courseOverviewDownloadableText}
                    onChange={(e) =>
                      setcourseOverviewDownloadableText(e.target.value)
                    }
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Course access Time </FormLabel>
                  <Input
                    placeholder="Enter Course Overview Access Time"
                    value={courseOverviewAccessTimeText}
                    onChange={(e) =>
                      setcourseOverviewAccessTimeText(e.target.value)
                    }
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>No. of Tests </FormLabel>
                  <Input
                    placeholder="Enter No. of tests"
                    value={noOfTestText}
                    onChange={(e) => setnoOfTestText(e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Course Step Description </FormLabel>
                  <Textarea
                    placeholder="Enter Step Description"
                    value={stepDecription}
                    onChange={(e) => setStepDecription(e.target.value)}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            {/* <Tabs mt={6}>
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
            </Tabs> */}

            {/* <Box mt={6}>
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
            </Box> */}

            <FormControl>
              <FormLabel mt={4}>Banner Image</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? "green.500" : "gray.300"}
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "green.400" }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag & drop an image here, or click to select</p>
                )}
              </Box>

              {preview && (
                <Box mt={4}>
                  <Image
                    src={preview}
                    alt="Preview"
                    maxH="200px"
                    mx="auto"
                    borderRadius="md"
                  />
                  <Button
                    size="sm"
                    mt={2}
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setPreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={onAddModalClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddStep}
              isLoading={isSubmitting}
              loadingText="Adding..."
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Step Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Step</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <FormControl>
                  <FormLabel>Title </FormLabel>
                  <Input
                    placeholder="Enter Step Title"
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                  />
                </FormControl>
              </GridItem>
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
                    {!subject
                      ? "Loading"
                      : subject.map((item: any) => (
                          <option key={item.subject_id} value={item.subject_id}>
                            {item.subject_name}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Select Teacher</FormLabel>
                  <Select
                    placeholder="Select Doctor"
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                  >
                    {!teachers
                      ? "Loading"
                      : teachers.map((teacher: any) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.doctor_full_name}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Select Course</FormLabel>
                  <Select
                    placeholder="Select Course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    {!courseDrop
                      ? "Loading"
                      : courseDrop.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.course_name}
                          </option>
                        ))}
                  </Select>
                </FormControl>
              </GridItem>
              {/* <GridItem>
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
              </GridItem> */}
              <GridItem>
                <FormControl>
                  <FormLabel>course Overview Hours Text </FormLabel>
                  <Input
                    placeholder="Enter Course Overview Hours"
                    value={courseOverviewHoursText}
                    onChange={(e) => setcourseOverViewHoursText(e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>course Overview Downloadable Text </FormLabel>
                  <Input
                    placeholder="Enter Course Overview Downloadable Text"
                    value={courseOverviewDownloadableText}
                    onChange={(e) =>
                      setcourseOverviewDownloadableText(e.target.value)
                    }
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>course access Time </FormLabel>
                  <Input
                    placeholder="Enter Course Overview Access Time"
                    value={courseOverviewAccessTimeText}
                    onChange={(e) =>
                      setcourseOverviewAccessTimeText(e.target.value)
                    }
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>No. of tests </FormLabel>
                  <Input
                    placeholder="Enter No. of tests"
                    value={noOfTestText}
                    onChange={(e) => setnoOfTestText(e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>course Step Description </FormLabel>
                  <Textarea
                    placeholder="Enter Step Description"
                    value={stepDecription}
                    onChange={(e) => setStepDecription(e.target.value)}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl>
              <FormLabel mt={4}>Doctor Image</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? "green.500" : "gray.300"}
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: "green.400" }}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag & drop an image here, or click to select</p>
                )}
              </Box>

              {preview && (
                <Box mt={4}>
                  <Image
                    src={preview}
                    alt="Preview"
                    maxH="200px"
                    mx="auto"
                    borderRadius="md"
                  />
                  <Button
                    size="sm"
                    mt={2}
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setPreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={onEditModalClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleUpdateStep}
              isLoading={isSubmitting}
              loadingText="Updating..."
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Step Preview Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center>
              {currentImageUrl && (
                <Image
                  src={currentImageUrl}
                  alt="Doctor Profile"
                  maxH="70vh"
                  maxW="100%"
                  objectFit="contain"
                  borderRadius="md"
                />
              )}
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onImageModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {loading && (
        <Center
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={10}
        >
          <Spinner
            size="xl"
            color="blue.500"
            thickness="4px"
            emptyColor="gray.200"
            speed="0.65s"
          />
        </Center>
      )}
    </div>
  );
};

export default StepsTab;

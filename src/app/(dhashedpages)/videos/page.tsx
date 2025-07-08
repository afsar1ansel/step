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
  Switch,
  useToast,
  Select,
} from "@chakra-ui/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const StudentsTab = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [rowData, setRowData] = useState<any[]>([]);
  const toast = useToast();

  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      headerName: "Video Title",
      field: "video_title",
      filter: true,
      floatingFilter: true,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Step No",
      field: "step_no",
      filter: false,
      cellStyle: { textAlign: "center" },
      maxWidth: 90,
    },
    {
      headerName: "Subject",
      field: "subject_name",
      filter: false,
      cellStyle: { textAlign: "center" },
      // cellRenderer: (params: { value: any }) => {
      //   return (
      //     <Button
      //       colorScheme="blue"
      //       size="sm"
      //       onClick={() => {
      //         setCurrentVideoLink(params.value);
      //         onVideoModalOpen();
      //       }}
      //     >
      //       Play Video
      //     </Button>
      //   );
      // },
    },
    {
      headerName: "Video Description",
      field: "video_description",
      filter: false,
      // floatingFilter: true,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "Video Duration (in mins)",
      field: "video_duration_in_mins",
      filter: false,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params: { value: any }) => {
        return (
          <div>
            <span>{params.value} Min</span>
          </div>
        );
      },
    },
    {
      headerName: "Created Date",
      field: "created_date",
      filter: true,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params: { value: any }) => {
        const date = new Date(params.value);
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        return date.toLocaleDateString("en-IN", options);
      },
    },
    {
      headerName: "status",
      field: "status",
      filter: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { value: any; data: any; api: any }) => {
        const toggleSubscription = async (newValue: number) => {
          try {
            const videoLearningId = params.data.id;
            const token = localStorage.getItem("token") || "";

            const response = await fetch(
              `${baseUrl}/video-learning/change-status/${newValue}/${videoLearningId}/${token}`
            );
            const data = await response.json();
            console.log(data);

            params.data.status = newValue;
            params.api.applyTransaction({ update: [params.data] });
          } catch (error) {
            console.error("Error updating status:", error);
          }
        };

        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Switch
              isChecked={params.value == 1}
              colorScheme="green"
              onChange={() => toggleSubscription(params.value == 1 ? 0 : 1)}
            />
          </div>
        );
      },
    },
    {
      headerName: "Action",
      field: "action",
      filter: false,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: { value: any; data: any }) => {
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(params.data)}
              variant="outline"
            >
              Edit
            </Button>
          </div>
        );
      },
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  // fetching data
  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/video-learning/get-all/${token}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setRowData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // State for Add Student Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  // State for Edit Student Modal
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();

  // State for Add Student Form
  const {
    isOpen: isVideoModalOpen,
    onOpen: onVideoModalOpen,
    onClose: onVideoModalClose,
  } = useDisclosure();

  const [currentVideoLink, setCurrentVideoLink] = useState("");
  const [videoDescription, setvideoDescription] = useState<any>(null);
   const [courses, setCourses] = useState<any[]>([]);
     const [steps, setSteps] = useState<any[]>([]);
  const [vedioTitle, setvedioTitle] = useState("");
  const [videoDurationinMin, setvideoDurationinMin] = useState("");
  const [videoLink, setvideoLink] = useState("");
  const [stepNo, setStepNo] = useState("");
   const [selectedCourse, setSelectedCourse] = useState("");
   const [selectedStep, setSelectedStep] = useState("");
  // const [courseStepDetailsMasterId, setCourseStepDetailsMasterId] =
  //   useState("");
  const [videoLearningId, setVideoLearningId] = useState("");

  const handleEdit = (data: any) => {
    // console.log(data);
    setVideoLearningId(data.id);
    setvedioTitle(data.video_title);
    setvideoDurationinMin(data.video_duration_in_mins);
    setvideoLink(data.video_link);
    setvideoDescription(data.video_description);
    setSelectedCourse(data.course_id); 
    setSelectedStep(data.course_step_details_master_id);
    setStepNo(data.step_no);
    // setCourseStepDetailsMasterId(data.course_step_details_master_id);

    onEditModalOpen();
  };

  const handleDelete = (data: any) => {
    setRowData((prev) => prev.filter((student) => student.id !== data.id));
  };



  const handleAddStudent = () => {
    resetForm();
    const token = localStorage.getItem("token") ?? "";
    const form = new FormData();
    form.append("token", token);
    form.append("videoTitle", vedioTitle);
    form.append("videoDescription", videoDescription);
    form.append("videoDurationInMins", videoDurationinMin);
    form.append("videoLink", videoLink);
    form.append("courseStepDetailsMasterId", selectedStep);
    console.log(Object.fromEntries(form.entries()));

    try {
      fetch(`${baseUrl}/video-learning/add`, {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          fetchData();
          if (data.errFlag == 0) {
            toast({
              title: "Success",
              description: "Video Added Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Error",
              description: "Video Not Added",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        });
    } catch (error) {
      console.error("Error adding video:", error);
    }

    resetForm();
    onAddModalClose();
  };



  const handleEditStudent = () => {
    const token = localStorage.getItem("token") ?? "";
    const form = new FormData();
    form.append("token", token);
    form.append("videoLearningId", videoLearningId);
    form.append("videoTitle", vedioTitle);
    form.append("videoDescription", videoDescription);
    form.append("videoDuration", videoDurationinMin);
    form.append("videoLink", videoLink);
    // form.append("courseStepDetailsMasterId", courseStepDetailsMasterId);
    form.append("courseStepDetailsMasterId", selectedStep);

    console.log(Object.fromEntries(form.entries()));
    console.log("updated")

    try {
      fetch(`${baseUrl}/video-learning/update`, {
        method: "POST",
        body: form,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          fetchData();
          if (data.errFlag == 0) {
            toast({
              title: "Success",
              description: "Video Updated Successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Error",
              description: "Video Not Updated",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        });
    } catch (error) {
      console.error("Error updating video:", error);
    }

    resetForm();
    onEditModalClose();
  };

  const resetForm = () => {
    setvedioTitle("");
    setvideoDurationinMin("");
    setvideoLink("");
    setStepNo("");
    setSelectedStep("");
    setSelectedCourse("");
    // setCourseStepDetailsMasterId("");
    setVideoLearningId("");
    setvideoDescription(null);
  };

  const onAddModalOpenWithReset = () => {
    resetForm(); // Clear the form fields
    onAddModalOpen(); // Open the modal
  };

   // Fetch courses
    useEffect(() => {
      // if (token) {
        const token = localStorage.getItem("token") || "";
        fetch(`${baseUrl}/masters/subjects/get-all-subjects/${token}`)
          .then((response) => response.json())
          .then((data) => setCourses(data))
          .catch((error) => console.error("Error fetching courses:", error));
      // }
    }, [baseUrl]);

      // Fetch steps when a course is selected
      useEffect(() => {
        const token = localStorage.getItem("token") || "";
        if (selectedCourse) {
          fetch(
            `${baseUrl}/masters/get-all-course-step-details/${selectedCourse}/${token}`
          )
            .then((response) => response.json())
            .then((data) => setSteps(data))
            .catch((error) => console.error("Error fetching steps:", error));
        }
      }, [selectedCourse, baseUrl]);

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
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Video Data</p>
        <Button onClick={onAddModalOpenWithReset} colorScheme="green">
          Add Video
        </Button>
      </div>
      <div style={{ height: "100%", width: "100%" }}>
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
          getRowHeight={function (params) {
            const description = params.data?.banner_description || "";
            const words = description.split(" ").length;
            const baseHeight = 50;
            const heightPerWord = 6;
            const minHeight = 50;
            const calculatedHeight = baseHeight + words * heightPerWord;
            return Math.max(minHeight, calculatedHeight);
          }}
          domLayout="autoHeight"
          suppressCellFocus={true}
        />
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Video</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course.subject_id} value={course.subject_id}>
                    {course.subject_name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Step</FormLabel>
              <Select
                placeholder="Select Step"
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                isDisabled={!selectedCourse}
              >
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.course_step_title}
                    </option>
                  ))
                ) : (
                  <option disabled>No data available</option>
                )}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Video Title</FormLabel>
              <Input
                placeholder="Enter Video Title"
                value={vedioTitle}
                onChange={(e) => setvedioTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>video Duration in Minutes</FormLabel>
              <Input
                placeholder="Enter Video Duration in Minutes"
                value={videoDurationinMin}
                onChange={(e) => setvideoDurationinMin(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Video Link</FormLabel>
              <Input
                placeholder="Enter Video Link"
                value={videoLink}
                onChange={(e) => setvideoLink(e.target.value)}
              />
            </FormControl>
            {/* <FormControl mt={4}>
              <FormLabel>Course Step Details Master Id</FormLabel>
              <Input
                placeholder="Enter Course Step Details Master Id"
                value={courseStepDetailsMasterId}
                onChange={(e) => setCourseStepDetailsMasterId(e.target.value)}
              />
            </FormControl> */}
            <FormControl mt={4}>
              <FormLabel>Video Description</FormLabel>
              <textarea
                placeholder="Enter Video Description"
                value={videoDescription}
                onChange={(e) => setvideoDescription(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  resize: "none",
                }}
              />
            </FormControl>
            {/* <FormControl mt={4}>
              <FormLabel>Step no</FormLabel>
              <Input
                placeholder="Enter Step No"
                value={stepNo}
                onChange={(e) => setStepNo(e.target.value)}
              />
            </FormControl> */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onAddModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddStudent}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Subject</FormLabel>
              <Select
                placeholder="Select Subject"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course.subject_id} value={course.subject_id}>
                    {course.subject_name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Step</FormLabel>
              <Select
                placeholder="Select Step"
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                isDisabled={!selectedCourse}
              >
                {steps.length > 0 ? (
                  steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.course_step_title}
                    </option>
                  ))
                ) : (
                  <option disabled>No data available</option>
                )}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Video Title</FormLabel>
              <Input
                placeholder="Enter Video Title"
                value={vedioTitle}
                onChange={(e) => setvedioTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>video Duration in Minutes</FormLabel>
              <Input
                placeholder="Enter Video Duration in Minutes"
                value={videoDurationinMin}
                onChange={(e) => setvideoDurationinMin(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Video Link</FormLabel>
              <Input
                placeholder="Enter Video Link"
                value={videoLink}
                onChange={(e) => setvideoLink(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Video Description</FormLabel>
              <textarea
                placeholder="Enter Video Description"
                value={videoDescription}
                onChange={(e) => setvideoDescription(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  resize: "none",
                }}
              />
            </FormControl>
            {/* <FormControl mt={4}>
              <FormLabel>Step no</FormLabel>
              <Input
                placeholder="Enter Step No"
                value={stepNo}
                onChange={(e) => setStepNo(e.target.value)}
              />
            </FormControl> */}
            {/* <FormControl mt={4}>
              <FormLabel>Course Step Details Master Id</FormLabel>
              <Input
                placeholder="Enter Course Step Details Master Id"
                value={courseStepDetailsMasterId}
                onChange={(e) => setCourseStepDetailsMasterId(e.target.value)}
              />
            </FormControl> */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onEditModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleEditStudent}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Video Player Modal */}
      <Modal isOpen={isVideoModalOpen} onClose={onVideoModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Video Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div
              style={{
                width: "100%",
                height: "0",
                paddingBottom: "56.25%",
                position: "relative",
              }}
            >
              <iframe
                src={currentVideoLink}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </ModalBody>
          {/* <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onVideoModalClose}>
              Close
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default StudentsTab;

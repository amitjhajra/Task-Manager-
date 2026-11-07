import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropDown from "../../components/Inputs/SelectDropDown";
import SelectUsers from "../../components/Inputs/SelectUsers";
import TodoListInput from "../../components/Inputs/TodoListInput";
import AddAttachementsInput from "../../components/Inputs/AddAttachementsInput";
import Model from "../../components/layout/Model";
import DeleteAlert from "../../components/layout/DeleteAlert";

const CreateTask = () => {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();

  const [taskData, settaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setcurrentTask] = useState("");
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);
  const [openDeleteAlert, setopenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    settaskData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const clearData = () => {
    settaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: "",
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    seterror("");

    // Input validation
    if (!taskData.title.trim()) {
      seterror("Title is required.");
      return;
    }

    if (!taskData.description.trim()) {
      seterror("Description is required");
      return;
    }

    if (!taskData.dueDate) {
      seterror("Due date is required");
      return;
    }

    if (taskData.assignedTo.length === 0) {
      seterror("Task not assigned to any member");
      return;
    }

    if (taskId) {
      updateTask();
      return;
    }

    createTask();
  };

  // Create task
  const createTask = async () => {
    setloading(true);

    try {
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      });

      toast.success("Task created Successfully");
      clearData();
    } catch (error) {
      console.error("Error creating Task:", error);
      toast.error(error.response?.data?.message || "Error while creating task");
    } finally {
      setloading(false);
    }
  };

  // Update task
  const updateTask = async () => {
    setloading(true);
    try {
      const todolist = taskData.todoChecklist?.map((item) => {
        const prevTodoChecklist = currentTask?.todoChecklist || [];
        const matchedTask = prevTodoChecklist.find((task) => task.text == item);
        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
          ...taskData,
          dueDate: new Date(taskData.dueDate).toISOString(),
          todoChecklist: todolist,
        },
      );

      toast.success("Task Updated SuccessFully ");
    } catch (error) {
      console.error("Error Creating Task :", error);
      setloading(false);
    } finally {
      setloading(false);
    }
  };

  // Get task info by ID
  const getTaskDetailsByID = async (taskId) => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId),
      );

      if (response.data) {
        const taskInfo = response.data.task;

        setcurrentTask(taskInfo);

        settaskData({
          title: taskInfo.title || "",
          description: taskInfo.description || "",
          priority: taskInfo.priority || "Low",

          dueDate: taskInfo.dueDate
            ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
            : "",

          assignedTo:
            taskInfo?.assignedTo?.map((item) => item?._id).filter(Boolean) ||
            [],

          todoChecklist:
            taskInfo?.todoChecklist?.map((item) => item?.text || "") || [],

          attachments: taskInfo?.attachments || [],
        });
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Error fetching task details");
    }
  };

  // Delete task
  const deleteTask = async () => {
    console.log("Task ID being deleted:", taskId);

    try {
      const response = await axiosInstance.delete(
        API_PATHS.TASKS.DELETE_TASK(taskId),
      );

      

      setopenDeleteAlert(false);
      toast.success("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (error) {
      console.error("Delete API error:", error.response?.data || error.message);
    }
  };
  useEffect(() => {
    if (taskId) {
      getTaskDetailsByID(taskId);
    }
  }, [taskId]);

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setopenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" />
                  Delete
                </button>
              )}
            </div>

            {/* Task title */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>

              <input
                className="form-input"
                type="text"
                placeholder="Create App UI"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            {/* Task description */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            {/* Priority, Due Date and Assign To */}
            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-2 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>

                <SelectDropDown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                />
              </div>

              {/* Due date */}
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                </label>

                <input
                  type="date"
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                />
              </div>

              {/* Assign to */}
              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-medium text-slate-600">
                  Assign To
                </label>

                <SelectUsers
                  selectedUsers={taskData.assignedTo}
                  setselectedUsers={(value) =>
                    handleValueChange("assignedTo", value)
                  }
                />
              </div>
            </div>

            {/* TODO Checklist */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                TODO Checklist
              </label>

              <TodoListInput
                todoList={taskData.todoChecklist}
                settodoList={(value) =>
                  handleValueChange("todoChecklist", value)
                }
              />
            </div>

            {/* Attachments */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Add Attachments
              </label>

              <AddAttachementsInput
                attachments={taskData.attachments}
                setattachments={(value) =>
                  handleValueChange("attachments", value)
                }
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}

            {/* Submit button */}
            <div className="flex justify-end mt-7">
              <button
                className="add-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "PLEASE WAIT..."
                  : taskId
                    ? "UPDATE TASK"
                    : "CREATE TASK"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Model
        isOpen={openDeleteAlert}
        onClose={() => setopenDeleteAlert(false)}
        title={"Delete Task"}
      >
        <DeleteAlert
          content="Are you sure you want to delete this task !"
          onDelete={() => deleteTask()}
        />
      </Model>
    </DashboardLayout>
  );
};

export default CreateTask;

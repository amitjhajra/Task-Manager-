import React, { useState } from "react";
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
    settaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    // reset form
    settaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: '',
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  const handleSubmit = async ()=>{
    seterror(null);

    //Input validation 
    if(!taskData.title.trim()){
      seterror("Title is required .");
      return;
    }

    if(!taskData.description.trim()){
      seterror("Description is required");
      return;

    }
    if(!taskData.dueDate){
      seterror("Due date is required");
      return;
    }
    if(taskData.assignedTo?.length === 0 ){
      seterror("Task not assogned to any member");
      return;
    }
    if(taskId){
      updateTask();
      return;
    }

    createTask();

  }


  // create task
  const createTask = async () => {
    setloading(true);
    try {
      const todolist = taskData.todoChecklist?.map((item)=>(
        {text:item,
        completed:false
        }
      ));

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate:new Date(taskData.dueDate).toISOString(),
        todoChecklist:todolist,
      });
      toast.success("Task created Successfully");
      clearData();

    } catch (error) {
      console.error("Error creating Task, ",error);
      setloading(false);
      toast.error("Error while creating task");
    }finally{
      setloading(false);
    }


  };

  // Update task
  const updateTask = async () => {};

  // get task info by ID
  const getTaskDetailsByID = async () => {};

  // delte task
  const deleteTask = async () => {};

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-x font-medium">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 px-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setopenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" />
                  Delete
                </button>
              )}
            </div>

            {/* form title  */}
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

            {/* form description  */}
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

            <div className="grid gird-cols-12 gap-4 mt-2">
              <div className="col-span-2   md:col-span-4">
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


              {/* due date  */}
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">Due Date</label>
                <input
                  type="date"
                  placeholder="Create App UI"
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                />
              </div>

             {/* Assign to  */}
             <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-medium text-slate-600">Assign To</label>
              <SelectUsers 
               selectedUsers={taskData.assignedTo}
               setselectedUsers={(value)=>{
                handleValueChange("assignedTo",value)}}
              />
             </div>


            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                TODO Checklist
              </label>
              <TodoListInput 
               todoList={taskData?.todoChecklist}
               settodoList={(value)=>handleValueChange('todoChecklist',value)}

              />
              
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Add Attachements
              </label>
              <AddAttachementsInput
              attachments={taskData?.attachments}
              setattachments={(value)=>handleValueChange('attachments',value)}
              />

            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}

            <div className="flex justify-end mt-7">
              <button className="add-btn"
              onClick={handleSubmit}
              disabled={loading}
              >

                {taskId ?"UPDATE TASK" :"CREATE TASK"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;

import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuUsers } from "react-icons/lu";
import Model from "../layout/Model";
import AvatarGroup from "../layout/AvatarGroup";

const SelectUsers = ({ selectedUsers, setselectedUsers }) => {
  const [allUsers, setallUsers] = useState([]);
  const [isModalOpen, setisModalOpen] = useState(false);
  const [tempSelectedUsers, settempSelectedUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);

      // console.log(response.data);
      if (response.data?.users?.length > 0) {
        setallUsers(response.data.users);
      }
    } catch (error) {
      console.log("Error Fetching users", error);
    }
  };
  const toggleUserSelection = (userId) => {
    settempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id != userId)
        : [...prev, userId],
    );
  };

  const handleAssign = () => {
    setselectedUsers(tempSelectedUsers);
    setisModalOpen(false);
  };

const selectedUserAvatars = allUsers
  .filter((user) => selectedUsers.includes(user._id))
  .map((user) => ({
    url: user.profileImageUrl,
    name: user.name,
  }));

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      settempSelectedUsers([]);
    }
    return () => {};
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {selectedUserAvatars.length === 0 && (
        <button className="card-btn" onClick={() => setisModalOpen(true)}>
          <LuUsers className="text-sm" />
          Add Members
        </button>
      )}

      {selectedUserAvatars.length >0 && 
       <div className="cursor-pointer" onClick={()=>setisModalOpen(true)}>
        <AvatarGroup avatars={selectedUserAvatars} maxVisible={3}/>
       </div>

      }

      <Model
        isOpen={isModalOpen}
        onClose={() => setisModalOpen(false)}
        title="Selected Users"
      >
        <div className="space-y-4 h-[60vh] overflow-y-auto">
 
          {allUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-3 border-b border-gray-200"
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-[13px] text-gray-500">{user.email}</p>
              </div>

              <input
                type="checkbox"
                checked={tempSelectedUsers.includes(user._id)}
                onChange={() => toggleUserSelection(user._id)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button className="card-btn"
          onClick={()=>setisModalOpen(false)}
          >Cancel</button>

          <button className="card-btn-fill"
          onClick={handleAssign}
          >Done</button>


        </div>
      </Model>
    </div>
  );
};

export default SelectUsers;

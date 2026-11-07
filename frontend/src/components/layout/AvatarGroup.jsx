
import React, { useState } from "react";

const AvatarItem = ({ avatar, index }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = avatar?.url;
  const userName = avatar?.name;

  const showImage = imageUrl && !imageError;

  return (
    <div className="w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-600 font-semibold text-sm">
      {showImage ? (
        <img
          src={imageUrl}
          alt={userName || "User"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        userName?.trim()?.charAt(0).toUpperCase() || "?"
      )}
    </div>
  );
};

const AvatarGroup = ({ avatars = [], maxVisible = 3 }) => {
  return (
    <div className="flex items-center">
      {avatars.slice(0, maxVisible).map((avatar, index) => (
        <AvatarItem
          key={index}
          avatar={avatar}
          index={index}
        />
      ))}

      {avatars.length > maxVisible && (
        <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;

import React from "react";
import { Avatar as ChakraAvatar, AvatarProps } from "@chakra-ui/react";

interface CustomAvatarProps extends AvatarProps {
  user?: {
    name?: string | null;
    avatar?: string | null;
  } | null;
}

export const Avatar: React.FC<CustomAvatarProps> = ({ user, ...props }) => {
  const name = user?.name || "User";
  const src = user?.avatar || undefined;

  return (
    <ChakraAvatar
      name={name}
      src={src}
      borderWidth="2px"
      borderColor="primary.500"
      {...props}
    />
  );
};

export default Avatar;

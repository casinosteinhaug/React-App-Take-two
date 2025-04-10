import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/use-auth";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const { resetPasswordMutation } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPasswordMutation.mutate({ email }, {
      onSuccess: () => {
        onClose();
        setEmail("");
      }
    });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={useColorModeValue("white", "gray.800")}>
        <ModalHeader>Reset Password</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Text mb={4} color={useColorModeValue("gray.600", "gray.400")}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
            <FormControl id="reset-email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button 
              variant="outline" 
              onClick={onClose}
              flex="1"
            >
              Cancel
            </Button>
            <Button 
              colorScheme="primary" 
              type="submit"
              isLoading={resetPasswordMutation.isPending}
              flex="1"
            >
              Send Email
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ResetPasswordModal;

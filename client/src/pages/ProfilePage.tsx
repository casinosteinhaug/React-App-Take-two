import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Textarea,
  useToast,
  IconButton,
  InputGroup,
  InputLeftAddon,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { FaCamera, FaTwitter, FaLinkedin, FaGithub, FaPlus, FaTrash } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { UpdateUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Avatar from "@/components/Avatar";

type SocialLink = {
  platform: string;
  url: string;
};

const defaultSocialIcons: Record<string, React.ReactElement> = {
  twitter: <FaTwitter />,
  linkedin: <FaLinkedin />,
  github: <FaGithub />,
};

const profileUpdateMutation = (userId: number) => 
  useMutation({
    mutationFn: async (updates: UpdateUser) => {
      const res = await apiRequest("PUT", "/api/user", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar: string | null;
    socialLinks: SocialLink[];
  }>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    avatar: user?.avatar || null,
    socialLinks: user?.socialLinks || [],
  });
  
  const updateMutation = profileUpdateMutation(user?.id || 0);

  // Update profile state when user data changes
  React.useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || null,
        socialLinks: user.socialLinks || [],
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const updatedLinks = [...profile.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], url: value };
    setProfile(prev => ({ ...prev, socialLinks: updatedLinks }));
  };

  const addSocialLink = () => {
    setProfile(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'twitter', url: '' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = [...profile.socialLinks];
    updatedLinks.splice(index, 1);
    setProfile(prev => ({ ...prev, socialLinks: updatedLinks }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // and get back a URL. For now, we'll use a local data URL.
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      avatar: profile.avatar,
      socialLinks: profile.socialLinks,
    }, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      },
      onError: (error) => {
        toast({
          title: "Update failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    });
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header title="Profile" showBackButton />
      
      <Container maxW="md" py={8} flex="1">
        <form onSubmit={handleSubmit}>
          <VStack spacing={8}>
            <Flex direction="column" align="center">
              <Box position="relative">
                <Avatar 
                  user={profile}
                  size="xl"
                  onClick={handleAvatarClick}
                  cursor="pointer"
                />
                <IconButton
                  aria-label="Change profile picture"
                  icon={<FaCamera />}
                  size="sm"
                  colorScheme="primary"
                  isRound
                  position="absolute"
                  bottom="0"
                  right="0"
                  onClick={handleAvatarClick}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                  accept="image/*"
                />
              </Box>
            </Flex>
            
            <Stack spacing={6} w="100%">
              <FormControl id="name">
                <FormLabel>Name</FormLabel>
                <Input 
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl id="phone">
                <FormLabel>Phone</FormLabel>
                <Input 
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl id="social-links">
                <FormLabel>Social Links</FormLabel>
                <VStack spacing={3} align="stretch">
                  {profile.socialLinks.map((link, index) => (
                    <InputGroup key={index}>
                      <InputLeftAddon>
                        {defaultSocialIcons[link.platform] || <FaPlus />}
                      </InputLeftAddon>
                      <Input 
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                        placeholder={`${link.platform} URL`}
                      />
                      <IconButton
                        aria-label="Remove social link"
                        icon={<FaTrash />}
                        onClick={() => removeSocialLink(index)}
                        variant="ghost"
                        colorScheme="red"
                      />
                    </InputGroup>
                  ))}
                  
                  <Button 
                    leftIcon={<FaPlus />} 
                    onClick={addSocialLink}
                    size="sm"
                    variant="ghost" 
                    colorScheme="secondary"
                    alignSelf="flex-start"
                  >
                    Add social link
                  </Button>
                </VStack>
              </FormControl>
              
              <FormControl id="bio">
                <FormLabel>Bio</FormLabel>
                <Textarea 
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  size="md"
                  resize="none"
                  rows={4}
                />
              </FormControl>
            </Stack>
            
            <Flex w="100%" justify="space-between" gap={4}>
              <Button 
                flex="1" 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                flex="1"
                type="submit" 
                colorScheme="primary"
                isLoading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </Flex>
          </VStack>
        </form>
      </Container>
    </Box>
  );
};

export default ProfilePage;

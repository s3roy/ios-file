import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Switch,
  VStack,
  useToast,
} from "@chakra-ui/react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [newName, setNewName] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("originalName", originalName);
    formData.append("newName", newName);
    formData.append("matchCase", matchCase);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({
        title: "File processed successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Failed to upload file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box bg="gray.700" p={8} borderRadius="md">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Original Name</FormLabel>
              <Input
                type="text"
                value={originalName}
                onChange={(e) => setOriginalName(e.target.value)}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Name</FormLabel>
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="match-case" mb="0">
                Match Case
              </FormLabel>
              <Switch
                id="match-case"
                isChecked={matchCase}
                onChange={() => setMatchCase(!matchCase)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Upload Zip File</FormLabel>
              <Input
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </FormControl>
            <Button colorScheme="teal" type="submit" width="full">
              Upload and Process
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}

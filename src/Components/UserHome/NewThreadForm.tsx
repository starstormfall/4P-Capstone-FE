import { useState, useRef, useEffect } from "react";

import axios from "axios";

// import style components
import {
  Paper,
  Textarea,
  TextInput,
  Group,
  Button,
  FileInput,
  FileButton,
  Text,
  createStyles,
  Space,
  Title,
  Box,
  Stack,
  Image,
  Grid,
  Center,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: "auto",
    paddingTop: 22,
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: theme.spacing.sm / 2,
    zIndex: 1,
  },
}));

export default function ThreadForm() {
  const { classes } = useStyles();

  const [threadTitle, setThreadTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  // const [fileInputFile, setFileInputFile] = useState<File>();
  const [file, setFile] = useState<File | null>(null);
  const resetRef = useRef<() => void>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const handleSubmitNewThreadPost = async () => {};

  const clearFile = () => {
    setFile(null);
    resetRef.current?.();
  };

  useEffect(() => {
    // create the preview
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    // free memory when ever this component is unmounted
  }, [file]);

  return (
    <Paper radius="md" p="xl" withBorder>
      <form onSubmit={handleSubmitNewThreadPost}>
        {/* THREAD TITLE  */}
        <TextInput
          classNames={classes}
          variant="filled"
          label="Thread Title"
          placeholder="Give a title!"
          withAsterisk
          value={threadTitle}
          onChange={(e) => setThreadTitle(e.target.value)}
        />
        <Space h="md" />

        <Grid>
          <Grid.Col span={9}>
            <Textarea
              classNames={classes}
              variant="filled"
              label="Content"
              placeholder="Share your thoughts here..."
              withAsterisk
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={7}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Box
              sx={(theme) => ({
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                borderStyle: "solid",
                borderColor: "lightGrey",
                height: "15vh",
              })}
            >
              {file ? (
                <>
                  <Stack spacing={3}>
                    <Image
                      height="9vh"
                      fit="contain"
                      alt="preview"
                      src={photoPreview}
                    />
                    <Text align="center" lineClamp={1} size="xs">
                      {file.name}
                    </Text>

                    <Button
                      compact
                      disabled={!file}
                      color="red"
                      onClick={clearFile}
                    >
                      Reset
                    </Button>
                  </Stack>
                </>
              ) : (
                <Center>
                  <FileButton
                    resetRef={resetRef}
                    onChange={setFile}
                    accept="image/png,image/jpeg"
                  >
                    {(props) => (
                      <Button compact variant="light" {...props}>
                        Add image
                      </Button>
                    )}
                  </FileButton>
                </Center>
              )}
            </Box>
          </Grid.Col>
        </Grid>

        <Space h="md" />
        <Group>
          <Button type="submit">Create Post!</Button>
        </Group>
      </form>
    </Paper>
  );
}

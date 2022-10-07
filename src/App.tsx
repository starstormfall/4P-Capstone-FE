import { MantineProvider, Text, Button } from "@mantine/core";
import { tdflTheme } from "./Styles/theme";

export default function App() {
  return (
    <MantineProvider theme={tdflTheme} withGlobalStyles withNormalizeCSS>
      <Text color="blue">Welcome to Mantine!</Text>
      <Button radius="md" color="aqua">
        BUTTON 1
      </Button>
      <Button color="blue">BUTTON 2</Button>
      <Button color="greyBlue">BUTTON 3</Button>
      <Button color="green">BUTTON 1</Button>
      <Button color="purple">BUTTON 1</Button>
      <Button color="beige">BUTTON 1</Button>
    </MantineProvider>
  );
}

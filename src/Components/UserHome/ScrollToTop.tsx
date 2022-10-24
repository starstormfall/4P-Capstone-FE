import { Button, createStyles, Text } from "@mantine/core";
import { ArrowheadUp } from "@easy-eva-icons/react";

const useStyles = createStyles((theme) => ({
  showButton: {
    display: "block",
    position: "fixed",
    cursor: "pointer",
    bottom: "5%",
    left: "90%",
    zIndex: 999,
  },
}));

interface Props {
  scrollUp: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ScrollTopButton = ({ scrollUp }: Props) => {
  const { classes } = useStyles();
  return (
    <Button
      radius="xl"
      variant="gradient"
      gradient={{ from: "beige.9", to: "beige.4" }}
      className={classes.showButton}
      onClick={scrollUp}
      rightIcon={<ArrowheadUp />}
    >
      <Text size="sm">Back to Top</Text>
    </Button>
  );
};
export default ScrollTopButton;

import { createStyles } from "@mantine/core";

export const useStyles = createStyles((theme) => ({
  headerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
    width: "lg",
    [theme.fn.smallerThan("sm")]: {
      justifyContent: "flex-start",
    },
  },

  headerLinks: {
    width: 700,

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  headerRight: {
    width: 700,

    [theme.fn.smallerThan("sm")]: {
      width: "auto",
      marginLeft: "auto",
    },
  },

  headerUser: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  headerBurger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  headerLink: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  headerLinkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

import { useState, useEffect, MouseEvent } from "react";
import {
  ThemeIcon,
  RingProgress,
  Title,
  Text,
  Center,
  Group,
  Stack,
  Image,
  Container,
} from "@mantine/core";

import cherryBlossom from "../../Images/cherry-blossom.png";
import { SmilingFace } from "@easy-eva-icons/react";

interface Props {
  loginStreak: number;
  loginScore: number;
}

export function StreakDialog({ loginStreak, loginScore }: Props) {
  const streakMessage = {
    "1": "",
  };

  return (
    <Container>
      <Title align="center" size="sm">
        {loginStreak} {loginStreak > 1 ? "Days" : "Day"} Streak
      </Title>
      <Center>
        <RingProgress
          size={160}
          roundCaps
          thickness={15}
          sections={[
            { value: 20, color: "purple.3" },
            { value: 20, color: loginStreak > 1 ? "purple.4" : "null" },
            { value: 20, color: loginStreak > 2 ? "purple.5" : "null" },
            { value: 20, color: loginStreak > 3 ? "purple.7" : "null" },
            { value: 20, color: loginStreak > 4 ? "purple.9" : "null" },
          ]}
          label={
            <Center>
              <Stack align="center" spacing={0}>
                <ThemeIcon color="purple" variant="light" radius="xl" size="lg">
                  <Image src={cherryBlossom} />
                </ThemeIcon>
                <Text align="center" size="sm">
                  + {loginScore} points
                </Text>
              </Stack>
            </Center>
          }
        />
      </Center>
      <Text align="center" size="sm">
        Continue to login tomorrow for more points! 😀
      </Text>
    </Container>
  );
}

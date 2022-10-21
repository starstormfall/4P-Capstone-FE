import { useState, useEffect, MouseEvent } from "react";
import {
  ThemeIcon,
  RingProgress,
  Title,
  Center,
  Group,
  Container,
} from "@mantine/core";

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
      Login Streak: {loginStreak}
      <Group spacing={0} noWrap>
        <RingProgress
          size={60}
          sections={[{ value: 100, color: "teal" }]}
          label={
            <Center>
              <ThemeIcon color="teal" variant="light" radius="xl" size="lg">
                <Title order={4}>{loginStreak}</Title>
              </ThemeIcon>
            </Center>
          }
        />
      </Group>
      Points Added: {loginScore}
    </Container>
  );
}

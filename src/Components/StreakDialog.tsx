import { useState, useEffect, MouseEvent } from "react";
import {
  ThemeIcon,
  RingProgress,
  Title,
  Center,
  Group,
  Container,
} from "@mantine/core";

export function StreakDialog() {
  const days = [1, 2, 3, 4, 5];
  const streakMessage = {
    "1": "",
  };

  const rings = days.map((day) => (
    <RingProgress
      size={60}
      sections={[{ value: 100, color: "teal" }]}
      label={
        <Center>
          <ThemeIcon color="teal" variant="light" radius="xl" size="lg">
            <Title order={4}>{day}</Title>
          </ThemeIcon>
        </Center>
      }
    />
  ));

  return (
    <Container>
      Streak Message
      <Group spacing={0} noWrap>
        {rings}
      </Group>
      Points Added: XX
    </Container>
  );
}

import { AssocThread, Post } from "./HomePageInterface";

import { ExternalLinkOutline } from "@easy-eva-icons/react";
import { IconCheck, IconCopy } from "@tabler/icons";

import {
  Group,
  ActionIcon,
  CopyButton,
  Tooltip,
  TextInput,
  Divider,
  Space,
  Text,
} from "@mantine/core";

interface Props {
  selectedPost: Post;
  assocThreads: AssocThread[];
}

export default function SharePost({ selectedPost, assocThreads }: Props) {
  const listAssocThreads = assocThreads.map((thread) => (
    <div key={thread.id}>
      <Group>
        <CopyButton value={selectedPost.externalLink} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied" : "Copy"}
              withArrow
              position="right"
            >
              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
        <TextInput
          placeholder={`http://tdfl.netlify.com/exchange/${thread.id}`}
          disabled
          style={{ width: "85%" }}
        ></TextInput>
      </Group>
      <Space h="sm" />
    </div>
  ));

  return (
    <>
      <Divider labelPosition="center" label="External Site" />
      <Space h="md" />
      <Group>
        <CopyButton value={selectedPost.externalLink} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied" : "Copy"}
              withArrow
              position="right"
            >
              <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
        <TextInput
          placeholder={selectedPost.externalLink}
          disabled
          style={{ width: "75%" }}
        ></TextInput>

        <ActionIcon
          component="a"
          href={selectedPost.externalLink}
          target="_blank"
        >
          <ExternalLinkOutline />
        </ActionIcon>
      </Group>

      <Space h="md" />
      <Divider labelPosition="center" label="Exchange Threads" />
      <Space h="md" />

      {Object.keys(assocThreads).length ? (
        <>{listAssocThreads}</>
      ) : (
        <Text size="sm" align="center">
          No Threads To Share!
        </Text>
      )}
    </>
  );
}

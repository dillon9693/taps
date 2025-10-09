import { Button, Group, Modal, useMantineTheme } from "@mantine/core";
import { MouseEvent, useState } from "react";
import { Beer, Tag as TagType } from "../types";
import Tag from "./Tag";

interface AddTagModalProps {
  beer: Beer;
  opened: boolean;
  close: () => void;
}

export default function AddTagModal({ beer, opened, close }: AddTagModalProps) {
  const theme = useMantineTheme();

  const [selectedTags, setSelectedTags] = useState(new Set<string>());

  // TOOD fetch from back-end
  // TODO change these to just tags
  const tags = [
    {
      tagId: "123",
      tagName: "Hazy",
      upvoteCount: 1,
      downvoteCount: 2,
      currentUserVote: null,
    },
    {
      tagId: "124",
      tagName: "Juicy",
      upvoteCount: 1,
      downvoteCount: 2,
      currentUserVote: null,
    },
  ];

  const handleTagClick = (e: MouseEvent, tag: TagType) => {
    if (selectedTags.has(tag.id)) {
      setSelectedTags(
        (prevState) =>
          new Set([...prevState].filter((tagId) => tagId !== tag.id)),
      );
    } else {
      setSelectedTags((prevState) => new Set([...prevState, tag.id]));
    }
  };

  const handleAddTagsClick = () => {
    console.log("Adding tags");
    console.log(selectedTags);
  };

  // TODO display tags staggered?
  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Adding Tags for ${beer.name}`}
    >
      <Group mt="8" mb="8">
        {tags.map((tag) => (
          <Tag
            key={`add-${tag.tagId}-${beer.id}`}
            beer={beer}
            tagWithVotes={tag}
            withVotes={false}
            onClick={handleTagClick}
            variant={selectedTags.has(tag.tagId) ? "filled" : "outline"}
          />
        ))}
      </Group>

      <Group>
        <Button
          variant="outline"
          size="sm"
          radius="xl"
          style={{
            borderColor: theme.colors.accent[5],
            color: theme.colors.accent[5],
          }}
          onClick={handleAddTagsClick}
        >
          Add Selected Tags
        </Button>
      </Group>
    </Modal>
  );
}

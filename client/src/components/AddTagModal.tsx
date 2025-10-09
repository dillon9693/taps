import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { MouseEvent, useState } from "react";
import { useQuery } from "@apollo/client";
import { Beer, Tag as TagType } from "../types";
import Tag from "./Tag";
import { NEW_TAGS_FOR_BEER, NewTagsForBeerResult } from "../graphql/queries";

interface AddTagModalProps {
  beer: Beer;
  opened: boolean;
  close: () => void;
}

export default function AddTagModal({ beer, opened, close }: AddTagModalProps) {
  const theme = useMantineTheme();

  const [selectedTags, setSelectedTags] = useState(new Set<string>());
  const [errorMessage, setErrorMessage] = useState("");

  // TODO handle errors
  const { data, loading } = useQuery<NewTagsForBeerResult>(NEW_TAGS_FOR_BEER, {
    variables: {
      beerId: beer.id,
    },
  });

  // TODO change these to just tags
  const tags =
    data?.newTagsForBeer.map((tag) => ({
      tagId: tag.id,
      tagName: tag.name,
      upvoteCount: 0,
      downvoteCount: 0,
      currentUserVote: null,
    })) || [];

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

    if (selectedTags.size === 0) {
      setErrorMessage("Please select at least one tag.");
    }

    // TODO save
  };

  const onModalClose = () => {
    setSelectedTags(new Set());
    setErrorMessage("");

    close();
  };

  // TODO display tags staggered?
  return (
    <Modal
      opened={opened}
      onClose={onModalClose}
      title={`Adding Tags for ${beer.name}`}
    >
      <Group mt="8" mb="8">
        {loading && (
          <Center>
            <Loader />
          </Center>
        )}

        {!loading &&
          tags.map((tag) => (
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

      <Group mt="8" mb="8">
        <Text c="red" size="sm">
          {errorMessage}
        </Text>
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

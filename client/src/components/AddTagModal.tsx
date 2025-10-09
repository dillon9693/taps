import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { MouseEvent, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { notifications } from "@mantine/notifications";
import { Beer, Tag as TagType } from "../types";
import Tag from "./Tag";
import {
  GET_BEER,
  NEW_TAGS_FOR_BEER,
  NewTagsForBeerResult,
} from "../graphql/queries";
import { ADD_TAGS_FOR_BEER, AddTagsForBeerResult } from "../graphql/mutations";

interface AddTagModalProps {
  beer: Beer;
  opened: boolean;
  close: () => void;
}

export default function AddTagModal({ beer, opened, close }: AddTagModalProps) {
  const theme = useMantineTheme();

  const [selectedTags, setSelectedTags] = useState(new Set<string>());
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);

  const {
    data: newTagsForBeerData,
    loading: isLoadingNewTags,
    error: newTagsForBeerError,
  } = useQuery<NewTagsForBeerResult>(NEW_TAGS_FOR_BEER, {
    variables: {
      beerId: beer.id,
      search: debouncedSearchTerm.trim() || undefined,
    },
    notifyOnNetworkStatusChange: true,
    skip: !opened,
  });

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

  const onModalClose = () => {
    setSelectedTags(new Set());
    setErrorMessage("");
    setSearchTerm("");

    close();
  };

  const [addTagsForBeer] = useMutation<AddTagsForBeerResult>(
    ADD_TAGS_FOR_BEER,
    {
      refetchQueries: [{ query: GET_BEER, variables: { id: beer.id } }],
    },
  );

  const handleAddTagsClick = async () => {
    if (selectedTags.size === 0) {
      setErrorMessage("Please select at least one tag.");
      return;
    }

    const { data, errors } = await addTagsForBeer({
      variables: {
        beerId: beer.id,
        tagIds: [...selectedTags],
      },
    });

    if (errors && errors.length > 0) {
      setErrorMessage("Something went wrong. Please try again.");
      return;
    }

    if (data && !data.addTagsForBeer.success) {
      setErrorMessage(data.addTagsForBeer.errors[0]);
      return;
    }

    onModalClose();
    notifications.show({
      title: "Tags added!",
      message: "The selected tags were added successfully.",
      color: "green",
    });
  };

  const hasNoTagsToAdd =
    newTagsForBeerData && newTagsForBeerData.newTagsForBeer.length === 0;

  return (
    <Modal
      opened={opened}
      onClose={onModalClose}
      title={`Adding Tags for ${beer.name}`}
    >
      <TextInput
        placeholder="Search for tags..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        mb="md"
      />

      <Group mt="8" mb="8" grow>
        {isLoadingNewTags && (
          <Center>
            <Loader />
          </Center>
        )}
      </Group>

      <Group mt="8" mb="8">
        {!isLoadingNewTags &&
          !newTagsForBeerError &&
          newTagsForBeerData?.newTagsForBeer.map((tag) => (
            <Tag
              key={`add-tags-${tag.id}-${beer.id}`}
              beer={beer}
              tag={tag}
              withVotes={false}
              onClick={handleTagClick}
              variant={selectedTags.has(tag.id) ? "filled" : "outline"}
            />
          ))}

        {hasNoTagsToAdd && <Text size="xs">No tags available to add.</Text>}

        {newTagsForBeerError && (
          <Text size="xs" c="red">
            Something went wrong loading tags.
          </Text>
        )}
      </Group>

      <Group mt="8" mb="8">
        <Text c="red" size="sm">
          {errorMessage}
        </Text>
      </Group>

      <Group grow>
        <Center>
          <Tooltip
            label="You must select at least one tag"
            disabled={selectedTags.size !== 0}
            withArrow
          >
            <Button
              variant="outline"
              size="sm"
              radius="xl"
              style={{
                borderColor: theme.colors.accent[5],
                color: theme.colors.accent[5],
              }}
              onClick={handleAddTagsClick}
              disabled={hasNoTagsToAdd || selectedTags.size === 0}
            >
              Add Selected Tags
            </Button>
          </Tooltip>
        </Center>
      </Group>
    </Modal>
  );
}

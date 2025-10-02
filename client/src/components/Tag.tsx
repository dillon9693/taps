import { Badge, Button, Text, useMantineTheme } from "@mantine/core";
import {
  IconTriangleFilled,
  IconTriangleInvertedFilled,
} from "@tabler/icons-react";
import { useMutation } from "@apollo/client";
import { Beer, Tag as TagType } from "../types";
import { TAG_VOTE } from "../graphql/mutations";

interface TagProps {
  beer: Beer;
  tag: TagType;
}

export default function Tag({ beer, tag }: TagProps) {
  // TODO disable upvote/downvote if 1) user is not authenticated and 2) user already voted
  const theme = useMantineTheme();

  const upvotes = 10;
  const downvotes = 6;

  const [voteForTag, { data, loading, error }] = useMutation(TAG_VOTE);

  // TODO increment on success
  console.log(data);
  // TODO how to handle errors?
  console.log(error);

  // TODO stack count under arrow?
  return (
    <Badge
      key={tag.name}
      variant="outline"
      size="sm"
      style={{
        borderColor: theme.colors.accent[5],
        color: theme.colors.accent[5],
      }}
    >
      <Button
        p={2}
        m={2}
        variant="subtle"
        onClick={() =>
          voteForTag({
            variables: { tagId: tag.id, beerId: beer.id, upvote: false },
          })
        }
        disabled={loading}
      >
        <IconTriangleInvertedFilled size={10} />
        <Text size="xs">{downvotes}</Text>
      </Button>

      {tag.name}

      <Button
        p={2}
        m={2}
        variant="subtle"
        onClick={() =>
          voteForTag({
            variables: { tagId: tag.id, beerId: beer.id, upvote: true },
          })
        }
        disabled={loading}
      >
        <IconTriangleFilled size={10} />
        <Text size="xs">{upvotes}</Text>
      </Button>
    </Badge>
  );
}

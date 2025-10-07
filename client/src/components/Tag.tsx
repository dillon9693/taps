import { useState, type MouseEvent } from "react";
import { Badge, Button, Text, useMantineTheme } from "@mantine/core";
import {
  IconTriangleFilled,
  IconTriangleInvertedFilled,
} from "@tabler/icons-react";
import { useMutation } from "@apollo/client";
import { notifications } from "@mantine/notifications";
import type { Beer, TagWithVotes } from "../types";
import { TAG_VOTE, type TagVoteResult } from "../graphql/mutations";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Tag.module.css";

interface TagProps {
  beer: Beer;
  tagWithVotes: TagWithVotes;
}

export default function Tag({ beer, tagWithVotes }: TagProps) {
  const theme = useMantineTheme();
  const [userVoteType, setUserVoteType] = useState(
    tagWithVotes.currentUserVote,
  );

  const { isAuthenticated } = useAuth();

  const [voteForTag, { data, loading }] = useMutation<TagVoteResult>(TAG_VOTE);

  const upvoteCount = data?.tagVote?.success
    ? data.tagVote.newUpvoteCount
    : tagWithVotes.upvoteCount;
  const downvoteCount = data?.tagVote?.success
    ? data.tagVote.newDownvoteCount
    : tagWithVotes.downvoteCount;

  const performVoteFunc =
    (upvote: boolean) => async (e: MouseEvent<HTMLButtonElement>) => {
      // Need both of these for some reason b/c, if not, it will navigate page due to
      // the link on the BeerCard (may remove this in the future)
      e.preventDefault();
      e.stopPropagation();

      const result = await voteForTag({
        variables: {
          tagId: tagWithVotes.tagId,
          beerId: beer.id,
          upvote,
        },
      });

      if (result.errors || !result.data?.tagVote.success) {
        notifications.show({
          title: "Vote failed",
          message: "Something went wrong while voting. Please try again.",
          color: "red",
        });
      } else {
        setUserVoteType(upvote);
      }
    };

  return (
    <Badge
      key={tagWithVotes.tagName}
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
        onClick={performVoteFunc(false)}
        disabled={
          loading ||
          !isAuthenticated ||
          (userVoteType !== null && !userVoteType)
        }
        className={styles.voteButton}
      >
        <IconTriangleInvertedFilled size={10} />
        <Text size="xs">{downvoteCount}</Text>
      </Button>

      {tagWithVotes.tagName}

      <Button
        p={2}
        m={2}
        variant="subtle"
        onClick={performVoteFunc(true)}
        disabled={
          loading || !isAuthenticated || (userVoteType !== null && userVoteType)
        }
        className={styles.voteButton}
      >
        <IconTriangleFilled size={10} />
        <Text size="xs">{upvoteCount}</Text>
      </Button>
    </Badge>
  );
}

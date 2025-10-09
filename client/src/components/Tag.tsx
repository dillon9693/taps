import { useState, type MouseEvent } from "react";
import {
  Badge,
  Button,
  Text,
  useMantineTheme,
  type BadgeProps,
} from "@mantine/core";
import {
  IconTriangleFilled,
  IconTriangleInvertedFilled,
} from "@tabler/icons-react";
import { useMutation } from "@apollo/client";
import { notifications } from "@mantine/notifications";
import {
  isTagWithVotes,
  toNormalizedTag,
  type Beer,
  type Tag as TagType,
  type TagWithVotes,
} from "../types";
import { TAG_VOTE, type TagVoteResult } from "../graphql/mutations";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Tag.module.css";

interface TagProps {
  beer: Beer;
  tag: TagWithVotes | TagType;
  withVotes?: boolean;
  onClick?: (e: MouseEvent, tag: TagType) => void;
  variant?: BadgeProps["variant"];
}

export default function Tag({
  beer,
  tag,
  withVotes = true,
  onClick = undefined,
  variant = "outline",
}: TagProps) {
  if (withVotes && !isTagWithVotes(tag)) {
    throw new Error(
      "`tag` prop must be of type `TagWithVotes` if `withVotes` prop is `true`",
    );
  }

  if (withVotes && onClick !== undefined) {
    throw new Error("`onClick` handler not allowed when `withVotes` is true");
  }

  const theme = useMantineTheme();
  const normalizedTag = toNormalizedTag(tag);

  const [userVoteType, setUserVoteType] = useState(
    isTagWithVotes(tag) ? tag.currentUserVote : null,
  );

  const { isAuthenticated } = useAuth();

  const [voteForTag, { data, loading }] = useMutation<TagVoteResult>(TAG_VOTE);

  let upvoteCount = 0;
  let downvoteCount = 0;

  if (isTagWithVotes(tag)) {
    upvoteCount = data?.tagVote?.success
      ? data.tagVote.newUpvoteCount
      : tag.upvoteCount;

    downvoteCount = data?.tagVote?.success
      ? data.tagVote.newDownvoteCount
      : tag.downvoteCount;
  }

  const performVoteFunc =
    (upvote: boolean) => async (e: MouseEvent<HTMLButtonElement>) => {
      // Need both of these for some reason b/c, if not, it will navigate page due to
      // the link on the BeerCard (may remove this in the future)
      e.preventDefault();
      e.stopPropagation();

      if (!isTagWithVotes(tag)) {
        throw new Error("Can only vote when `tag` is of type `TagWithVotes`");
      }

      const result = await voteForTag({
        variables: {
          tagId: tag.tagId,
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

  const handleTagClick = (e: MouseEvent) => {
    if (onClick) {
      onClick(e, normalizedTag);
    }
  };

  const ParentComponent = onClick ? Button : Badge;

  return (
    <ParentComponent
      key={normalizedTag.name}
      variant={variant}
      size="sm"
      style={{
        borderColor: theme.colors.accent[5],
        borderRadius: "10px",
        color: theme.colors.accent[5],
        fontSize: "10px",
        height: "25px",
        textTransform: "uppercase",
      }}
      onClick={handleTagClick}
    >
      {withVotes && (
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
      )}

      {normalizedTag.name}

      {withVotes && (
        <Button
          p={2}
          m={2}
          variant="subtle"
          onClick={performVoteFunc(true)}
          disabled={
            loading ||
            !isAuthenticated ||
            (userVoteType !== null && userVoteType)
          }
          className={styles.voteButton}
        >
          <IconTriangleFilled size={10} />
          <Text size="xs">{upvoteCount}</Text>
        </Button>
      )}
    </ParentComponent>
  );
}

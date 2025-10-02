import { Badge, Button, Text, useMantineTheme } from "@mantine/core";
import {
  IconTriangleFilled,
  IconTriangleInvertedFilled,
} from "@tabler/icons-react";
import { Beer, Tag as TagType } from "../types";

interface TagProps {
  beer: Beer;
  tag: TagType;
}

export default function Tag({ beer, tag }: TagProps) {
  const theme = useMantineTheme();

  const upvotes = 10;
  const downvotes = 6;

  console.log(beer);

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
        onClick={() => console.log("downvote")}
      >
        <IconTriangleInvertedFilled size={10} />
        <Text size="xs">{downvotes}</Text>
      </Button>

      {tag.name}

      <Button
        p={2}
        m={2}
        variant="subtle"
        onClick={() => console.log("upvote")}
      >
        <IconTriangleFilled size={10} />
        <Text size="xs">{upvotes}</Text>
      </Button>
    </Badge>
  );
}

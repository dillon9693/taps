import { Badge, useMantineTheme } from "@mantine/core";
import { Beer, Tag as TagType } from "../types";

interface TagProps {
  beer: Beer;
  tag: TagType;
}

export default function Tag({ beer, tag }: TagProps) {
  const theme = useMantineTheme();

  console.log(beer);

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
      {tag.name}
    </Badge>
  );
}

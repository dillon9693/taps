import { Modal } from "@mantine/core";
import { Beer } from "../types";

interface AddTagModalProps {
  beer: Beer;
  opened: boolean;
  close: () => void;
}

export default function AddTagModal({ beer, opened, close }: AddTagModalProps) {
  return (
    <Modal opened={opened} onClose={close} title="Add Tag">
      <p>TODO - {beer.name}</p>
    </Modal>
  );
}

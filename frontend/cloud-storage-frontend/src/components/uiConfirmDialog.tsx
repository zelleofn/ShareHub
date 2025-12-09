import { Button } from "./uiButton";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ message, onConfirm, onCancel }: Props) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200">
    <div className="bg-white p-6 rounded shadow-lg transform scale-95 animate-scale text-text.DEFAULT">
      <p>{message}</p>
      <div className="flex gap-4 mt-4">
        <Button
          variant="danger"
          onClick={onConfirm}
          className="focus:outline-none focus:ring-2 focus:ring-danger"
        >
          Confirm
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          className="focus:outline-none focus:ring-2 focus:ring-brand-light"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
);

export type InputProps = {
  value: string;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type: string;
  id?: string;
  min?: string;
  max?: string;
  step?: string;
};

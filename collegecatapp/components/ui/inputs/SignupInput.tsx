import { InputProps } from "@/types/ui";

const SignupInput = ({
  label,
  placeholder,
  type,
  id,
  value,
  onChange,
}: InputProps) => {
  return (
    <>
      <label htmlFor="">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        id={id}
      />
    </>
  );
};

export default SignupInput;

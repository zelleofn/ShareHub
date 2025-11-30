type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "secondary";
};

export const Button = ({ variant = "primary", className, ...props }: Props) => {
  const base =
    "px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2";

  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark focus:ring-brand-light",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};
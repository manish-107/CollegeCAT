import GoogleIcon from "../icons/GoogleIcon";

interface GoogleLoginButtonProps {
  handleLogin: () => void;
}

const GoogleLoginButton = ({ handleLogin }: GoogleLoginButtonProps) => {
    return (
      <div
        onClick={handleLogin}
        className="flex items-center justify-between gap-6 bg-[#2e2e2e] px-6 py-4 rounded-xl border border-[#aaaaaa4a] hover:bg-[#444444] transition duration-200 cursor-pointer w-full max-w-md mx-auto shadow-lg"
      >
        <div className="flex items-center gap-4">
          <GoogleIcon />
          <span className="text-lg font-medium text-white">Signin or Signup with Google</span>
        </div>
        <span className="text-[#afadad] text-xl">{`→`}</span>
      </div>
    );
  };
  

export default GoogleLoginButton;

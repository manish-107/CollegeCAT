"use client";

import GoogleIcon from "../icons/GoogleIcon";

const GoogleLoginButton = () => {
  const justFunction = () => {
    console.log("clicked");
  };

  return (
    <div
      onClick={justFunction}
      className="flex gap-32 bg-[#403f3f6d] p-4 rounded-xl border border-[#aaaaaa4a] hover:bg-[#63616159] hover:cursor-pointer"
    >
      <div className="flex gap-4">
        <GoogleIcon />
        <button className="rounded-md font-normal" type="button">
          Login with goggle
        </button>
      </div>
      <span className="text-[#afadad]"> {` ->`}</span>
    </div>
  );
};

export default GoogleLoginButton;

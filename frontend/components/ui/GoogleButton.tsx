"use client";

import GoogleIcon from "../icons/GoogleIcon";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

const GoogleLoginButton = () => {
  const handleLogin = () => {
    const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";

    const redirectUrl =
      `${GOOGLE_AUTH_URL}?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=email%20profile%20openid` +
      `&access_type=offline` +
      `&prompt=consent`;

    window.location.href = redirectUrl;
  };

  return (
    <div
      onClick={handleLogin}
      className="flex justify-between items-center gap-6 bg-gray-100 hover:bg-gray-200 dark:bg-[#2e2e2e] dark:hover:bg-[#444444] shadow-lg mx-auto px-6 py-4 border border-gray-300 dark:border-[#aaaaaa4a] rounded-xl w-full max-w-md text-black dark:text-white transition duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <GoogleIcon />
        <span className="font-medium text-lg">Signin or Signup with Google</span>
      </div>
      <span className="text-gray-600 dark:text-[#afadad] text-xl">{`→`}</span>
    </div>
  );
};

export default GoogleLoginButton;

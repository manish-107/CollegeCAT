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

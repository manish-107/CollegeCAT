"use client";

import GoogleIcon from "../icons/GoogleIcon";

const GoogleLoginButton = () => {
  const handleLogin = async () => {
    console.log("Clicked");

    fetch("/api/auth/login")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json(); // Expecting a JSON response (if applicable)
      })
      .then((data) => {
        console.log("Fetched data:", data);
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error.message);
      });
  };

  return (
    <div
      onClick={handleLogin}
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

"use client";

import { useState } from "react";

const UpdateDetails = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [response, setResponse] = useState("");

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/submit", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();
    setResponse(data.msg || data.error);
  };

  return (
    <>
      <div className="flex flex-row justify-center h-screen">
        <form
          className="flex flex-col w-1/4 place-content-center  gap-3"
          onSubmit={handelSubmit}
        >
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="text-black"
            name="Enter the name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="name"
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="enter the email"
            id="email"
          />
          <button className="bg-white text-black p-2 rounded-lg" type="submit">
            Submit
          </button>
          <h1 className="text-white">{response}</h1>
        </form>
      </div>
    </>
  );
};

export default UpdateDetails;

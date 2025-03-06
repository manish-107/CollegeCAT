"use client";

import SignupInput from "@/components/ui/inputs/SignupInput";
import { useState } from "react";

const Signup = () => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-md ">
        <h1>Fill the details</h1>
        <form action="" className="flex flex-col">
          <SignupInput
            label="Name :"
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <label htmlFor="role">Select your role :</label>
          <select id="dropdown" name="options">
            <option value="option1">Hod</option>
            <option value="option2">Time table coordinator</option>
            <option value="option3">Lecturer</option>
          </select>

          <SignupInput
            label="Year of joining the institution :"
            type="number"
            onChange={(e) => setYear(e.target.value)}
            value={year}
            placeholder="YYYY"
            min="1900"
            max="2099"
            step="1"
          />
        </form>
      </div>
    </div>
  );
};

export default Signup;

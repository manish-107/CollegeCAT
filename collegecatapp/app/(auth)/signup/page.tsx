const Signup = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-md ">
        <h1>Fill the details</h1>
        <form action="" className="flex flex-col">
          <label htmlFor="">Name :</label>
          <input type="text" name="Enter your name" id="name" />
          <label htmlFor="role">Select your role :</label>
          <select id="dropdown" name="options">
            <option value="option1">Hod</option>
            <option value="option2">Time table coordinator</option>
            <option value="option3">Lecturer</option>
          </select>
          <label htmlFor="">Year of joining the institution :</label>

          <input
            type="number"
            id="year"
            name="year"
            min="1900"
            max="2099"
            step="1"
            placeholder="YYYY"
          />
        </form>
      </div>
    </div>
  );
};

export default Signup;

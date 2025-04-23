import Head from 'next/head'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black  to-purple-900 px-4">
      <Head>
        <title>Fill the Details</title>
      </Head>

      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-white mb-8 text-center">Fill the details</h1>

        {/* Name Input */}
        <div className="mb-5">
          <label className="block text-white font-medium mb-2">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Role Selection */}
        <div className="mb-5">
          <label className="block text-white font-medium mb-2">Select a Role</label>
          <div className="relative">
            <select
              className="appearance-none w-full bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option className="text-black">Select role</option>
              <option className="text-black">Student</option>
              <option className="text-black">Teacher</option>
              <option className="text-black">Admin</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none">
              ▼
            </div>
          </div>
        </div>

        {/* Year of Joining */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">Year of Joining</label>
          <input
            type="number"
            placeholder="e.g., 2022"
            className="w-full bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Submit Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-2 rounded-lg">
          Submit
        </button>
      </div>
    </div>
  )
}

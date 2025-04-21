'use client';

import { useState } from 'react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (username && password) {
            alert('Login success!');
        } else {
            setErrorMessage('Please fill in both username and password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-purple-900 p-6  font-sans">
            <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md text-white space-y-6 font-Poppins"
            >
                <h1 className="text-2xl text-white text-center uppercase mb-6 font-semibold  font-sans">Login to Continue</h1>

                <div className="relative">
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder=" "
                        required
                        className={`peer w-full py-2 pt-6 px-3 bg-transparent border rounded-md text-white placeholder-transparent transition-all duration-200 ease-in-out  font-sans ${username ? 'border-white' : 'border-gray-400'
                            } focus:border-white focus:outline-none   `}
                    />
                    <label
                        htmlFor="username"
                        className={`absolute left-3 ${username ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2'
                            } text-white transition-all duration-200 ease-in-out font-sans`}
                    >
                        Enter Your Username
                    </label>
                </div>

                <div className="relative mt-6">
                    <input
                        type={passwordVisible ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" "
                        required
                        className={`peer w-full py-2 pt-6 px-3 bg-transparent border rounded-md text-white placeholder-transparent transition-all duration-200 ease-in-out ${password ? 'border-white' : 'border-gray-400'
                            } focus:border-white focus:outline-none`}
                    />
                    <label
                        htmlFor="password"
                        className={` absolute left-3 ${password ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2'
                            } text-white transition-all duration-200 ease-in-out`}
                    >
                        Enter Your Password
                    </label>
                </div>
                {errorMessage && (
                    <div className="text-red-400 text-center text-sm font-medium">
                        {errorMessage}
                    </div>
                )}
                <div className="flex items-center text-white text-sm  font-sans">
                    <input
                        type="checkbox"
                        checked={passwordVisible}
                        onChange={() => setPasswordVisible(!passwordVisible)}
                        id="showPasswordCheckbox"
                        className="mr-2 accent-white"
                    />
                    <label htmlFor="showPasswordCheckbox">Show Password</label>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-purple-700 text-white font-semibold rounded-lg transition duration-300 ease-in-out hover:bg-purple-900  font-sans"
                >
                    Log In
                </button>
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white font-bold rounded-lg transition duration-300 ease-in-out hover:bg-gray-900  font-sans"
                >
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 533.5 544.3"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.1h146.9c-6.4 34.4-25.5 63.6-54.3 83.1v68h87.8c51.4-47.4 81.1-117.3 81.1-195.9z"
                            fill="#4285F4"
                        />
                        <path
                            d="M272 544.3c73.5 0 135-24.4 179.9-66.3l-87.8-68c-24.4 16.4-55.6 26.1-92.1 26.1-70.8 0-130.8-47.9-152.3-112.1H27.4v70.6c44.8 88.5 137.2 149.7 244.6 149.7z"
                            fill="#34A853"
                        />
                        <path
                            d="M119.7 323.9c-10.3-30.7-10.3-63.8 0-94.5v-70.6H27.4c-37.4 73.9-37.4 161.8 0 235.7l92.3-70.6z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M272 107.7c39.9 0 75.7 13.7 104 40.6l77.6-77.6C407 24.4 345.5 0 272 0 164.6 0 72.2 61.2 27.4 149.7l92.3 70.6C141.2 155.6 201.2 107.7 272 107.7z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span>Login with Google</span>
                </button>

            </form>
        </div>
    );

}

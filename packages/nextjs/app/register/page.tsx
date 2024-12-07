"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAccount } from "wagmi";

export default function CryptoRegistration() {
  const [name, setName] = useState("");
  const [isSeller, setIsSeller] = useState(false);

  const { address } = useAccount();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profileData = {
      name,
      eoa: address,
      isSeller,
    };

    try {
      const myPromise = await axios.post("/api/profile", profileData);
      const response = myPromise;
      console.log("wtf is ", response);
      router.push("/");
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-2">Crypto Registration</h2>
          <p className="text-center text-gray-500 mb-6">Register as a crypto buyer or seller</p>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="seller-mode"
                  checked={isSeller}
                  onChange={e => setIsSeller(e.target.checked)}
                  className="w-6 h-6"
                />
                <label htmlFor="seller-mode" className="text-gray-700">
                  Register as a Seller
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="p-4 text-sm text-center text-gray-500">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

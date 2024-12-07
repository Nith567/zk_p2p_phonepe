"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">zkp2p-phon 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>
        <div>
          <div className="card bg-base-100 w-96 shadow-xl">
            <figure>
              <img
                src="https://imgs.search.brave.com/LkIY9ehHw5X9V4RANRY35uQ4_O4jTDnK-_tPVdYrM1M/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cHJvZC53ZWJzaXRl/LWZpbGVzLmNvbS82/NDI3MzkyMjhhOTEz/OTI1MTIzZGQ4MDUv/NjRlNjYzMjAzN2Rm/Y2JjN2ZlMjY4MTQ2/X2luZm9ncmFwaGlj/LTItb24tb2ZmLXJh/bXBzLmpwZWc"
                alt="ramp"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">zkp2p-phonepe</h2>
              <p>Register and </p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">Welcome</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

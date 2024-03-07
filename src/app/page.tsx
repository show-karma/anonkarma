"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const account = useAccount();

  const karmaSecret = process.env.NEXT_PUBLIC_KARMA_SECRET || "karma";

  useEffect(() => {
    if (account) {
      setIdentity(new Identity(account.address + karmaSecret));
    }
  }, []);

  return (
    <main className="container flex min-h-screen flex-col items-center justify-between p-10">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <div className="relative flex place-items-center">
        <Image
          className="relative"
          src="/logo/logo-dark.png"
          alt="Karma Logo"
          width={180}
          height={180}
          priority
        />
        <div className="mr-10">
          <div className="text-3xl font-bold">anonkarma</div>
          <div className="text-lg ">zk identity provider</div>
        </div>
      </div>

      <section className="lg:max-w-5xl lg:w-full ">
        <div className="ring-1 ring-zinc-700 rounded-xl p-8 w-full">
          {!account?.address ? (
            <div className="flex justify-center items-center flex-col">
              <h3 className="text-md mb-5">
                Connect your wallet to get started
              </h3>
              <ConnectButton />
            </div>
          ) : (
            <div className="flex justify-center items-start flex-col">
              <div className="flex w-full justify-between items-center">
                <Button
                  onClick={() => {
                    setIdentity(new Identity(account.address + karmaSecret));
                    setShowIdentity(true);
                  }}
                  className="font-bold mr-5"
                >
                  Generate Karma Anon ID
                </Button>
                <ConnectButton />
              </div>

              {(showIdentity || account?.address) && identity && (
                <div className="mt-10 flex justify-center items-between flex-col w-full">
                  <div className="text-center rounded p-2">
                    <Badge>Public Key</Badge>
                    <div className="text-md mt-2">
                      {String(identity?.publicKey[0])}
                    </div>
                  </div>
                  <div className="mt-5 text-center rounded pt-2 px-2">
                    <Badge>Commitment</Badge>
                    <div className="text-md mt-2">
                      {String(identity?.commitment)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-md mt-3 text-center text-zinc-600">
          You can alternately generate committment by running this site locally
          using this{" "}
          <a
            className="font-bold"
            target="_blank"
            href="https://github.com/show-karma/anonkarma"
          >
            code ↗
          </a>
        </p>
      </section>

      <section className="mt-10 ">
        <h3 className="text-md ml-5 text-zinc-600 mb-1">
          Quick Links for{" "}
          <span className="font-bold text-md">
            <a target="_blank" href="https://www.karmahq.xyz/">
              karmahq.xyz
            </a>
          </span>
        </h3>

        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
          <a
            href="https://gap.karmahq.xyz/"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              GAP
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              GAP is a protocol to help community get visibility into grantee
              progress and grantees to build reputation.
            </p>
          </a>

          <a
            href="https://www.karmahq.xyz/daos#delegate-dashboards"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Delegate Dashboards{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Enable DAOs to facilitate delegate self-onboarding and information
              management.
            </p>
          </a>

          <a
            href="https://www.nounskarma.xyz/"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              NounsKarma{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              A reputation primitive in the Nouns Ecosystem that can be used by
              anyone to build tools and applications.
            </p>
          </a>

          <a
            href="https://warpcast.com/karmabot"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Karmabot{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
              Bot to help you build reputation. Now available on Farcaster!
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}

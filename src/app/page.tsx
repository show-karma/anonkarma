"use client";
import { useEffect, useState } from "react";
import { createHash } from "crypto";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import axios from "axios";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateProof } from "@semaphore-protocol/proof";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
  TooltipProvider,
} from "@/components/ui/tooltip";

function CopyToClipBoard({ text }: { text: string }) {
  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(text);
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center items-center">
              <svg
                className="ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
          </TooltipTrigger>
          <TooltipContent className="">
            <p>Click to copy</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default function Home() {
  const searchParams = useSearchParams();
  const account = useAccount();

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [group, setGroup] = useState<Group>(new Group([]));
  const [showIdentity, setShowIdentity] = useState(false);
  const [proof, setProof] = useState<any | null>(null);

  const [groupId, setGroupId] = useState<string | null>(null);
  const [scope, setScope] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [callbackUrl, setCallbackUrl] = useState<string>("");

  // TODO: Configure this secret in the environment variable
  const karmaSecret = process.env.NEXT_PUBLIC_KARMA_SECRET || "karma";
  // TODO: ==================================================

  useEffect(() => {
    try {
      const proofData = JSON.parse(atob(searchParams.get("proofData") as any));

      setScope(proofData.scope);
      setMessage(proofData.message);
      setGroupId(proofData.groupId);
      setCallbackUrl(proofData.callbackUrl);
    } catch (e) {
      console.error(e);
      setProof(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (identity && groupId && message && scope && callbackUrl) {
      axios
        .get(`http://localhost:3002/semaphores/groups/${groupId}`)
        .then((karmaGroup) => {
          console.log(karmaGroup);
          setGroup(
            new Group(
              karmaGroup.data.members.map((member: string) => BigInt(member))
            )
          );

          if (group.members.length > 0) {
            generateProof(identity, group, message, scope).then((proof) => {
              console.log("Proof:", proof);
              setProof(proof);
            });
          }
        })
        .catch((e) => {
          console.error(e);
          return { data: { members: [] } };
        });
    }
  }, [groupId, message, scope, identity, callbackUrl, group.members.length]);

  return (
    <main className="container flex min-h-screen flex-col items-center justify-between p-10">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>

      <Header />

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
                    setIdentity(
                      new Identity(
                        createHash("sha256")
                          .update(account.address?.toLowerCase() + karmaSecret)
                          .digest("base64")
                      )
                    );
                    setShowIdentity(true);
                  }}
                  className="font-bold mr-5"
                >
                  Generate Karma Anon ID
                </Button>
                <ConnectButton />
              </div>

              {(showIdentity || account?.address) && identity && (
                <div className="mt-10 justify-center items-between flex flex-col w-full">
                  <div className="grid grid-cols-3 gap-5">
                    <div className="text-center">
                      <Badge
                        variant={"outline"}
                        className=" hover:bg-white hover:text-black"
                      >
                        Public Key{" "}
                        <CopyToClipBoard
                          text={String(identity?.publicKey[0])}
                        />
                      </Badge>
                      <Input
                        defaultValue={String(identity?.publicKey[0])}
                        type="text"
                        className="text-md text-center bg-zinc-900 mt-2 flex justify-center items-center"
                      />
                    </div>

                    <div className="text-center">
                      <Badge
                        variant={"outline"}
                        className=" hover:bg-white hover:text-black"
                      >
                        Private Key{" "}
                        <CopyToClipBoard text={String(identity?.privateKey)} />
                      </Badge>
                      <Input
                        defaultValue={String(identity?.privateKey)}
                        type="text"
                        className="text-md text-center bg-zinc-900 mt-2 flex justify-center items-center"
                      />
                    </div>
                    <div className="text-center rounded">
                      <Badge
                        variant={"outline"}
                        className=" hover:bg-white hover:text-black"
                      >
                        Commitment{" "}
                        <CopyToClipBoard text={String(identity?.commitment)} />
                      </Badge>
                      <Input
                        defaultValue={String(identity?.commitment)}
                        type="text"
                        className="text-md text-center bg-zinc-900 mt-2 flex justify-center items-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5 mt-5">
                    <div className="text-center">
                      <Badge
                        variant={"outline"}
                        className=" hover:bg-white hover:text-black"
                      >
                        Karma GroupId{" "}
                        <CopyToClipBoard
                          text={String(identity?.publicKey[0])}
                        />
                      </Badge>
                      <Input
                        value={String(groupId)}
                        type="text"
                        onChange={(e) => setGroupId(e.target.value)}
                        className="text-md text-center bg-zinc-900 mt-2 flex justify-center items-center"
                      />
                    </div>

                    <div className="text-center">
                      <Badge
                        variant={"outline"}
                        className=" hover:bg-white hover:text-black"
                      >
                        Message Hash
                        <CopyToClipBoard text={String(message)} />
                      </Badge>
                      <Input
                        value={String(message)}
                        type="text"
                        onChange={(e) => setMessage(e.target.value)}
                        className="text-md text-center bg-zinc-900 mt-2 flex justify-center items-center"
                      />
                    </div>
                    <div className="text-center rounded">
                      <Badge
                        variant={"outline"}
                        className=" hover:bg-white hover:text-black"
                      >
                        Scope <CopyToClipBoard text={String(scope)} />
                      </Badge>
                      <Input
                        onChange={(e) => setScope(parseInt(e.target.value))}
                        value={String(scope)}
                        type="text"
                        className="text-md text-center bg-zinc-900 mt-2 flex justify-center items-center"
                      />
                    </div>
                  </div>

                  {/* Proof Box */}
                  <div className="text-center w-full mt-5">
                    <Badge
                      variant={"outline"}
                      className="mt-2 ring-2 ring-zinc-200 hover:bg-white hover:text-black"
                    >
                      Copy Generated Proof
                      <CopyToClipBoard
                        text={btoa(JSON.stringify(proof)) || ""}
                      />
                    </Badge>
                    <Textarea
                      value={
                        proof ? btoa(JSON.stringify(proof)) : "Generating..."
                      }
                      className="rounded-lg w-full text-justify h-[10vh] overflow-clip bg-zinc-900 ring-zinc-900 mt-5 placeholder:text-zinc-600"
                      placeholder="Paste your message here to generate proof."
                    />
                    <Button
                      onClick={() => {
                        setProof(null);
                        generateProof(identity, group, message, scope).then(
                          (proof) => {
                            console.log("Proof:", proof);
                            setProof(proof);
                          }
                        );
                      }}
                      variant={"outline"}
                      className="bg-zinc-900 anim hover:bg-white hover:text-black mt-3 w-full "
                    >
                      Generate ⚙️
                    </Button>
                    <Button
                      variant={"secondary"}
                      onClick={() => {
                        window.open(
                          `${callbackUrl}/?proof=${btoa(JSON.stringify(proof))}`
                        );
                      }}
                      className="bg-zinc-900 hover:bg-white hover:text-black mt-3 w-full "
                    >
                      Send Proof ↗️
                    </Button>
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

      <Footer />
    </main>
  );
}

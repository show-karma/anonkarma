"use client";
import { useEffect, useState } from "react";
import { createHash } from "crypto";
import { useSearchParams } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";

import { SemaphoreSubgraph } from "@semaphore-protocol/data";

import Layout from "@/components/Layout";
import CopyToClipBoard from "@/components/CopyToClipboard";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateProof } from "@semaphore-protocol/proof";

function getDomain(callbackUrl: string): string | null {
  const matches = callbackUrl.match(
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
  );
  return matches && matches[1];
}

export default function Home() {
  const searchParams = useSearchParams();
  const account = useAccount();

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [group, setGroup] = useState<Group>(new Group([]));
  const [showIdentity, setShowIdentity] = useState(false);
  const [proof, setProof] = useState<any | null>(null);
  const [proofError, setProofError] = useState<string>("");

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
      setProofError("Invalid Proof Data");
    }
  }, [searchParams]);

  useEffect(() => {
    if (identity && groupId && message && scope && callbackUrl) {
      const subgraph = new SemaphoreSubgraph(
        "https://api.studio.thegraph.com/query/63515/semaphores-op-sepolia/version/latest"
      );

      subgraph
        .getGroup(groupId, {
          members: true,
        })
        .then((karmaGroup) => {
          setGroup(new Group(karmaGroup?.members));

          if (group.members.length > 0) {
            // Check if identity is part of the group)
            if (group.indexOf(identity.commitment) !== -1) {
              generateProof(identity, group, message, scope)
                .then((proof) => {
                  console.log("Proof:", proof);
                  setProof(proof);
                })
                .catch((e) => {
                  console.error(e);
                  setProofError("Invalid Proof Data");
                });
            } else {
              setProofError("Identity not part of the group");
            }
          }
        })
        .catch((e) => {
          console.error(e);
          setProofError("Invalid Group Id");
          return { data: { members: [] } };
        });
    }
  }, [groupId, message, scope, identity, callbackUrl]);

  return (
    <Layout>
      <main className="lg:max-w-5xl lg:w-full ">
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
                        proof
                          ? btoa(JSON.stringify(proof))
                          : !message || !groupId || !scope || !callbackUrl
                          ? "Please fill all the fields to generate proof."
                          : proofError || "Proof will be generated here..."
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
                      disabled={!callbackUrl}
                      onClick={() => {
                        window.open(
                          `${callbackUrl}/?proof=${btoa(JSON.stringify(proof))}`
                        );
                      }}
                      className="bg-zinc-900 hover:bg-white hover:text-black mt-3 w-full "
                    >
                      Send Proof to callbackUrl:{" "}
                      <span className="ml-1 font-bold">
                        {getDomain(callbackUrl)}
                      </span>
                      ↗️
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
      </main>
    </Layout>
  );
}

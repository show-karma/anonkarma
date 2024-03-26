import Image from "next/image";

export default function Header() {
  return (
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
  );
}

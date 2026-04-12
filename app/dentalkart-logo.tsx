import Image from "next/image";

export default function DentalkartLogo({
  size = 40,
}: {
  size?: number;
}) {
  return (
    <Image
      src="/dentalkart-logo.png"
      alt="Dentalkart"
      width={size}
      height={size}
      priority
      className="object-contain"
      style={{ width: size, height: size }}
    />
  );
}

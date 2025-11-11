import Image from "next/image";

interface Props {
  alt: string;
  src: string;
}

export default function DocTutorialImage({ alt, src }: Props) {
  return (
    <div className="border-2 border-dashed border-border">
      <Image className="mx-auto rounded-lg bg-secondary/90 object-cover shadow-2xl" alt={alt} src={src} />
    </div>
  );
}

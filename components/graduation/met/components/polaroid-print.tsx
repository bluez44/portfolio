import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { PHOTO_QUALITY } from "../photo-quality";

type Props = {
  image: string;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** Extra classes / styles on the photo itself (focus, filters). */
  imageClassName?: string;
  imageStyle?: CSSProperties;
  /** Laid over the photo, e.g. a caption label. */
  overlay?: ReactNode;
  /** The chin under the photo. */
  children: ReactNode;
};

/** A large polaroid print: a 4:5 photo in a paper frame, with whatever the chin carries below it. */
export function PolaroidPrint({ image, alt, sizes, className = "", style, imageClassName = "", imageStyle, overlay, children }: Props) {
  return (
    <figure className={`relative m-0 flex flex-col rounded-[6px] border-[1.5px] border-ink bg-paper p-2.5 shadow-(--offset-sm) ${className}`} style={style}>
      <div className="relative aspect-4/5 shrink-0 overflow-hidden rounded-[3px]">
        <Image src={image} alt={alt} fill sizes={sizes} className={`object-cover ${imageClassName}`} style={imageStyle} quality={PHOTO_QUALITY} />
        {overlay}
      </div>
      {children}
    </figure>
  );
}

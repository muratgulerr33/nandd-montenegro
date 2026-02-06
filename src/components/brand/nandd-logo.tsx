import Image from 'next/image';

export function NanddLogo() {
  return (
    <span className="relative block h-8 w-[clamp(130px,42vw,190px)] sm:h-8 sm:w-[190px] md:h-9 md:w-[210px] shrink-0 select-none">
      <Image
        src="/brand/nandd-logo-light.webp"
        alt="N-AND-D logo"
        fill
        quality={90}
        className="object-contain object-left block dark:hidden [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.08))]"
        sizes="(max-width: 640px) 42vw, (max-width: 768px) 190px, 210px"
        priority
      />
      <Image
        src="/brand/nandd-logo-dark.webp"
        alt="N-AND-D logo"
        fill
        quality={90}
        className="object-contain object-left hidden dark:block"
        sizes="(max-width: 640px) 42vw, (max-width: 768px) 190px, 210px"
        priority
      />
    </span>
  );
}

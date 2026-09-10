export const homeCtaClasses = {
  yellow: {
    fill: 'inline-flex items-center gap-2.5 rounded-full border border-black bg-black px-[22px] py-3.5 text-[13.5px] font-semibold text-white',
    link: (light: boolean) =>
      `inline-flex items-center gap-2.5 rounded-full border px-[22px] py-3.5 text-[13.5px] font-semibold ${light ? 'border-white bg-white text-black' : 'border-black bg-black text-white'}`,
    wFit:
      'inline-flex w-fit items-center gap-2.5 rounded-full border border-black bg-black px-[22px] py-3.5 text-[13.5px] font-semibold text-white'
  },
  black: {
    onLight:
      'inline-flex items-center gap-2.5 rounded-full border border-black bg-transparent px-[22px] py-3.5 text-[13.5px] font-semibold text-[#111]',
    onDark:
      'inline-flex items-center rounded-full border border-white/35 bg-transparent px-[22px] py-3.5 text-[13.5px] font-semibold text-white',
    onDarkLarge:
      'inline-flex items-center rounded-full border border-white/35 bg-transparent px-7 py-[17px] text-[15px] font-semibold text-white'
  }
} as const

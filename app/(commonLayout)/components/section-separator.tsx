type SectionSeparatorProps = {
  index?: string
  title?: string
}

const SectionSeparator: React.FC<SectionSeparatorProps> = ({ index, title }) => {
  return (
    <div
      className="mb-12 font-medium text-[10px] flex items-center gap-2
     border-t border-black/10 text-black/40 pt-4"
    >
      {index && <span className="tracking-widest">{index}</span>}
      {index && title && <span>/</span>}
      {title && <span className="uppercase tracking-widest ">{title}</span>}
    </div>
  )
}

export default SectionSeparator

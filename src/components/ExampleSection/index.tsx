import { Props } from "./types";

export function ExampleSection({ heading, subtitle, backgroundColor }: Props) {
  return (
    <section className="example-section" style={backgroundColor ? { backgroundColor } : undefined}>
      <div className="example-section-inner">
        <h2 className="example-section-heading">{heading}</h2>
        {subtitle && <p className="example-section-subtitle">{subtitle}</p>}
      </div>
    </section>
  );
}

export default ExampleSection;

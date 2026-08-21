import { Props } from "./types";

export function ExampleComponent({
  title,
  description = "This is an example ikas code component built with Preact.",
  showButton,
  buttonText = "Click Me",
}: Props) {
  return (
    <div className="example-component">
      <h1 className="example-title">{title}</h1>
      <p className="example-description">{description}</p>
      {showButton && (
        <button className="example-button">
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default ExampleComponent;

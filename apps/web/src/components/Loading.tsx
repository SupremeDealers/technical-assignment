import "./Loading.css";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export function Loading({ size = "md", text, fullPage = false }: LoadingProps) {
  const content = (
    <div className="loading">
      <div className={`spinner spinner-${size}`} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-fullpage">{content}</div>;
  }

  return content;
}

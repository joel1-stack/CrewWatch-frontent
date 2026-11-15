// Loading state: a skeleton shimmer, never a blank box.
export default function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

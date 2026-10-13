import { cn } from "../../utils/cn";

export function Skeleton({ className, ...rest }) {
  return <div className={cn("skeleton", className)} {...rest} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export default Skeleton;
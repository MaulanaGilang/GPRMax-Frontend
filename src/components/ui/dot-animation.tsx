import * as React from "react";

const DotAnimation = () => {
  return (
    <div className="flex justify-center items-center space-x-1">
      <Dot />
      <Dot delay="delay-150" />
      <Dot delay="delay-300" />
    </div>
  );
};

const Dot = ({ delay }: { delay?: string }) => (
  <span
    className={`block h-1 w-1 bg-black rounded-full animate-blink ${delay}`}
  />
);

export default DotAnimation;

// This is a file with demos of the SpotlightButton component
// Each export is one usecase for the component

import { Component as SpotlightButton } from "@/components/ui/spotlight-button";

const DemoOne = () => {
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 dark:bg-black p-8 rounded-lg">
      <SpotlightButton />
    </div>
  );
};

export { DemoOne };

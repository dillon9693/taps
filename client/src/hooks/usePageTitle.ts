import { useEffect } from "react";

interface UsePageTitleOptions {
  title: string;
  defaultTitle?: string;
}

export const usePageTitle = ({
  title,
  defaultTitle = "Discover Great Beer",
}: UsePageTitleOptions) => {
  useEffect(() => {
    const titlePrefix = `Taps -`;
    const fullTitle = `${titlePrefix} ${title}`;
    document.title = fullTitle;

    // Cleanup function to restore default title if needed
    return () => {
      if (defaultTitle) {
        document.title = `${titlePrefix} ${defaultTitle}`;
      }
    };
  }, [title, defaultTitle]);
};

export default usePageTitle;

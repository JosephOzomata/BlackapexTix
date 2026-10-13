import { useEffect } from "react";
import { SITE } from "../utils/seo";

export function useDocumentTitle(title, { reset = true } = {}) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${SITE.defaultTitle}` : SITE.defaultTitle;
    return () => {
      if (reset) document.title = previous;
    };
  }, [title, reset]);
}

export default useDocumentTitle;
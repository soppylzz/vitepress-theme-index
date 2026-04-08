import { useData } from "vitepress";
import { runtimeLogger } from "@vitepress-theme-index/shared";
import { computed } from "vue";

function useShare() {
  const { page } = useData();
  const shareInfo = computed(() => ({
    url: window.location.href,
    title: page.value.title || "",
    desc: page.value.description || "",
  }));

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareInfo.value.url);
    } catch {
      runtimeLogger.error("failed to copy link");
    }
  }

  function shareToMail() {
    const subject = shareInfo.value.title;
    const body = `${shareInfo.value.desc}\n${shareInfo.value.url}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  }

  return { copyLink, shareToMail };
}

export { useShare };

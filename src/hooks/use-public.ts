export const usePublic = () => {
  const getAssetsFile = (url: string) => {
    return new URL(`../assets/${url}`, import.meta.url).href
  }
  return {
    getAssetsFile
  }
}
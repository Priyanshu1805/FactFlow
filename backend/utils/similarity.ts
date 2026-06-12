export function stringSimilarity(str1: string, str2: string): number {
  const getBigrams = (str: string) => {
    const s = str.toLowerCase();
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(str1);
  const bg2 = getBigrams(str2);

  let intersectionSize = 0;
  for (const bg of bg1) {
    if (bg2.has(bg)) {
      intersectionSize++;
    }
  }

  const total = bg1.size + bg2.size;
  if (total === 0) return 0;
  
  return (2.0 * intersectionSize) / total;
}

export const generatorRandomMsg = (wordList: string[]) => {
  const randomValue = Math.floor(Math.random() * wordList.length);

  return wordList[randomValue];
};

// 此文件中的 AI 功能已被移除，以确保应用为纯静态且无 API 依赖。
// 如果您将来需要恢复 AI 生成关卡的功能，请恢复之前的代码并配置 API_KEY。

export const generateLevelFromPrompt = async (promptText: string): Promise<boolean[]> => {
  console.warn("AI generation is currently disabled.");
  return Array(9).fill(false);
};

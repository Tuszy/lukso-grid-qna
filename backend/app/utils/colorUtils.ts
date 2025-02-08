export interface QnaColorConfig {
  bg: string;
  lt: string;
  lb: string;
  lm: string;
  rt: string;
  rb: string;
  rm: string;
}

export const defaultColor = {
  bg: "#fff",
  lt: "#000",
  lb: "#000",
  lm: "#fff",
  rt: "#000",
  rb: "#000",
  rm: "#fff",
};

export const colorKeyToName: QnaColorConfig = {
  bg: "Background",
  lt: "Left text",
  lb: "Left Border",
  lm: "Left Bubble",
  rt: "Right Text",
  rb: "Right Border",
  rm: "Right Bubble",
};

import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
    },
    plugins: ["react"],
  },
  fmt: {
    ignorePatterns: ["dist", "storybook-static"],
  },
});

import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
    },
  },
  fmt: {
    ignorePatterns: [".next", "storybook-static"],
  },
});

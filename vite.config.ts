import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
    },
    plugins: ["react", "nextjs"],
  },
  fmt: {
    ignorePatterns: [".next", "storybook-static"],
  },
});

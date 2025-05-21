// eslint.config.js (根目录)
// 这只是一个示例结构，你需要根据你的实际配置调整
import globals from "globals";
import pluginJs from "@eslint/js";
// 如果你用了其他插件，比如 Vue, TypeScript 等，也需要导入

export default [
  { languageOptions: { globals: globals.browser } }, // 这是针对前端浏览器环境的
  pluginJs.configs.recommended,
  // ... 其他你的 Vue 等配置

  // 新增或修改以下部分，专门为 server 目录配置
  {
    files: ["server/**/*.js"], // 只对 server 目录下的 .js 文件生效
    languageOptions: {
      globals: {
        ...globals.node, // 添加 Node.js 全局变量
        // 如果还有其他自定义全局变量，可以在这里添加
      },
      sourceType: "commonjs", // 指明 server 目录使用 CommonJS
    },
    // 如果 server 目录有特定的规则，可以在这里添加
    // rules: {
    //   // "some-node-specific-rule": "error"
    // }
  }
];

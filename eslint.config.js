import antfu from "@antfu/eslint-config"

export default antfu(
  {
    formatters: true,
    unocss: true,
    // 关闭严格的类型检查，防止报红
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
  },
  {
    // 这里是我们手动关闭的“烦人规则”
    rules: {
      // 1. 关掉 import 排序检查 (你爱把 import 写哪就写哪)
      "import/order": "off",
      "sort-imports": "off",
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-imports": "off",
      "perfectionist/sort-exports": "off",

      // 2. 关掉双引号/单引号强迫症 (用啥引号都行)
      "style/quotes": "off",
      "quotes": "off",

      // 3. 关掉分号检查 (加不加分号随你)
      "style/semi": "off",
      "semi": "off",

      // 4. 关掉 Vue 组件属性排序 (ref 放在 method 前面后面都行)
      "vue/order-in-components": "off",
      "vue/attributes-order": "off",

      // 5. 关掉未使用的变量报错 (定义了没用也不报错)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "off",

      // 6. 其他烦人的格式规则
      "no-console": "off", // 允许 console.log
      "no-debugger": "off",
      "vue/html-self-closing": "off",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
    }
  }
)

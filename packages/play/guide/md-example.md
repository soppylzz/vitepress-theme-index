# Markdown 样式全面测试文档

这是一份用于全面测试 Markdown 渲染样式的文档，包含了 CommonMark 和 GFM 规范的所有常用元素。

## 文本格式测试

**粗体文本**、_斜体文本_、**_粗斜体文本_**、~~删除线文本~~

这是一段普通的段落文本，用于测试基本的行高、字间距和段落间距。Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

> 这是一段引用文本，用于测试引用块的样式。引用块可以包含多行文本，并且可以嵌套其他元素。
>
> > 这是嵌套的引用文本
>
> 引用块内的普通文本

## 链接与图片

[普通链接](https://github.com)
[带标题的链接](https://github.com "GitHub")
<https://github.com>

![示例图片](https://picsum.photos/800/400)

## 代码测试

这是`行内代码`，用于测试行内代码的背景色和内边距。

```javascript
// 这是一个JavaScript代码块
function helloWorld() {
  console.log("Hello, World!");
}

// 测试代码块的换行和缩进
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);
console.log(doubled);
```

```python
# Python代码块
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

## 列表测试

### 无序列表

- 列表项 1
- 列表项 2
  - 嵌套列表项 2.1
  - 嵌套列表项 2.2
    - 更深层的嵌套列表项
- 列表项 3

### 有序列表

1. 第一步
2. 第二步
3. 子步骤 2.1
4. 子步骤 2.2
5. 第三步

### 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 待办事项
  - [x] 子任务 1
  - [ ] 子任务 2

## 表格测试

| 姓名 | 年龄 |       职业 | 城市 |
| :--- | :--: | ---------: | ---- |
| 张三 |  28  |     工程师 | 北京 |
| 李四 |  32  |     设计师 | 上海 |
| 王五 |  25  |   产品经理 | 深圳 |
| 赵六 |  30  | 数据分析师 | 杭州 |

## 标题层级测试

# H1 一级标题

## H2 二级标题

### H3 三级标题

#### H4 四级标题

##### H5 五级标题

###### H6 六级标题

## 分隔线

---

## 脚注测试

这是一个带有脚注的句子[^1]。

这是另一个带有脚注的句子[^2]。

## 混合内容测试

### 列表中的复杂内容

1.  这是一个包含代码的列表项

    ```bash
    npm install
    npm run dev
    ```

2.  这是一个包含引用的列表项

    > 引用内容在列表项内部

3.  这是一个包含表格的列表项
    | 列1 | 列2 |
    |-----|-----|
    | 数据1 | 数据2 |
    | 数据3 | 数据4 |

### 引用中的复杂内容

> 引用中可以包含：
>
> - 列表项
> - **粗体**和*斜体*
> - `行内代码`
>
> ```css
> .example {
>   color: red;
> }
> ```

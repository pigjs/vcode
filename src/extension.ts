import * as vscode from "vscode";

async function chatCompletion(text: string) {
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "",
        },
        body: JSON.stringify({
          model: "",
          messages: [
            {
              role: "user",
              content: `你是一个代码命名建议助手，请根据中文名称：”${text}“，生成符合命名约定的小驼峰变量名，只要返回生成的变量名就行不需要其他额外的内容`,
            },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error("request error");
      }
      const data: any = await response.json();
      const content: string = data.choices?.[0]?.message?.content;
      if (!/[\u4e00-\u9fa5]/.test(content)) {
        return content;
      }
    } catch (err) {}
  }
  throw new Error("request error");
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("extension.chineseToVariable", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const selection = editor.selection;
    const text = editor.document.getText(selection)?.trim();
    if (!text) {
      vscode.window.showErrorMessage("内容不能为空");
      return;
    }
    if (text.length > 20) {
      vscode.window.showErrorMessage("最多只能处理20个字");
      return;
    }
    if (!/[\u4e00-\u9fa5]/.test(text)) {
      vscode.window.showErrorMessage("只能处理中文");
      return;
    }

    try {
      const variableName = await chatCompletion(text);
      if (variableName) {
        editor.edit((editBuilder) => {
          editBuilder.replace(selection, variableName);
        });
      }
    } catch (error) {
      vscode.window.showErrorMessage("处理失败，请重试！");
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

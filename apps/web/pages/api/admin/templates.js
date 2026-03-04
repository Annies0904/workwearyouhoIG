export default async function handler(req, res) {
  return res.status(200).json({
    templates: [
      { id: "welcome", title: "歡迎訊息", content: "嗨！謝謝你的留言～我可以怎麼幫你？" },
    ],
  });
}

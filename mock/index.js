const Mock = require("mockjs");
const user = require("./user");
const router = require('./router');

Mock.setup({
  timeout: "200-600",
});

const mockData = [...user, ...router];

mockData.forEach((item) => {
  Mock.mock(
    new RegExp(process.env.VUE_APP_BASE_API + item.url),
    item.type,
    item.response
  );
});

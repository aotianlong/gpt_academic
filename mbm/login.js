/*
 * import { sslogin } from 'mbm'
 * sslogin()
 */

function getToken() {
  if (/[^\w]token=([-_\.\w]+)/.test(window.location.href)) {
    const token = RegExp.$1;
    console.log("get token", token, window.location.href);
    return token;
  } else {
    return null;
  }
}

function sslogin(options = {}) {
  options.notice ||= () => {
    return new Promise((resolve, reject) => {
      const skipConfirm = true;
      if (
        skipConfirm ||
        window.confirm(
          "系统检测到您还未登录，点击确定前往登录，点击取消留在当前页面",
        )
      ) {
        resolve(true);
      } else {
        reject();
      }
    });
  };
  options.handleAccount ||= () => Promise.resolve();
  options.handleAccountError ||= (errors) => {
    console.log("errors");
  };
  const redirectUrl = encodeURIComponent(location.href);
  const url =
    "https://openai.mbmzone.com/singleLogin?redirectUrl=" + redirectUrl;
  const token = getToken();
  // 是否登录的判断留给外面
  if (!options.isLoggedIn?.()) {
    if (token) {
      getAccount(token)
        .then((account) => {
          options.handleAccount?.(account)?.then(() => {
            // 成功处理登录事件
          });
        })
        .catch((error) => {
          // 通过 token 登录失败, 可以弹出一个提示啥的
          options.handleAccountError(error);
        });
    } else {
      // 添加一个提示？
      options.notice?.()?.then(() => {
        location.href = url;
      });
    }
  } else {
    // 用户已经登录了
    console.log("user is logged in.");
    return;
  }
}

function getAccount(token) {
  const url = "https://openai.yingjin.pro/api/user/doGetInfo";
  return fetch(url, { headers: { Authorization: token }, method: "get" }).then(
    (response) => {
      console.log(response);
      return response.json().then((data) => {
        console.log("getAccount", data);
        if (data.code === 11000) {
          return Promise.resolve(data.data);
        } else {
          return Promise.reject(data);
        }
      });
    },
  );
}


// sslogin()

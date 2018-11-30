
## gulp静态资源压缩

## config.json 配置

```
#  // 打包路径
#  "path": "./dist",
#  // 需要压缩的css目录
#  "css": ["./css"],
#  // 需要压缩的js目录
#  "js": ["./js/", "./jsx"],
#  // 需要压缩的HTML目录
#  "html": ["./"],
#  // 需要压缩的image目录
#  "image": ["./image"],
#  // postcss兼容的浏览器
#  "cssBrowsers": ["last 10 versions", "last 3 Safari versions", "last 10 Explorer versions", "Firefox >= 15", "> 1%", "ie 8", "ie 7"],
#  // 静态直接复制的目录
#  "scp": ["./config"]
```

## Build Setup

``` bash
# npm install

# // 运行
npm run gulp
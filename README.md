# ng-img-map

基于angularJS，用来绘制 `图片热点(<map> <area>)` 的组件。

A plugin to draw `<map>` and `<area>` easily, based on angularJS.

[Live Demo](http://thunf.github.io/ng-img-map)

## Screenshot

![demo](/images/screenshot.png)

## Usage

### Download

下载本项目，在compile文件夹下可以找到编译后的文件

Download this project and get files compiled in `compile` floder

[download: ng-img-map-gh-pages.zip](https://github.com/Thunf/ng-img-map/archive/gh-pages.zip)

### Add files

添加JS和CSS文件引用到项目中，并确认 `ng-img-map.js` 文件位于 angular.js 之后。

Include script and stylesheet to your project, make sure the `ng-img-map.js` is inserted after the `angular.js` :

```html
<script src="angular.js"></script>
<script src="ng-img-map.js"></script>
<link rel="stylesheet" type="text/css" href="ng-img-map.css">
```

### Add a dependancy

在应用中把 `ng-img-map` 添加为依赖。

Add the `ng-img-map` as a dependancy to your application module:

```js
var myAppModule = angular.module('MyApp', ['ngImgMap']);
```

### Configure

<div ng-img-map ng-img-map-fns="mapFns" ng-model="img"></div>

1、在HTML文件中，添加 `<ng-img-map>` 或具有 `ng-img-map` 属性的标签。

- Add the directive which looks like `<ng-img-map>` or `<x ng-img-map></x>` to HTML file.

2、给该标签绑定图像数据（ng-model="imgdata"），指令将自动获取图像数据（[数据格式](#数据格式)），并监测数据是否更新。

- Bind the directive to image data (using `ng-model="imgdata"`), The directive will get the image data from that ng-model and watch for updates.

3、给该标签绑定预设方法（ng-img-map-fns="mapFns"），指令将使用方法集中对应的方法获取参数（[方法集格式](#方法集格式)）。每次监测到数据更改都会调用方法集初始生成器。

- Bind the directive to image functions (using `ng-img-map-fns="mapFns"`), The directive will get the image functions from that ng-img-map-fns and run it automatically.

4、根据个人需求，给数据加入自定义字段

- According to individual needs, to add custom fields to the data

5、玩吧~

- You get it ~

## Attribution

```html
<ng-img-map ng-model="{object}" ng-img-map-fns="{object}" />
```

### Data format

```js
{
    "pic_url": "images/demo-400x300.png",
    "maps": [
        {"coords":[32,19,202,296]},
        {"coords":[21,19,376,300]}
    ]
}
```
- pic_url：string，原始图片地址
    - ( Original picture address )
- maps：array，相对原始图片像素大小的锚点坐标[x1, y1, x2, y2]，参考`<area>`标签的coords属性
    - ( Refer to the coords attribute of the `<area>` tag )

### Function format

```js
{
    getCanSize: function() {
        return [950, 1000];
    },
    getImgSize: function(img) {
        return _getImgSize(img.pic_url) || [950, 500];
    }
}
```
- getCanSize：function，return可视画布尺寸[width, height]
    - (the canvas (for painting) size)
- getImgSize：function，return图片原始尺寸[width, height]
    - (the original image size)


### Calculation

针对每张图片，都会在img数据里挂载一个获取对应生成器的方法（getCalculation），用来获取生成器：

For each picture, it will generator an exclusive function which can get this calculation to this image data. You can use it to get this calculation like this:

```js
	var calculation = img.getCalculation();
```

:exclamation: 在添加新区域时，需调用 calculation.checkCoords() 来修正坐标位，以确保坐标位于可视画布区域内，否则将导致热点无法正确移动。 

- When adding a new data, you'd better to use `calculation.checkCoords` to correcte coords data. To make sure that the coords are located within the visible canvas area, otherwise it will cause the area to move in an unexpected way.


## Attention

- 务必引入 `ng-img-map.css` 或做适当修改，以获得良好的体验；
    - (include `ng-img-map.css` or make appropriate changes to achieve a good experience)
- 务必确保获取真实图片的尺寸，否则会算出不可预料的坐标；
    - (Be sure to get the size of the real picture, or you can work out the unexpected)


## Demo

See the [index.html](https://github.com/thunf/ng-img-map/blob/gh-pages/index.html)


## License

See the [LICENSE](https://github.com/thunf/ng-img-map/blob/gh-pages/LICENSE) file.

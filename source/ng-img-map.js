(function(angular){
    'use strict';

    angular.module('ngImgMap', [])

    .factory('ngImgMapCurArea', ['$document', function($document) {

        // 全局唯一的"当前编辑区域"
        var curArea = {
            area: undefined,
            mouse: [0, 0],
            action: undefined
        };

        // 翻折判断，更新坐标点
        function _updateCoords(coords) {
            var me = this;
            if (coords[0] > coords[2]) { _exchange(coords, 0, 2) };
            if (coords[1] > coords[3]) { _exchange(coords, 1, 3) };
        }

        // 交换选手
        function _exchange(item, a, b) {
            var tmp = item[a];
            item[a] = item[b];
            item[b] = tmp;
        }

        // 在任何地方鼠标抬起，都释放操作节点
        $document.find('body').on('mouseup', function releaseArea(e){
            // 会导致一些<a>.click的问题
            // e.stopPropagation();
            if (angular.isDefined(curArea.area)) {
                _updateCoords(curArea.area.coords);
                delete curArea.area.isDraging;
                curArea.area = undefined;
            }
        });

        return curArea;

    }])

    .factory('ngImgMapCalculation', ['$timeout',function($timeout){

        var calculation = function(img, can) {
            // 偏移量
            this.dx = 0;
            this.dy = 0;

            // 图片原始宽高
            this.imgw = img[0];
            this.imgh = img[1];
            this.img = [this.imgw, this.imgh];

            // 视觉画布宽，若画布窄于原图，则使用原图宽度
            this.canw = Math.min(img[0], can[0]);

            // 画布像素 相对于 实际像素 形变系数
            this.ratio = (img[0] && this.canw) ? (this.canw / img[0]) : 1;
        };

        // 实例初始化
        calculation.prototype.init = function (action, curArea, pos) {
            var me = this;

            // 计算偏移位
            me._getOffset(curArea, pos);

            // 未移动，返回
            if ((me.dx == 0) && (me.dy == 0)){return false;}

            // 快速指向
            me.curA = curArea;
            me.coords = me.curA.area.coords;

            // 更新坐标
            me.curA.mouse = pos;

            // 分配操作
            switch(action[0]){
                case 'move'  : me['_move'](); break;
                case 'resize': me['_resize'](action[1]); break;
            }

        };

        // 拖拽行为判定
        calculation.prototype.getDragAction = function(name){
            var handler = name.split(" "), 
                // 操作行为
                action = 'move',
                // 偏移矩阵
                offset = [0,0,0,0];

            angular.forEach(handler, function(item){
                switch(item){
                    // 如果是删除操作，就不进入拖拽流程
                    case 'bar-remove': { action = undefined; break;}
                    // 点线操作均为改变大小
                    case 'dragline': ;
                    case 'dragdot' : { action = 'resize'; break;}
                    // 判定偏移矩阵
                    default: {
                        var offsetKey = new RegExp('ord\-([nswe]+)').exec(item) || [];
                        if (offsetKey.length) {
                            var offsetArr = offsetKey[1].split('');
                            angular.forEach(offsetArr, function(key){
                                switch(key){
                                    case 'w': offset[0] = 1;break;
                                    case 'n': offset[1] = 1;break;
                                    case 'e': offset[2] = 1;break;
                                    case 's': offset[3] = 1;break;
                                }
                            });
                        };
                    }
                }
            });
            // 其他在本区域的点击均认为是移动操作
            return [action, offset];
        };

        // 修正坐标
        calculation.prototype.checkCoords = function(c){
            // 字符串转成数字
            c[0] = +c[0] || 0; c[1] = +c[1] || 0;
            c[2] = +c[2] || 0; c[3] = +c[3] || 0;
            var me = this,
                // 位移量
                dx = 0, dy = 0, 
                // 坐标，判断宽高后作位移矩阵用
                x1 = c[0], y1 = c[1],
                x2 = c[2], y2 = c[3];
            // 移位修正
            // 左|右 出界
            if (x1 < 0 ) {dx = -x1; x1 = x2 = 1; };
            if (x2 > me.imgw ) {dx = me.imgw - x2; x1 = x2 = 1; };
            // 上|下 出界
            if (y1 < 0 ) {dy = -y1; y1 = y2 = 1; };
            if (y2 > me.imgh ) {dy = me.imgh - y2; y1 = y2 = 1; };
            // 若存在位移许可
            if (x1 || y1) {
                c[0] += x1 * dx; c[1] += y1 * dy;
                c[2] += x2 * dx; c[3] += y2 * dy;
            };
                
            // 如果宽高大于画布宽高
            if (Math.abs(c[0] - c[2]) > me.imgw || Math.abs(c[1] - c[3]) > me.imgh) {
                // 裁剪修正
                for (var i = 0, len = c.length; i < len; i++) {
                    c[i] = _limit(c[i], 0, me.img[i%2]);
                };
            }
            return c;
        };

        // 获取偏移量
        calculation.prototype._getOffset = function(curArea, pos){
            var me = this;
            me.dx = parseInt((pos[0] - curArea.mouse[0]) / me.ratio),
            me.dy = parseInt((pos[1] - curArea.mouse[1]) / me.ratio);
        };

        // 移动
        calculation.prototype._move = function(){
            var me = this;
            me._checkEdge(me.coords, [
                me.coords[0] + me.dx,
                me.coords[1] + me.dy,
                me.coords[2] + me.dx,
                me.coords[3] + me.dy
            ], [1,1,1,1])
        };

        // 缩放
        calculation.prototype._resize = function(offset){
            var me = this;
            me._checkEdge(me.coords, [
                me.coords[0] + me.dx * offset[0],
                me.coords[1] + me.dy * offset[1],
                me.coords[2] + me.dx * offset[2],
                me.coords[3] + me.dy * offset[3]
            ], offset);
        };

        // 边缘限制，原coords，新coords，偏移矩阵
        calculation.prototype._checkEdge = function(coords_o, coords_n, offset){
            var me = this;
            // 边界判断，限制
            for (var i = 0, len = coords_n.length; i < len; i++) {
                if (coords_n[i] > me.img[i%2] || coords_n[i] < 0) { 
                    coords_n[i] = coords_o[i];
                    // 如果此时对边允许变化(move)，则禁止
                    var opposite = (i+2)%4;
                    if (offset[opposite]) {
                        coords_n[opposite] = coords_o[opposite];
                    };
                };
            };
            me.curA.area.coords = coords_n;
        };

        // 使 num 限制在[min, max]中
        function _limit(num, min, max){
            if (num > max) { return max};
            if (num < min) { return min};
            return num;
        };

        return calculation;

    }])

    .controller('ngImgMapCtrl', ['$scope', 'ngImgMapCalculation', 'ngImgMapCurArea', 
        function($scope, ngImgMapCalculation, ngImgMapCurArea){

        var curArea = ngImgMapCurArea,
            localArea = null, 
            fn, m, imgSize, canSize, 
            calculation, ratio;

        // 初始化
        function init(){
            fn = $scope.ngImgMapFns;
            m  = $scope.m = $scope.ngModel;

            if (angular.isUndefined(m)) {
                return console.warn("ngImgMap need correct ngModel, please check data & format!");
            };

            // ============= 这里需要加判断 =============
            if (fn && angular.isFunction(fn.getImgSize)) {
                imgSize = fn.getImgSize(m) || [1000, 100];
            } else {
                imgSize = [1000, 100];
                console.warn("ngImgMap need fn to get ImgSize, now use [1000, 100] !");
            }

            if (fn && angular.isFunction(fn.getCanSize)) {
                canSize = fn.getCanSize(m) || [1000, 100];
            } else {
                canSize = [1000, 100];
                console.warn("ngImgMap need fn to get CanSize, now use [1000, 100] !");
            }

            // 初始化新实例
            calculation = new ngImgMapCalculation(imgSize, canSize);
            ratio = calculation.ratio;

            // 使数据源可以获得操作实例
            m.getCalculation = function(){
                return calculation;
            };

            // 修正坐标
            if (angular.isDefined(m)) {
                angular.forEach(m.maps, function(area){
                    calculation.checkCoords(area.coords);
                })
            };

            // 获取wrapper区域style
            $scope.wrapperStyle = (function(){
                var can = calculation.img;
                return {
                    'width' : can[0] * ratio + 'px',
                    'height': can[1] * ratio + 'px',
                    'background-image': 'url(' + m.pic_url + ')'
                };
            })();
        }
        init();

        // 若图片改版，重新初始化
        $scope.$watch('m.pic_url', function(){
            if (calculation) {init();};
        });

        // 捕获操作节点
        $scope.catchArea = function(e, area){
            // fix拖拽时选中现象
            e.preventDefault();
            e.stopPropagation();
            if (angular.isDefined(area) && area.coords) {
                localArea = area;
                curArea.area = area;
                curArea.mouse = [e.pageX, e.pageY];
                curArea.action = calculation.getDragAction(e.target['className']);
                if (['move', 'resize'].indexOf(curArea.action[0]) > -1) {
                    curArea.area.isDraging = true;
                };
            };
        };

        // 追踪鼠标位置
        $scope.trackMouse = function(e){
            e.stopPropagation();
            if (localArea != curArea.area) {return;};
            var action = curArea.action;
            if (angular.isDefined(curArea.area) 
                && angular.isDefined(action[0]) 
                && curArea.area.coords) {
                calculation.init(action, curArea, [e.pageX, e.pageY]);
            };
        };

        // 删除节点
        $scope.removeArea = function(map, index){
            if (angular.isDefined(map[index])) {
                map.splice(index, 1);
            };
        };

        // 获取锚点区域style
        $scope.getAreaStyle = function(area){
            var coords = area.coords || [10,10,50,50];
            return {
                width : parseInt(Math.abs(coords[0] - coords[2]) * ratio) + 'px',
                height: parseInt(Math.abs(coords[1] - coords[3]) * ratio) + 'px',
                left  : parseInt(Math.min(coords[0], coords[2]) * ratio) + 'px',
                top   : parseInt(Math.min(coords[1], coords[3]) * ratio) + 'px'
            };
        };

        // 获取现区域尺寸
        $scope.getCurSize = function(c){
            var w = Math.abs(c[2] - c[0]),
                h = Math.abs(c[3] - c[1]);
            return [w,h].join(' * ');
        }

    }])

    .directive('ngImgMap', ['$timeout', function($timeout){
        return {
            restrict: 'EA',
            scope: {
                ngImgMapFns: "=ngImgMapFns",
                ngModel: "=ngModel"
            },
            templateUrl: 'ngImgMap.html',
            controller: 'ngImgMapCtrl'
        };
    }])

    .run(['$templateCache',function($templateCache){
        var template =   '<div class="img-map-wrapper" ng-mousemove="trackMouse($event)" ng-style="wrapperStyle">'
                        +'    <div ng-repeat="area in m.maps" class="map-area" ng-mousedown="catchArea($event, area)" ng-class="{draging: area.isDraging}" ng-style="getAreaStyle(area)">'
                        +'        <div class="dragbar">'
                        +'            <div class="bar-title">{{$index+1}}</div>'
                        +'            <div class="bar-remove" ng-click="removeArea(m.maps, $index)">&times;</div>'
                        +'            <div class="bar-size">{{getCurSize(area.coords)}}</div>'
                        +'            <div class="bar-coords">{{area.coords}}</div>'
                        +'        </div>'
                        +'        <div class="ord-n dragline"></div>'
                        +'        <div class="ord-e dragline"></div>'
                        +'        <div class="ord-s dragline"></div>'
                        +'        <div class="ord-w dragline"></div>'
                        +'        <div class="ord-n dragdot"></div>'
                        +'        <div class="ord-e dragdot"></div>'
                        +'        <div class="ord-s dragdot"></div>'
                        +'        <div class="ord-w dragdot"></div>'
                        +'        <div class="ord-nw dragdot"></div>'
                        +'        <div class="ord-ne dragdot"></div>'
                        +'        <div class="ord-sw dragdot"></div>'
                        +'        <div class="ord-se dragdot"></div>'
                        +'    </div>'
                        +'</div>';
        $templateCache.put('ngImgMap.html', template);
    }]);

})(angular);

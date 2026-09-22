'use strict';
/*!
 * Pacman - HTML5 Game
 * https://passer-by.com/pacman/
 *
 * Copyright (c) 2016-present, HaoLe Zheng
 * Released under the MIT License.
 * https://github.com/mumuy/pacman/blob/master/LICENSE
*/

/*
* Motor de videojuegos a pequeña escala
*/

// requestAnimationFrame polyfill
if (!Date.now)
Date.now = function() { return new Date().getTime(); };
(function() {
    'use strict';
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
            nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

function Game(id,params){
    var _ = this;
    var settings = {
        width:960,						// Ancho del lienzo
        height:640,						// Alto del lienzo
        viewportY:0,					//PSG: desplazamiento Y del viewport (scroll vertical)
        mapHeight:0					//PSG: altura total del mapa combinado (para wrap-around)
    };
    Object.assign(_,settings,params);
    var $canvas = document.getElementById(id);
    $canvas.width = _.width;
    $canvas.height = _.height;
    var _context = $canvas.getContext('2d');	//Contexto de Canvas
    var _stages = [];							//Cola de objetos de la escena
    var _events = {};							//Recopilación de eventos
    var _index=0,								//Índice de la escena actual
        _hander;  								//Control de animación de fotogramas
    //活动对象构造
    var Item = function(params){
        this._params = params||{};
        this._id = 0;               //Identificador
        this._stage = null;         //Vinculado a la escena asociada
        this._settings = {
            x:0,					// Coordenada de posición: Eje X
            y:0,					// Coordenada de posición: Eje Y
            width:20,				// Anchura
            height:20,				// Altura
            type:0,					// Tipo de objeto: 0 = objeto estándar (no vinculado al mapa), 1 = objeto controlado por el jugador, 2 = objeto controlado por el programa
            color:'#F00',			// Color del indicador
            status:1,				// Estado del objeto: 0 = inactivo/finalizado, 1 = normal, 2 = en pausa, 3 = temporal, 4 = anómalo
            orientation:0,			// Orientación actual: 0 = derecha, 1 = abajo, 2 = izquierda, 3 = arriba
            speed:0,				// Velocidad de movimiento
            //地图相关
            location:null,			//Mapa de destino (objeto de mapa)
            coord:null,				//Si está vinculado a un mapa, establecer coordenadas del mapa; de lo contrario, establecer coordenadas de posición
            path:[],				//Ruta para el movimiento automático del NPC
            vector:null,			//Coordenadas de destino
            //布局相关
            frames:1,				//Nivel de velocidad (determina la frecuencia de actualización del contador interno; es decir, cada N fotogramas)
            times:0,				//Contador de actualización del lienzo (utilizado para determinar el estado de animaciones en bucle)
            timeout:0,				//Temporizador de cuenta atrás (utilizado para determinar el estado de animaciones de proceso)
            control:{},				//Búfer de control (procesado al alcanzar el punto de destino)
            update:function(){}, 	//Información de parámetros de actualización
            draw:function(){}		//Dibujar/Renderizar
        };
        Object.assign(this,this._settings,this._params);
    };
    Item.prototype.bind = function(eventType,callback){
        if(!_events[eventType]){
            _events[eventType] = {};
            $canvas.addEventListener(eventType,function(e){
                var position = _.getPosition(e);
                _stages[_index].items.forEach(function(item){
                    if(item.x<=position.x&&position.x<=item.x+item.width&&item.y<=position.y&&position.y<=item.y+item.height){
                        var key = 's'+_index+'i'+item._id;
                        if(_events[eventType][key]){
                            _events[eventType][key](e);
                        }
                    }
                });
                e.preventDefault();
            });
        }
        _events[eventType]['s'+this._stage.index+'i'+this._id] = callback.bind(this);  //绑定作用域
    };
    //地图对象构造器
    var Map = function(params){
        this._params = params||{};
        this._id = 0;               //标志符
        this._stage = null;         //与所属布景绑定
        this._settings = {
            x:0,					//地图起点坐标
            y:0,
            size:20,				//地图单元的宽度
            data:[],				//地图数据
            x_length:0,				//二维数组x轴长度
            y_length:0,				//二维数组y轴长度
            frames:1,				//速度等级,内部计算器times多少帧变化一次
            times:0,				//刷新画布计数(用于循环动画状态判断)
            cache:false,    		//是否静态（如静态则设置缓存）
            update:function(){},	//更新地图数据
            draw:function(){},		//绘制地图
        };
        Object.assign(this,this._settings,this._params);
    };
    //获取地图上某点的值
    Map.prototype.get = function(x,y){
        if(this.data[y]&&typeof this.data[y][x]!='undefined'){
            return this.data[y][x];
        }
        return -1;
    };
    //设置地图上某点的值
    Map.prototype.set = function(x,y,value){
        if(this.data[y]){
            this.data[y][x] = value;
        }
    };
    //地图坐标转画布坐标
    Map.prototype.coord2position = function(cx,cy){
        return {
            x:this.x+cx*this.size+this.size/2,
            y:this.y+cy*this.size+this.size/2
        };
    };
    //画布坐标转地图坐标
    Map.prototype.position2coord = function(x,y){
        var fx = Math.abs(x-this.x)%this.size-this.size/2;
        var fy = Math.abs(y-this.y)%this.size-this.size/2;
        return {
            x:Math.floor((x-this.x)/this.size),
            y:Math.floor((y-this.y)/this.size),
            offset:Math.sqrt(fx*fx+fy*fy)
        };
    };
    //寻址算法
    Map.prototype.finder = function(params){
        var defaults = {
            map:null,
            start:{},
            end:{},
            type:'path'
        };
        var options = Object.assign({},defaults,params);
        var y_length  = options.map.length;
        var x_length = options.map[0].length;
        // PSG: normalizar coordenadas fuera de rango (filas virtuales tras wrap circular)
        options.start = {
            x: ((Math.floor(options.start.x) % x_length) + x_length) % x_length,
            y: ((Math.floor(options.start.y) % y_length) + y_length) % y_length,
            change: options.start.change
        };
        options.end = {
            x: ((Math.floor(options.end.x) % x_length) + x_length) % x_length,
            y: ((Math.floor(options.end.y) % y_length) + y_length) % y_length,
            change: options.end.change
        };
        if(options.map[options.start.y][options.start.x]||options.map[options.end.y][options.end.x]){ //当起点或终点设置在墙上
            return [];
        }
        var finded = false;
        var result = [];
        var steps = Array(y_length).fill(0).map(()=>Array(x_length).fill(0));     //步骤的映射
        var _getValue = function(x,y){  //获取地图上的值
            if(options.map[y]&&typeof options.map[y][x]!='undefined'){
                return options.map[y][x];
            }
            return -1;
        };
        var _next = function(to){ //判定是否可走,可走放入列表
            var value = _getValue(to.x,to.y);
            if(value<1){
                if(value==-1){
                    to.x = (to.x+x_length)%x_length;
                    to.y = (to.y+y_length)%y_length;
                    to.change = 1;
                }
                if(!steps[to.y][to.x]){
                    result.push(to);
                }
            }
        };
        var _render = function(list){//找线路
            var new_list = [];
            var next = function(from,to){
                var value = _getValue(to.x,to.y);
                if(value<1){	//当前点是否可以走
                    if(value==-1){
                        to.x = (to.x+x_length)%x_length;
                        to.y = (to.y+y_length)%y_length;
                        to.change = 1;
                    }
                    if(to.x==options.end.x&&to.y==options.end.y){
                        steps[to.y][to.x] = from;
                        finded = true;
                    }else if(!steps[to.y][to.x]){
                        steps[to.y][to.x] = from;
                        new_list.push(to);
                    }
                }
            };
            list.forEach(function(current){
				next(current,{y:current.y+1,x:current.x});
                next(current,{y:current.y,x:current.x+1});
                next(current,{y:current.y-1,x:current.x});
                next(current,{y:current.y,x:current.x-1});
            });
            if(!finded&&new_list.length){
                _render(new_list);
            }
        };
        _render([options.start]);
        if(finded){
            var current=options.end;
            if(options.type=='path'){
                while(current.x!=options.start.x||current.y!=options.start.y){
                    result.unshift(current);
                    current=steps[current.y][current.x];
                }
            }else if(options.type=='next'){
                _next({x:current.x+1,y:current.y});
                _next({x:current.x,y:current.y+1});
                _next({x:current.x-1,y:current.y});
                _next({x:current.x,y:current.y-1});
            }
        }
        return result;
    };
    //布景对象构造器
    var Stage = function(params){
        this._params = params||{};
        this._settings = {
            index:0,                        //布景索引
            status:0,						//布景状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时状态
            maps:[],						//地图队列
            audio:[],						//音频资源
            images:[],						//图片资源
            items:[],						//对象队列
            timeout:0,						//倒计时(用于过程动画状态判断)
            update:function(){}				//嗅探,处理布局下不同对象的相对关系
        };
        Object.assign(this,this._settings,this._params);
    };
    //添加对象
    Stage.prototype.createItem = function(options){
        var item = new Item(options);
        //动态属性
        if(item.location){
            Object.assign(item,item.location.coord2position(item.coord.x,item.coord.y));
        }
        //关系绑定
        item._stage = this;
        item._id = this.items.length;
        this.items.push(item);
        return item;
    };
    //重置物体位置
    Stage.prototype.resetItems = function(){
        this.status = 1;
        this.items.forEach(function(item,index){
            Object.assign(item,item._settings,item._params);
            if(item.location){
                Object.assign(item,item.location.coord2position(item.coord.x,item.coord.y));
            }
        });
    };
    //获取对象列表
    Stage.prototype.getItemsByType = function(type){
        return this.items.filter(function(item){
	    return item.type == type;
        });
    };
    //添加地图
    Stage.prototype.createMap = function(options){
        var map = new Map(options);
        //动态属性
        map.data = JSON.parse(JSON.stringify(map._params.data));
        map.y_length = map.data.length;
        map.x_length = map.data[0].length;
        map.imageData = null;
        //关系绑定
        map._stage = this;
        map._id = this.maps.length;
        this.maps.push(map);
        return map;
    };
    //重置地图
    Stage.prototype.resetMaps = function(){
        this.status = 1;
        this.maps.forEach(function(map){
            Object.assign(map,map._settings,map._params);
            map.data = JSON.parse(JSON.stringify(map._params.data));
            map.y_length = map.data.length;
            map.x_length = map.data[0].length;
            map.imageData = null;
        });
    };
    //重置
    Stage.prototype.reset = function(){
        Object.assign(this,this._settings,this._params);
        this.resetItems();
        this.resetMaps();
    };
    //绑定事件
    Stage.prototype.bind = function(eventType,callback){
        if(!_events[eventType]){
            _events[eventType] = {};
            window.addEventListener(eventType,function(e){
                var key = 's' + _index;
                if(_events[eventType][key]){
                    _events[eventType][key](e);
                }
                // Solo prevenir el comportamiento por defecto para las teclas del juego
                // (flechas: 37-40, espacio: 32, enter: 13)
                // Así no se bloquea F12, F5, Ctrl+Shift+I, etc.
                var gameKeys = [13, 32, 37, 38, 39, 40];
                if(gameKeys.indexOf(e.keyCode) !== -1){
                    e.preventDefault();
                }
            });
        }
        _events[eventType]['s'+this.index] = callback.bind(this);	//绑定事件作用域
    };
    //La animación comienza (fixed timestep)
    this.start = function() {
        var f = 0; // Contador de ticks (se incrementa por cada paso fijo)
        var STEP = 1000 / 60; // ms por tick de actualización (60 Hz lógico)
        var last = (new Date()).getTime();
        var accumulator = 0;
        var fn = function(){
            // Mantener requestAnimationFrame para renderizar a la tasa del dispositivo
            _hander = requestAnimationFrame(fn);
            var now = (new Date()).getTime();
            var delta = now - last;
            // Evitar acumulación gigante tras pausas largas (clamp)
            if (delta > 1000) delta = STEP;
            last = now;
            accumulator += delta;

            var stage = _stages[_index];

            // Ejecutar múltiples pasos de lógica si el dispositivo está atrasado,
            // o ninguno si está al día. Limitamos el número de pasos por frame
            // para evitar bucles infinitos en dispositivos extremadamente lentos.
            var maxSteps = 10;
            var steps = 0;
            while (accumulator >= STEP && steps < maxSteps) {
                // === PASO DE LÓGICA (fixed tick) ===
                f++;
                if(stage.timeout){
                    stage.timeout--;
                }
                // Actualizar todos los items (misma lógica que antes en PASADA 1)
                stage.items.forEach(function(item){
                    if(!(f%item.frames)){
                        item.times = f/item.frames;
                    }
                    if(stage.status==1&&item.status!=2){
                        if(item.location){
                            item.coord = item.location.position2coord(item.x,item.y);
                        }
                        if(item.timeout){
                            item.timeout--;
                        }
                        item.update();
                    }
                });
                accumulator -= STEP;
                steps++;
            }

            // Render (se hace siempre a la tasa del display).
            _context.clearRect(0,0,_.width,_.height);
            _context.fillStyle = '#000000';
            _context.fillRect(0,0,_.width,_.height);

            // Mantener la semántica original: permitir que stage.update decida si se dibuja.
            if(stage.update()!=false){
                // Snapshot de viewport DESPUES de los updates ya aplicados
                var _sharedMapH = _.mapHeight;
                var _sharedDispY = _sharedMapH > 0
                    ? (((_.viewportY) % _sharedMapH) + _sharedMapH) % _sharedMapH
                    : _.viewportY;

                // === PASADA 2: renderizar mapas con _sharedDispY ===
                stage.maps.forEach(function(map){
                    if(!(f%map.frames)){
                        map.times = f/map.frames;
                    }
                    if(map.cache){
                        if(!map.imageData){
                            _context.save();
                            map.draw(_context);
                            map.imageData = _context.getImageData(0,0,_.width,_.height);
                            _context.restore();
                        }else{
                            _context.putImageData(map.imageData,0,0);
                        }
                    }else{
                        map.update();
                        _context.save();
                        _context.translate(0,-_sharedDispY);
                        map.draw(_context);
                        // PSG: siempre dibujar copia inferior (wrap bottom→top)
                        if(_sharedMapH > 0 && _sharedDispY + _.height > _sharedMapH){
                            _context.save();
                            _context.translate(0,_sharedMapH);
                            map.draw(_context);
                            _context.restore();
                        }
                        // PSG: siempre dibujar copia superior (wrap top→bottom)
                        if(_sharedMapH > 0 && _sharedDispY < _.height){
                            _context.save();
                            _context.translate(0,-_sharedMapH);
                            map.draw(_context);
                            _context.restore();
                        }
                        _context.restore();
                    }
                });

                // === PASADA 3: renderizar items con el mismo _sharedDispY ===
                stage.items.forEach(function(item){
                    // PSG: aplicar viewport a items del mundo; los HUD usan noViewport:true
                    if(!item.noViewport){
                        _context.save();
                        _context.translate(0,-_sharedDispY);
                        item.draw(_context);
                        // PSG: wrap-around para items (bottom)
                        if(_sharedMapH > 0 && _sharedDispY + _.height > _sharedMapH){
                            _context.save();
                            _context.translate(0,_sharedMapH);
                            item.draw(_context);
                            _context.restore();
                        }
                        // PSG: wrap-around para items (top)
                        if(_sharedMapH > 0 && _sharedDispY < _.height){
                            _context.save();
                            _context.translate(0,-_sharedMapH);
                            item.draw(_context);
                            _context.restore();
                        }
                        _context.restore();
                    }else{
                        item.draw(_context);
                    }
                });
            }
        };
        _hander = requestAnimationFrame(fn);
    };
    //动画结束
    this.stop = function(){
        _hander&&cancelAnimationFrame(_hander);
    };
    //事件坐标
    this.getPosition = function(e){
        var box = $canvas.getBoundingClientRect();
        return {
            x:e.clientX-box.left*(_.width/box.width),
            y:e.clientY-box.top*(_.height/box.height)
        };
    }
    //创建布景
    this.createStage = function(options){
        var stage = new Stage(options);
        stage.index = _stages.length;
        _stages.push(stage);
        return stage;
    };
    //指定布景
    this.setStage = function(index){
        _stages[_index].status = 0;
        _index = index;
        _stages[_index].status = 1;
        _stages[_index].reset(); //重置

        // Si es el stage final (pantalla de Game Over), forzar que sus items se rendericen
        // sin verse afectados por la viewport (se muestran siempre en pantalla).
        try {
            if (_index === _stages.length - 1) {
                _stages[_index].items.forEach(function(it){
                    it.noViewport = true;
                });
            }
        } catch(e) { /* noop */ }

        return _stages[_index];
    };
    //下个布景
    this.nextStage = function(){
        if(_index<_stages.length-1){
            return this.setStage(++_index);
        }else{
            throw new Error('unfound new stage.');
        }
    };
    //获取布景列表
    this.getStages = function(){
        return _stages;
    };
    //初始化游戏引擎
    this.init = function(){
        _index = 0;
        this.start();
    };
}

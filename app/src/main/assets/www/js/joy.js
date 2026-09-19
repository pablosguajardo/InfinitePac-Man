
var FirstStart = 0;

var derAPRETADO = 0;
var izqAPRETADO = 0;
var subeAPRETADO = 0;
var subeAPRETADOMan = 0;
var CantDisp = 0;
var BigAlienApear = 0;
var levelAct = 1;
var SpeedGameExt = 0;
var aumentalive = 0;
var SpaceAliens = 64;
var SpaceAliens2 = 42;
var NoPuedeDisparar = 0;
var SoundOff = 0;
var MusicOff = 0;
var vibrateOff = 0;
var editJoyOff = 0;
var StepSound = 0;
var MaxShot = 2;
var CantShot = 0;

var leftMovp = 0;
var topMovp = 0;
var speedProj = 16;
var ActSpeedShip = 0;
var pauseOver = false;
var maxReward = 1;
var countReward = 0;
var resetAd = true;

var isFirstTime = false;


var OPTIONSG = {};
var OptionsArr = new Array();
var HEIGHT = 0;
var WIDTH = 0;
var padcontainer;

class JoystickController {
    // stickID: ID of HTML element (representing joystick) that will be dragged
    // maxDistance: maximum amount joystick can move in any direction
    // deadzone: joystick must move at least this amount from origin to register value change
    constructor(stickID, maxDistance, deadzone) {
        this.id = stickID;
        let stick = document.getElementById(stickID);

        // location from which drag begins, used to calculate offsets
        this.dragStart = null;

        // track touch identifier in case multiple joysticks present
        this.touchId = null;

        this.active = false;
        this.value = { x: 0, y: 0 };

        let self = this;

        function handleDown(event) {
            self.active = true;

            // all drag movements are instantaneous
            stick.style.transition = '0s';

            // touch event fired before mouse event; prevent redundant mouse event from firing
            event.preventDefault();

            if (event.changedTouches)
                self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            else
                self.dragStart = { x: event.clientX, y: event.clientY };

            // if this is a touch event, keep track of which one
            if (event.changedTouches)
                self.touchId = event.changedTouches[0].identifier;
        }

        function handleMove(event) {
            if (!self.active) return;

            // if this is a touch event, make sure it is the right one
            // also handle multiple simultaneous touchmove events
            let touchmoveId = null;
            if (event.changedTouches) {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    if (self.touchId == event.changedTouches[i].identifier) {
                        touchmoveId = i;
                        event.clientX = event.changedTouches[i].clientX;
                        event.clientY = event.changedTouches[i].clientY;
                    }
                }

                if (touchmoveId == null) return;
            }

            const xDiff = event.clientX - self.dragStart.x;
            const yDiff = event.clientY - self.dragStart.y;
            const angle = Math.atan2(yDiff, xDiff);
            const distance = Math.min(maxDistance, Math.hypot(xDiff, yDiff));
            const xPosition = distance * Math.cos(angle);
            const yPosition = distance * Math.sin(angle);

            // move stick image to new position
            stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

            // deadzone adjustment
            const distance2 = (distance < deadzone) ? 0 : maxDistance / (maxDistance - deadzone) * (distance - deadzone);
            const xPosition2 = distance2 * Math.cos(angle);
            const yPosition2 = distance2 * Math.sin(angle);
            const xPercent = parseFloat((xPosition2 / maxDistance).toFixed(4));
            const yPercent = parseFloat((yPosition2 / maxDistance).toFixed(4));

            self.value = { x: xPercent, y: yPercent };
        }

        function handleUp(event) {
            if (!self.active) return;

            // if this is a touch event, make sure it is the right one
            if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

            // transition the joystick position back to center
            stick.style.transition = '.2s';
            stick.style.transform = `translate3d(0px, 0px, 0px)`;

            // reset everything
            self.value = { x: 0, y: 0 };
            self.touchId = null;
            self.active = false;
        }

        stick.addEventListener('mousedown', handleDown);
        stick.addEventListener('touchstart', handleDown);
        document.addEventListener('mousemove', handleMove, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchend', handleUp);
    }
}


let joystick1 = new JoystickController("stick1", 64, 8);

function initJoy(notop) {
    WIDTH = GAME_W;
    HEIGHT = GAME_H;
    load_Option(notop);
    padcontainer = document.getElementById('padcontainer');
    console.log("3 left: " + OPTIONSG["leftMovp"] + "top: " + OPTIONSG["topMovp"]);
    padcontainer.style.left = OPTIONSG["leftMovp"] + 'px';
    padcontainer.style.top = OPTIONSG["topMovp"] + 'px';
    loop();
}
function loop() {
    requestAnimationFrame(loop);
    updateJoystick();
}

function updateJoystick() {
    //document.getElementById("status1").innerText = "Joystick 1: " + JSON.stringify(joystick1.value);
    //console.log(joystick1.value.x);


    ActSpeedShip = joystick1.value.x;
    if (joystick1.value.x > 0.1) {
        derAPRETADO = 1;
        izqAPRETADO = 0;
        leftDown = false;
        rightDown = true;
        //if(vibrateOff==0){navigator.vibrate(80);}

    } else if (joystick1.value.x < -0.1) {
        izqAPRETADO = 1;
        derAPRETADO = 0;
        leftDown = true;
        rightDown = false;

        //if(vibrateOff==0){navigator.vibrate(80);}
    } else {
        derAPRETADO = 0;
        izqAPRETADO = 0;
        leftDown = false;
        rightDown = false;
    }
    if (FirstStart == 0 && editJoyOff == 0) {

        //console.log('x: ' + joystick1.value.x + ' y: ' + joystick1.value.y);
        let mov1 = 0;
        //update pos off padcontainer:
        //WIDTH
        if (joystick1.value.x > 0.2) {
            mov1 = joystick1.value.x;
            leftMovp = padcontainer.getBoundingClientRect().left;
            //$('#padcontainer').position().left;
            console.log("leftMovp: " + leftMovp);
            if (leftMovp < (WIDTH - 256)) {
                leftMovp = leftMovp + mov1;
                //$('#padcontainer').css("left", leftMovp);
                padcontainer.style.left = leftMovp + 'px';
                save_Option("leftMovp", leftMovp);
                save_Option("topMovp", topMovp);
                save_Options();
            }
        } else if (joystick1.value.x < -0.2) {
            mov1 = joystick1.value.x;
            leftMovp = document.getElementById('padcontainer').getBoundingClientRect().left;
            //$('#padcontainer').position().left;
            if (leftMovp > 0) {
                leftMovp = leftMovp + mov1;
                //$('#padcontainer').css("left", leftMovp);
                padcontainer.style.left = leftMovp + 'px';
                save_Option("leftMovp", leftMovp);
                save_Option("topMovp", topMovp);
                save_Options();
            }
        }
        //HEIGHT
        if (joystick1.value.y > 0.2) {
            mov1 = joystick1.value.y;
            topMovp = document.getElementById('padcontainer').getBoundingClientRect().top;
            //$('#padcontainer').position().top;
            if (topMovp < (HEIGHT - 256)) {
                topMovp = topMovp + mov1;
                //$('#padcontainer').css("top", topMovp);
                padcontainer.style.top = topMovp + 'px';
                save_Option("leftMovp", leftMovp);
                save_Option("topMovp", topMovp);
                save_Options();
            }
        } else if (joystick1.value.y < -0.2) {
            mov1 = joystick1.value.y;
            topMovp = document.getElementById('padcontainer').getBoundingClientRect().top;
            //$('#padcontainer').position().top;
            if (topMovp > 0) {
                topMovp = topMovp + mov1;
                //$('#padcontainer').css("top", topMovp);
                padcontainer.style.top = topMovp + 'px';
                save_Option("leftMovp", leftMovp);
                save_Option("topMovp", topMovp);
                save_Options();
            }
        }
    }
}

function save_Option(Data, xValue) {
    //alert(Data);
    OPTIONSG[Data] = xValue;
}

function save_Options() {
    var tmpOp = [];
    for (var i in OPTIONSG) tmpOp.push(i + "|" + OPTIONSG[i]);
    //$.cookie('co_Options', tmpOp.join(","), { expires: 10000 });
    localStorage.setItem("co_Options", tmpOp.join(","));
}

function load_Option(notop) {
    var tmpOp = localStorage.getItem("co_Options");//$.cookie('co_Options');	
    if (tmpOp) {
        OPTIONSG = {};
        var hs = tmpOp.split(",");
        for (var i = 0; i < hs.length; ++i) {
            var chunksOPS = hs[i].split("|");
            OPTIONSG[chunksOPS[0]] = chunksOPS[1];
            OptionsArr[i] = [chunksOPS[0], chunksOPS[1]];

        }
        //alert(generate_highOptions());
    }
    console.log("1 left: " + OPTIONSG["leftMovp"] + "top: " + OPTIONSG["topMovp"]);
    // Valores por defecto si no existen en el storage
    if (OPTIONSG["leftMovp"] == null || OPTIONSG["leftMovp"] == undefined || isNaN(Number(OPTIONSG["leftMovp"]))) {
        OPTIONSG["leftMovp"] = 24;
        if (typeof isFirstTime !== "undefined") { isFirstTime = true; }
    }
    if (OPTIONSG["topMovp"] == null || OPTIONSG["topMovp"] == undefined || isNaN(Number(OPTIONSG["topMovp"]))) {
        console.log("notop:" + notop);
        if (notop == true) {
            OPTIONSG["topMovp"] = HEIGHT - (256 + 24);//256 ocupa el joypad + 24.
        } else {
            OPTIONSG["topMovp"] = 24;
        }
    }

    console.log("2 left: " + OPTIONSG["leftMovp"] + "top: " + OPTIONSG["topMovp"]);
}


// parseInt(localStorage.getItem('pacman_hi') || '0');

function runJoystickDemo() {
    // Mostrar el pad en posicion default
    //$('#padcontainer').show();
    // Deshabilitar boton Start durante el demo
    //$('#joyStart').prop('disabled', true).css('opacity', '0.4');
    const joyStart = document.getElementById('joyStart');
    joyStart.disabled = true;
    joyStart.style.opacity = '0.4';
    var stick = document.getElementById('stick1');
    var hand = document.getElementById('demoHand');

    // Mostrar mano en posicion central del stick
    /*$(hand).css({
        'display': 'block',
        'transform': 'translate3d(0px, 0px, 0px)'
    });*/
    hand.style.display = 'block';
    hand.style.transform = 'translate3d(0px, 0px, 0px)';

    // Activar modo edicion temporalmente para que update() mueva el padcontainer
    var editJoyOff_original = editJoyOff;
    editJoyOff = 0;

    var demoPhase = 0;   // 0=espera, 1=bajando, 2=pausa abajo, 21=subiendo, 3=fin
    var demoMaxPx = 40;  // px que baja/sube el padcontainer
    var demoMoved = 0;
    var demoStickPx = 0;   // posicion visual del stick (0=centro, +N=abajo, -N=arriba)
    var demoJoyVal = 0.35;// valor simulado (mismo que mov1 en update)

    // Pausa inicial antes de arrancar
    setTimeout(function () { demoPhase = 1; }, 500);

    // Loop a ~60fps que simula joystick1.value y anima el stick
    var demoInterval = setInterval(function () {

        if (demoPhase === 1) {
            // Bajando: simular joystick hacia abajo
            joystick1.value = { x: 0, y: demoJoyVal };
            demoMoved += demoJoyVal;
            demoStickPx = Math.min(demoStickPx + demoJoyVal * 40, 28);
            stick.style.transition = '0s';
            stick.style.transform = 'translate3d(0px, ' + demoStickPx + 'px, 0px)';
            //$(hand).css({ 'transition': '0s', 'transform': 'translate3d(0px, ' + demoStickPx + 'px, 0px)' });


            hand.style.transition = '0s';
            hand.style.transform = 'translate3d(0px, ' + demoStickPx + 'px, 0px)';


            if (demoMoved >= demoMaxPx) {
                demoPhase = 2;
                demoMoved = 0;
                joystick1.value = { x: 0, y: 0 };
                // Pausa breve en el punto mas bajo antes de subir
                setTimeout(function () { demoPhase = 21; }, 350);
            }
        } else if (demoPhase === 21) {
            // Subiendo
            joystick1.value = { x: 0, y: -demoJoyVal };
            demoMoved += demoJoyVal;
            demoStickPx = Math.max(demoStickPx - demoJoyVal * 40, -28);
            // Transicion suave al arrancar la subida (primer frame) y luego sin transicion
            var transTime = (demoMoved <= demoJoyVal) ? '220ms' : '1s';
            stick.style.transition = transTime;
            stick.style.transform = 'translate3d(0px, ' + demoStickPx + 'px, 0px)';
            //$(hand).css({ 'transition': transTime, 'transform': 'translate3d(0px, ' + demoStickPx + 'px, 0px)' });
            hand.style.transition = transTime;
            hand.style.transform = 'translate3d(0px, ' + demoStickPx + 'px, 0px)';
            if (demoMoved >= demoMaxPx) {
                demoPhase = 3;
                joystick1.value = { x: 0, y: 0 };
                stick.style.transition = '.3s';
                stick.style.transform = 'translate3d(0px, 0px, 0px)';
                //$(hand).css({ 'transition': '.3s', 'transform': 'translate3d(0px, 0px, 0px)' });
                hand.style.transition = '.3s';
                hand.style.transform = 'translate3d(0px, 0px, 0px)';
            }
        } else if (demoPhase === 3) {
            clearInterval(demoInterval);
            //$(hand).fadeOut(300);
            // 1. Aplicamos la clase CSS que reduce la opacidad a 0 en 300ms
            hand.classList.add('fade-out-element');

            // 2. Ocultamos el elemento (display: none) justo cuando termine la animación
            setTimeout(() => {
                hand.style.display = 'none';
            }, 300);
            // Restaurar editJoyOff original y ocultar pad si corresponde
            editJoyOff = editJoyOff_original;
            viewOptions();
            // Guardar posicion actual del padcontainer

            leftMovp = Math.round(document.getElementById('padcontainer').getBoundingClientRect().left);
            topMovp = Math.round(document.getElementById('padcontainer').getBoundingClientRect().top);
            save_Option("leftMovp", leftMovp);
            save_Option("topMovp", topMovp);
            save_Options();
            console.log("Demo fin - guardado left:", leftMovp, "top:", topMovp);
            //$('#joyStart').prop('disabled', false).css('opacity', '1');
            const joyStart = document.getElementById('joyStart');
            joyStart.disabled = false;
            joyStart.style.opacity = '1';
        }

    }, 16); // ~60fps
}





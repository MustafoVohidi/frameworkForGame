//#region "Localisation"
var TEXT_PRELOADER_CONTINUE = "BAŞLA";
var TEXT_ARE_SURE = "SƏN ƏMİNSƏN?";
var TEXT_GAMEOVER = "TƏBRİK EDİRİK! BU MATÇDA QƏLBƏNDƏN!";
var TEXT_NO_MOVES_AVAILABLE = "HƏRƏKƏT YOX, NÖVBƏTİ OYUNCU OYNAYACAQ";
var TEXT_WAIT_FOR_PLAYER = "RƏQIBI GÖZLƏYİN";

//#endregion
//#region "Settings"
var CANVAS_WIDTH = 1360;
var CANVAS_HEIGHT = 840;

var EDGEBOARD_X = 120;
var EDGEBOARD_Y = 122;

var PRIMARY_FONT = "flashrogersstraight";

var FPS           = 30;
var FPS_TIME      = 1000/FPS;
var DISABLE_SOUND_MOBILE = false;

var STATE_LOADING = 0;
var STATE_MENU    = 1;
var STATE_HELP    = 1;
var STATE_GAME    = 3;
var STATE_LEVEL_SELECTION = 4;

var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_DRAG_START  = 4;
var ON_DRAG_END    = 5;

//#endregion

//#region "Variables"

var s_bMobile;
var s_bAudioActive = true;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_iLastLevel = 1;
var s_bFullscreen = false;
var s_bStorageAvailable = true;
var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oCanvas;
var s_aSounds;
var s_aSoundsInfo;
var s_oMenu = null;

var s_oInterface = null;

var _WaitForPlayer;
//#endregion

//#region "Preloader"
function CPreloader() {
    var _iMaskWidth;
    var _iMaskHeight;
    var _oLoadingText;
    var _oProgressBar;
    var _oMaskPreloader;
    var _oFade;
    var _oIcon;
    var _oIconMask;
    var _oContainer;
    this._init = function(){
        s_oSpriteLibrary.init(this._onImagesLoaded,this._onAllImagesLoaded,this);
        s_oSpriteLibrary.addSprite("progress_bar",dirs.sprite_lib+"progress_bar.png");
        s_oSpriteLibrary.addSprite("200x200",dirs.sprite_lib+"200x200.jpg");
        s_oSpriteLibrary.loadSprites();

        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);
    };
    this.unload = function(){
        _oContainer.removeAllChildren();
    };

    this._onImagesLoaded = function(){

    };

    this._onAllImagesLoaded = function(){
        this.attachSprites();

        s_oMain.preloaderReady();
    };

    this.attachSprites = function(){
        var oBg = new createjs.Shape();
        oBg.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainer.addChild(oBg);

        var oSprite = s_oSpriteLibrary.getSprite('200x200');
        _oIcon = createBitmap(oSprite);
        _oIcon.regX = oSprite.width * 0.5;
        _oIcon.regY = oSprite.height * 0.5;
        _oIcon.x = CANVAS_WIDTH/2;
        _oIcon.y = CANVAS_HEIGHT/2 - 180;
        _oContainer.addChild(_oIcon);
     
        _oIconMask = new createjs.Shape();
        _oIconMask.graphics.beginFill("rgba(0,0,0,0.01)").drawRoundRect(_oIcon.x - 100, _oIcon.y - 100, 200, 200, 10);
        _oContainer.addChild(_oIconMask);

        _oIcon.mask = _oIconMask;

        var oSprite = s_oSpriteLibrary.getSprite('progress_bar');
        _oProgressBar = createBitmap(oSprite);
        _oProgressBar.x = CANVAS_WIDTH/2 - (oSprite.width / 2);
        _oProgressBar.y = CANVAS_HEIGHT/2 + 50;
        _oContainer.addChild(_oProgressBar);

        _iMaskWidth = oSprite.width;
        _iMaskHeight = oSprite.height;
        _oMaskPreloader = new createjs.Shape();
        _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBar.x, _oProgressBar.y, 1, _iMaskHeight);

        _oContainer.addChild(_oMaskPreloader);

        _oProgressBar.mask = _oMaskPreloader;

        _oLoadingText = new createjs.Text("", "30px " + PRIMARY_FONT, "#fff");
        _oLoadingText.x = CANVAS_WIDTH/2;
        _oLoadingText.y = CANVAS_HEIGHT/2 + 100;
        _oLoadingText.textBaseline = "alphabetic";
        _oLoadingText.textAlign = "center";
        _oContainer.addChild(_oLoadingText);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oContainer.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha: 0}, 500).call(function () {            
            createjs.Tween.removeTweens(_oFade);
            _oContainer.removeChild(_oFade);
        });        
    };

    this.refreshLoader = function (iPerc) {
        _oLoadingText.text = iPerc + "%";
        
        if (iPerc === 100) {
            s_oMain._onRemovePreloader();
            _oLoadingText.visible = false;
            _oProgressBar.visible = false;
        };     

        _oMaskPreloader.graphics.clear();
        var iNewMaskWidth = Math.floor((iPerc * _iMaskWidth) / 100);
        _oMaskPreloader.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oProgressBar.x, _oProgressBar.y, iNewMaskWidth, _iMaskHeight);
    };

    this._init();
}
//#endregion

//#region "Main"
function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;

    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;
    var _goButplay;

    this.initContainer = function(){
        s_oCanvas = document.getElementById('canvas');
        s_oStage = new createjs.Stage(s_oCanvas);
        s_oStage.preventSelection = true;
        createjs.Touch.enable(s_oStage,true);

        s_bMobile = isMobile();

        if(s_bMobile === false){
            s_oStage.enableMouseOver(FPS);
            // $('body').on('contextmenu', '#canvas', function(e){ return false; });
        }
        s_iPrevTime = new Date().getTime();

        createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;
        if(navigator.userAgent.match(/Windows Phone/i)){
            DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();
        _oPreloader = new CPreloader();	        
    };

    this.preloaderReady = function(){
        _bUpdate = true;
        
        s_oMain._loadImages();
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_oMain._initSounds();
        }
    };

    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
    };

    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);

        s_aSoundsInfo = new Array();

        s_aSoundsInfo.push({path: dirs.sounds_lib,filename:'press_button',loop:false,volume:1, ingamename: 'press_button'});
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;
        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
    };

    this.tryToLoadSound = function(oSoundInfo,bDelay){
        setTimeout(function(){        
            let srcName = oSoundInfo.path + oSoundInfo.filename;
            srcName+=".mp3";
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                src: [srcName],
                autoplay: false,
                preload: true,
                loop: oSoundInfo.loop, 
                volume: oSoundInfo.volume,
                onload: s_oMain.soundLoaded,
                onloaderror: function(szId,szMsg){
                    for(var i=0; i < s_aSoundsInfo.length; i++){
                            if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                break;
                            }
                    }
                },
                onplayerror: function(szId) {
                    for(var i=0; i < s_aSoundsInfo.length; i++){
                        if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                            s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                            }

                            });
                            break;
                        }
                    }
                            
                } 
            });

            
        }, (bDelay ? 200 : 0) );
    };

    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );
        s_oSpriteLibrary.addSprite("msg_box",dirs.sprite_lib+"msg_box.png");
        s_oSpriteLibrary.addSprite("alert_box",dirs.sprite_lib+"alert_box.png");
        s_oSpriteLibrary.addSprite("bg_menu",dirs.sprite_lib+"bg_menu.jpg");
        s_oSpriteLibrary.addSprite("but_play",dirs.sprite_lib+"but_play.png");
        s_oSpriteLibrary.addSprite("audio_icon",dirs.sprite_lib+"audio_icon.png");
        s_oSpriteLibrary.addSprite("but_fullscreen",dirs.sprite_lib+"but_fullscreen.png");
        s_oSpriteLibrary.addSprite("bg_game",dirs.sprite_lib+"bg_game.jpg");

        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };

    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        _oPreloader.refreshLoader(iPerc);
    };

    this._onAllImagesLoaded = function(){
        console.log("LOADED");
    };

    this._onRemovePreloader= function(){
        _oPreloader.unload();        
        this.gotoMenu();
    };

    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };

    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    };

    this.gotoGame = function(params = false){
        _oGame = new CGame(_oData,params);
        _iState = STATE_GAME;
    };

    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $('#block_game').css('display','block');

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }

    };
    
    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $('#block_game').css('display','none');
                
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
    };

    this.canPlay = function(b){
        _goButplay.setVisible(b);
        if(!b){
            _WaitForPlayer.refreshText(TEXT_WAIT_FOR_PLAYER);
        } else {
            _WaitForPlayer.refreshText(" ");
        }
        return true;
    };

    this._update = function(event){
        if(_bUpdate === false){
            return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;
        
        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }
                
        if(_iState === STATE_GAME){
            _oGame.update();
        }
        
        s_oStage.update(event);
    }
    s_oMain = this;
    
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    ENABLE_FULLSCREEN = oData.fullscreen;
    MULTIPLIER_SCORE = oData.multiplier_score;
    s_bAudioActive = oData.audio_enable_on_startup;


    _oData = oData;
    
    this.initContainer();
}
//#endregion

//#region Menu
function CMenu(){
    var _oBg;
    var _oFade;
    var _oAudioToggle;
    var _oCreditsBut;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _pStartPosCredits;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _oLogoMenu;
    var _pStartPosButPlay;
    
    this._init =function(){
        s_b2Players = false;
        _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
        s_oStage.addChild(_oBg);
        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _pStartPosButPlay = {x: CANVAS_WIDTH/2,y: CANVAS_HEIGHT -80};
        _goButPlay = new CGfxButton(_pStartPosButPlay.x,_pStartPosButPlay.y,oSprite,s_oStage);
        _goButPlay.pulseAnimation();
        _goButPlay.addEventListener(ON_MOUSE_DOWN, this._onButFriendlyRelease, this);
        _WaitForPlayer = new CTLText(s_oStage, 
            CANVAS_WIDTH/2-250, (CANVAS_HEIGHT/2)-188, 500, 104, 
            52, "center", "#000000", PRIMARY_FONT, 1,
            10, 0,
            TEXT_WAIT_FOR_PLAYER,
            true, true, true,
            false );
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width/4)-10, y: (oSprite.height/2) + 10};            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
        }
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x: oSprite.width/2 + 5,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreen,this);
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha:0}, 1000).call(function(){_oFade.visible = false;});  
        if(!s_bStorageAvailable){
            new CMsgBox(TEXT_ERR_LS,s_oStage);
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
    
    };
    this.unload = function(){
        _goButPlay.unload();
        _goButPlay = null;
        _oFade.visible = false;
        
                
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
                _oButFullscreen.unload();
        }
        _WaitForPlayer.refreshText("");
        // s_oStage.removeChild(_WaitForPlayer);
        
        s_oStage.removeChild(_oBg);
        _oBg = null;
        s_oMenu = null;
    };
    this.refreshButtonPos = function(iNewX,iNewY){
        _goButPlay.setPosition(CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
        // _oCreditsBut.setPosition(_pStartPosCredits.x + iNewX,iNewY + _pStartPosCredits.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(50,50);
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
                _oButFullscreen.setPosition(CANVAS_WIDTH - 50,50);
        }
    };
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    this.resetFullscreenBut = function(){
	    _oButFullscreen.setActive(s_bFullscreen);
    };

    this._onFullscreen = function(){
        if(s_bFullscreen) { 
		    _fCancelFullScreen.call(window.document);
        }else{
            _fRequestFullScreen.call(window.document.documentElement);
        }
        
        sizeHandler();
    };
    this._onButFriendlyRelease = function(){
        
        this.unload();
        $(s_oMain).trigger("start_session");
        s_b2Players = true;
        s_oMain.gotoGame();
        
    };
    s_oMenu = this;
    
    this._init();

}
//#endregion


//#region GAME
function CGame(oData,dx={}){
    var _bStartGame;
    var _oInterface;
    var _oParent;
    var _bPieceClicked;
    var _oAlertBox;
    var _isFirstMove;
    var _oThinking = null;

    this._init = function(){
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg);
        var oDataParams = {
            usersList: oData.usersList
        };
        _oInterface = new CInterface(oDataParams);
    };
    this.update = function () {
        if (_oThinking !== null) {
            _oThinking.update();
        }
    };
    this.unload = function(){
        _bStartGame = false;
        _oInterface.unload();
        if(_oEndPanel != null){
            _oEndPanel.unload();
        }
        createjs.Tween.removeTweens();
        s_oStage.removeAllChildren();
    }

    s_oGame = this;

    _oParent = this;

    this._init();
}
//#endregion

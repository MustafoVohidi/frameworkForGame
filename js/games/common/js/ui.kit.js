//#region CGfxButton
function CGfxButton(iXPos,iYPos,oSprite, oParentContainer){
    
    var _bDisabled;
    
    var _iScaleFactor;
    
    var _iListenerIDMouseDown;
    var _iListenerIDPressUp;
    var _iListenerIDMouseOver;
    
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oButton;
    var _oTween;
    var _oParent;
    var _bMuted;
    
    this._init =function(iXPos,iYPos,oSprite, oParentContainer){
        _bDisabled = false;
        _bMuted = false;
        _iScaleFactor = 1;
        
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oButton = createBitmap( oSprite);
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.scaleX =   _oButton.scaleY = _iScaleFactor;                         
        _oButton.regX = oSprite.width/2;
        _oButton.regY = oSprite.height/2;
       
        oParentContainer.addChild(_oButton);        
        
        this._initListener();
    };
    
    this.unload = function(){
        if(s_bMobile){
            _oButton.off("mousedown", _iListenerIDMouseDown);
            _oButton.off("pressup" , _iListenerIDPressUp);
        } else {
            _oButton.off("mousedown", _iListenerIDMouseDown);
            _oButton.off("mouseover", _iListenerIDMouseOver);
            _oButton.off("pressup" , _iListenerIDPressUp);
        }
        
       oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    this.hide = function(){
        _oButton.visible = false;
    };
    
    this.setClickable = function(bVal){
        _bDisabled = !bVal;
    };
    
    this._initListener = function(){
        if(s_bMobile){
            _iListenerIDMouseDown   = _oButton.on("mousedown", this.buttonDown);
            _iListenerIDPressUp     = _oButton.on("pressup" , this.buttonRelease);
        } else {
            _iListenerIDMouseDown   = _oButton.on("mousedown", this.buttonDown);
            _iListenerIDMouseOver   = _oButton.on("mouseover", this.buttonOver);
            _iListenerIDPressUp     = _oButton.on("pressup" , this.buttonRelease);
        }     
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.buttonRelease = function(){
        if(_bDisabled){
            return;
        }
        _oButton.scaleX = _iScaleFactor;
        _oButton.scaleY = _iScaleFactor;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP]);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisabled){
            return;
        }
        _oButton.scaleX = _iScaleFactor*0.9;
        _oButton.scaleY = _iScaleFactor*0.9;
        
        if (!_bMuted){
            playSound("press_button",1,false);
        }

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this.buttonOver = function(evt){
        if(!s_bMobile){
            if(_bDisabled){
                return;
            }
            evt.target.cursor = "pointer";
        }  
    };
    
    this.pulseAnimation = function () {
        _oTween = createjs.Tween.get(_oButton).to({scaleX: _iScaleFactor*0.9, scaleY: _iScaleFactor*0.9}, 850, createjs.Ease.quadOut).to({scaleX: _iScaleFactor, scaleY: _iScaleFactor}, 650, createjs.Ease.quadIn).call(function () {
            _oParent.pulseAnimation();
        });
    };

    this.trembleAnimation = function () {
        _oTween = createjs.Tween.get(_oButton).to({rotation: 5}, 75, createjs.Ease.quadOut).to({rotation: -5}, 140, createjs.Ease.quadIn).to({rotation: 0}, 75, createjs.Ease.quadIn).wait(750).call(function () {
            _oParent.trebleAnimation();
        });
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setX = function(iXPos){
         _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
         _oButton.y = iYPos;
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };

    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };
    
    this.setMuted = function(bVal){
        _bMuted = bVal;
    };

    _oParent = this;
    this._init(iXPos,iYPos,oSprite, oParentContainer);
    
    return this;
}
//#endregion
//#region CTLText
CTLText.prototype = {
    
    constructor : CTLText,
    
    __autofit : function(){
        if(this._bFitText){
            
            var iFontSize = this._iStartingFontSize;            

            while(
                    this._oText.getBounds().height > (this._iHeight -this._iPaddingV*2) ||
                    this._oText.getBounds().width > (this._iWidth-this._iPaddingH*2)                
                 ){
                iFontSize--;
                   
                this._oText.font = iFontSize+"px "+this._szFont;
                this._oText.lineHeight = Math.round(iFontSize*this._fLineHeightFactor);   
                
                this.__updateY();        
                this.__verticalAlign();                                
         
                if ( iFontSize < 8 ){
                    break;
                }
            };
            
            this._iFontSize = iFontSize;

        }        
    },
    
    __verticalAlign : function(){
        if(this._bVerticalAlign){
            var iCurHeight = this._oText.getBounds().height;          
            this._oText.y -= (iCurHeight-this._iHeight)/2 + (this._iPaddingV);            
        }        
    },

    __updateY : function(){

        this._oText.y = this._y + this._iPaddingV;

        switch(this._oText.textBaseline){
            case "middle":{
                this._oText.y += (this._oText.lineHeight/2) +
                                 (this._iFontSize*this._fLineHeightFactor-this._iFontSize);                    
            }break;
        }
    },

    __createText : function(szMsg){
        
        if (this._bDebug){
            this._oDebugShape = new createjs.Shape();
            this._oDebugShape.graphics.beginFill("rgba(255,0,0,0.5)").drawRect(
                    this._x, this._y, this._iWidth, this._iHeight);
            this._oContainer.addChild(this._oDebugShape);
        }

        this._oText = new createjs.Text(szMsg, this._iFontSize+"px "+this._szFont, this._szColor);
        this._oText.textBaseline = "middle";
        this._oText.lineHeight = Math.round(this._iFontSize*this._fLineHeightFactor);
        this._oText.textAlign = this._szAlign;
        
        
        if ( this._bMultiline ){
            this._oText.lineWidth = this._iWidth - (this._iPaddingH*2);
        }else{
            this._oText.lineWidth = null;
        }
        
        switch(this._szAlign){
            case "center":{
                this._oText.x = this._x+(this._iWidth/2);
            }break;
            case "left":{
                this._oText.x = this._x+this._iPaddingH;
            }break;   
            case "right":{
                this._oText.x = this._x+this._iWidth-this._iPaddingH;
            }break;       
        }

        this._oContainer.addChild(this._oText);  
        
        this.refreshText(szMsg);

    },    
    
    setVerticalAlign : function( bVerticalAlign ){
        this._bVerticalAlign = bVerticalAlign;
    },
    
    setX : function(iX){
        this._x = iX;
        this._oText.x = iX;
    },
    
    setY : function(iY){
        this._y = iY;
        this._oText.y = iY;
    },
    
    setOutline : function(iSize){
        if ( this._oText !== null ){
            this._oText.outline = iSize;
        }
    },
    
    setShadow : function(szColor,iOffsetX,iOffsetY,iBlur){
        if ( this._oText !== null ){
            this._oText.shadow = new createjs.Shadow(szColor, iOffsetX,iOffsetY,iBlur);
        }
    },
    
    setColor : function(szColor){
        this._oText.color = szColor;
    },
    
    setAlpha : function(iAlpha){
        this._oText.alpha = iAlpha;
    },
    
    removeTweens : function(){
        createjs.Tween.removeTweens(this._oText);
    },
    
    getText : function(){
        return this._oText;
    },
    
    getY : function(){
        return this._y;
    },
    
    getFontSize : function(){
        return this._iFontSize;
    },
    
    getBounds : function(){
      return this._oText.getBounds();  
    },
    refreshText : function(szMsg){    
        if(szMsg === ""){
            szMsg = " ";
        }
        if ( this._oText === null ){
            this.__createText(szMsg);
        }
        
        this._oText.text = szMsg;

        this._oText.font = this._iStartingFontSize+"px "+this._szFont;
        this._oText.lineHeight = Math.round(this._iStartingFontSize*this._fLineHeightFactor);   
        
        this.__autofit();
        this.__updateY();        
        this.__verticalAlign();
    }
}; 

function CTLText( oContainer, 
                    x, y, iWidth, iHeight, 
                    iFontSize, szAlign, szColor, szFont,iLineHeightFactor,
                    iPaddingH, iPaddingV,
                    szMsg,
                    bFitText, bVerticalAlign, bMultiline,
                    bDebug ){

    this._oContainer = oContainer;

    this._x = x;
    this._y = y;
    this._iWidth  = iWidth;
    this._iHeight = iHeight;
    
    this._bMultiline = bMultiline;
    this._iStartingFontSize = iFontSize;
    this._iFontSize = iFontSize;
    this._szAlign   = szAlign;
    this._szColor   = szColor;
    this._szFont    = szFont;

    this._iPaddingH = iPaddingH;
    this._iPaddingV = iPaddingV;

    this._bVerticalAlign = bVerticalAlign;
    this._bFitText       = bFitText;
    this._bDebug         = bDebug;

    // RESERVED
    this._oDebugShape = null; 
    this._fLineHeightFactor = iLineHeightFactor;
    
    this._oText = null;
    if ( szMsg ){
        this.__createText(szMsg);
        
    }
}
//#endregion
//#region CToggle
function CToggle(iXPos,iYPos,oSprite,bActive, oParentContainer){
    var _bActive;
    
    var _iListenerIDMouseDown;
    var _iListenerIDPressUp;
    var _iListenerIDMouseOver;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _oButton;
    
    this._init = function(iXPos,iYPos,oSprite,bActive, oParentContainer){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        var oData = {   
                        images: [oSprite], 
                        // width, height & registration point of each sprite
                        frames: {width: oSprite.width/2, height: oSprite.height, regX: (oSprite.width/2)/2, regY: oSprite.height/2}, 
                        animations: {state_true:[0],state_false:[1]}
                   };
                   
         var oSpriteSheet = new createjs.SpriteSheet(oData);
         
         _bActive = bActive;
		_oButton = createSprite(oSpriteSheet, "state_"+_bActive,(oSprite.width/2)/2,oSprite.height/2,oSprite.width/2,oSprite.height);
         
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.stop();
        
        oParentContainer.addChild(_oButton);
        
        this._initListener();
    };
    
    this.unload = function(){
        if(s_bMobile){
            _oButton.off("mousedown", _iListenerIDMouseDown);
            _oButton.off("pressup" , _iListenerIDPressUp);
        } else {
            _oButton.off("mousedown", _iListenerIDMouseDown);
            _oButton.off("mouseover", _iListenerIDMouseOver);
            _oButton.off("pressup" , _iListenerIDPressUp);
        }
        
       oParentContainer.removeChild(_oButton);
    };
    
    this._initListener = function(){
        if(s_bMobile){
            _iListenerIDMouseDown   = _oButton.on("mousedown", this.buttonDown);
            _iListenerIDPressUp     = _oButton.on("pressup" , this.buttonRelease);
        } else {
            _iListenerIDMouseDown   = _oButton.on("mousedown", this.buttonDown);
            _iListenerIDMouseOver   = _oButton.on("mouseover", this.buttonOver);
            _iListenerIDPressUp     = _oButton.on("pressup" , this.buttonRelease);
        }     
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.setActive = function(bActive){
        _bActive = bActive;
        _oButton.gotoAndStop("state_"+_bActive);
    };
    
    this.buttonRelease = function(){
        _oButton.scaleX = 1;
        _oButton.scaleY = 1;
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            playSound("press_button",1,false);
        }
        
        _bActive = !_bActive;
        _oButton.gotoAndStop("state_"+_bActive);

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_bActive);
        }
    };
    
    this.buttonDown = function(){
        _oButton.scaleX = 0.9;
        _oButton.scaleY = 0.9;

       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN]);
       }
    };
    
    this.buttonOver = function(evt){
        if(!s_bMobile){
            
            evt.target.cursor = "pointer";
        }  
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this._init(iXPos,iYPos,oSprite,bActive, oParentContainer);
}
//#endregion
//#region CInterface

function CInterface(oData={}){
    var _oAudioToggle;
    var _oContainer;
    var _oButFullscreen;
    var _oHelpPanel=null;
    var _bMobileInitialized;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _oParent = this;

    this._init = function(){
        _oContainer = new createjs.Container();
        _bMobileInitialized = false;
        s_oStage.addChild(_oContainer);

        
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _oAudioToggle = new CToggle(oSprite.width*0.5,oSprite.height,oSprite,s_bAudioActive, _oContainer);
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
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen");
            _pStartPosFullscreen = {x:10,y:0};
            _oButFullscreen = new CToggle(CANVAS_WIDTH - oSprite.width - 10,CANVAS_HEIGHT - 50,oSprite,s_bFullscreen,_oContainer);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreen,this);
            _oButFullscreen.setPosition(CANVAS_WIDTH - oSprite.width * 0.5,oSprite.height);
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

    s_oInterface = this;
    this._init();
    return this;
}
//#endregion
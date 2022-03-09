///Скрипт для игры в ДОМИНО
var dirs = {
    'common_css':'/js/games/common/css/',
    'common_js':'/js/games/common/js/',
    'main_js':'/js/games/domino/',
    'sprite_lib':'/js/games/domino/sprites/',
    'sounds_lib':'/js/games/domino/sounds/'
};
gameCenterApi.loadCss(dirs.common_css+'reset.css');
gameCenterApi.loadCss(dirs.common_css+"main.css");
gameCenterApi.loadCss(dirs.common_css+"orientation_utils.css");
gameCenterApi.loadCss(dirs.common_css+"ios_fullscreen.css");
gameCenterApi.loadCss(dirs.common_css + "gamecenter.css");
gameCenterApi.loadJs(dirs.common_js + "createjs.min.js",function(){
    gameCenterApi.loadJs(dirs.common_js+"screenfull.min.js",function(){
        gameCenterApi.loadJs(dirs.common_js + "platform.js",function(){
            gameCenterApi.loadJs(dirs.common_js + "ios_fullscreen.js",function(){
                gameCenterApi.loadJs(dirs.common_js + "howler.min.js",function(){
                    gameCenterApi.loadJs(dirs.common_js + "sprite_lib.js",function(){
                        gameCenterApi.loadJs(dirs.common_js + "ctl_utils.js",function(){
                            gameCenterApi.loadJs(dirs.common_js+"ui.kit.js",function(){
                                gameCenterApi.loadJs(dirs.main_js+"init.js",function(){
                                    $(document).ready(function(){
                                        oMain = new CMain({
                                            audio_enable_on_startup: false, //ENABLE/DISABLE AUDIO WHEN GAME STARTS
                                            fullscreen: true, //SET THIS TO FALSE IF YOU DON'T WANT TO SHOW FULLSCREEN BUTTON
                                            check_orientation: true,     //SET TO FALSE IF YOU DON'T WANT TO SHOW ORIENTATION ALERT ON MOBILE DEVICES
                                            multiplier_score: 100 //MANAGE THE FINAL SCORE RANGE;
                                        });
                                        
                                    })
                                });
                            });                            
                        });
                    });
                });
            });
        });
    });

});
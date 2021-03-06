window.MyGame.namespace('GameScreen', window.MyGame.Screen, (function (windowObj, game) {'use strict';
    var // logic
        thisObject = null,
        gameObject = game.gameObject,
        randomBg = '',
        randomBgIndex = 1,
        i = 0,
        levelScore = 0,
        score = game.getScore(),
        currentLevel = 0,
        millisecsElapsed = 0,
        secondsElapsed = 0,
        levelCompleteTimer = null,
        layout = null,
        levels = null,

        //visual
        levelCompleteGroup = null,
        menuButtonsGroup = null,
        statsPanelBg = null,
        menuPanelBg = null,
        gameBg = null,
        levelCompleteBg = null,
        menuPauseButton = null,
        levelsButton = null,
        nextButton = null,
        prevButton = null,
        replayButton = null,
        resumeButton = null,
        muteOnOffButton = null,
        optionsButton = null,
        levelText = null,
        numOfPicksText = null,
        levelTimeText = null,
        levelScoreText = null,
        scoreText = null,
        helperArrow1 = null,
        helperArrow2 = null,
        levelCompleteSound = null,

        showHideMenuPanelBg = function () {
            var gameTimeEvents = this;

            if (gameTimeEvents.paused) {
                gameTimeEvents.resume();
                game.enableShowArrows();
                game.enableMoveCards();
                menuPanelBg.visible = false;
                levelsButton.visible = false;
                replayButton.visible = false;
                resumeButton.visible = false;
                muteOnOffButton.visible = false;
                menuPauseButton.visible = true;
                optionsButton.visible = false;
                gameObject.world.bringToTop(cardGroup);
                cardGroup.forEach(game.Utility.enableDisplayObject);
            } else {
                gameTimeEvents.pause();
                game.disableMoveCards();
                game.disableShowArrows();
                menuPanelBg.visible = true;
                levelsButton.visible = true;
                levelsButton.x = 110;
                levelsButton.y = 410;
                replayButton.visible = true;
                replayButton.x = 330;
                replayButton.y = 410;
                resumeButton.visible = true;
                muteOnOffButton.visible = true;
                menuPauseButton.visible = false;
                optionsButton.visible = true;
                gameObject.world.bringToTop(menuButtonsGroup);
                cardGroup.forEach(game.Utility.disableDisplayObject);
            }
        },

        showLevelCompletePanel = function () {
            levelCompleteBg.visible = true;
            menuPauseButton.visible = false;
            levelScoreText.update();
            levelScoreText.visible = true;
            if (currentLevel < game.Const.LEVELS_COUNT - 1) {
                nextButton.visible = true;
            }
            if (currentLevel > 0) {
                prevButton.visible = true;
            }
            gameObject.world.bringToTop(levelCompleteGroup);
            gameObject.world.bringToTop(menuButtonsGroup);
            levelsButton.visible = true;
            levelsButton.x = 210;
            levelsButton.y = 395;
            replayButton.visible = true;
            replayButton.x = 375;
            replayButton.y = 400;
        },

        levelCompleteTimerFunction = function () {
            levelCompleteSound.play();
            if ((currentLevel + 1) === game.getGameProgress()) {
                game.incrementGameProgress();
            }
            showLevelCompletePanel();
            if (levelScore > game.getLevelPointsArray()[currentLevel]) {
                game.setLevelPoints(currentLevel, levelScore);
            }
            game.updateScore();
            if (currentLevel === 2 ||
                    currentLevel === 5 ||
                    currentLevel === 9 ||
                    currentLevel === 14 ||
                    currentLevel === 20) {
                thisObject.saveGame(windowObj);
                game.fadeOutGroup(levelCompleteGroup);
                game.fadeOutGroup(menuButtonsGroup);
                game.fadeOutGroup(cardGroup);
                game.fadeOutGroup(thisObject.screenObjects).onComplete.add(function () {
                    var tweenWmlObject = this;

                    tweenWmlObject.gameObject.state.start(tweenWmlObject.BreakPointScreen.KEY);
                    tweenWmlObject.gameObject.state.clearCurrentState();
                }, game);
            }
            levelCompleteTimer.stop(false);
        },

        timeHandler = function () {
            if (millisecsElapsed > 0 && millisecsElapsed % 1000 === 0) {
                secondsElapsed += 1;
                levelTimeText.update();
                if (cardGroup.countLiving() === 0) {
                    gameObject.time.events.stop(false);
                    levelCompleteTimer.start();
                    menuPauseButton.visible = false;
                }
                millisecsElapsed = 0;
                moveCardCounter += 1;
            } else {
                millisecsElapsed += game.Const.LOOP_DELAY;
            }
        };

    return {

        updateLevelScore: function () {
            var basicLevelScore = (numOfLevelCards * 100),
                timeScore = Math.ceil(millisecsElapsed / 10);

            levelScore = Math.ceil(basicLevelScore / numOfPicks);
            if (timeScore >= basicLevelScore) {
                levelScore = 0;
            } else {
                levelScore = (basicLevelScore + levelScore) - timeScore;
            }
            return levelScore;
        },

        muteOnOffSound: function () {
            var gameObject = this,
                gameObject = gameObject.gameObject;

            if (gameObject.sound.mute) {
                muteOnOffButton.loadTexture(game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'muteOn.png');
                gameObject.sound.mute = false;
            } else {
                muteOnOffButton.loadTexture(game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'muteOff.png');
                gameObject.sound.mute = true;
            }
        },

        init: function (params) {
            thisObject = this;
            thisObject.screenObjects = gameObject.add.group();

            levelCompleteTimer = new Phaser.Timer(gameObject, false);
            levelCompleteTimer.add(game.Const.TIMER_DELAY, levelCompleteTimerFunction);

            levelCompleteSound = gameObject.add.audio(game.SoundAssetKeys.LEVEL_COMPLETE_SOUND);
            cardGroup = gameObject.add.group();
            levelCompleteGroup = gameObject.add.group();
            menuButtonsGroup = gameObject.add.group();
            currentLevel = game.getCurrentLevel();
            levelScore = 0;
            levels = game.Cards.levels();
            layout = game.Cards.layout();
            secondsElapsed = 0;
            numOfAvailableLayouts = layout[numOfLevelCards.toString()].length - 1;

            gameObject.time.events.loop(game.Const.LOOP_DELAY, timeHandler);
            if (gameObject.time.events.paused) {
                gameObject.time.events.resume();
            } else {
                gameObject.time.events.start();
            }
            gameObject.time.add(cardTimer);
            gameObject.time.add(levelCompleteTimer);
            gameObject.time.add(hideArrowsTimer);
        },

        create: function () {
            var card = null,
                currentCardNumber = null,
                k = 0,
                reminder = 0;

            randomBgIndex = game.Utility.randomNumber(1, 4);
            switch(randomBgIndex) {
            case 1:
                randomBg = 'woodBg.jpg';
                break;
            case 2:
                randomBg = 'grass.jpg';
                break;
            case 3:
                randomBg = 'carpetGrass.jpg';
                break;
            case 4:
                randomBg = 'parket.jpg';
                break;
            }

            gameBg = gameObject.add.sprite(0, 0, game.ImageAssetKeys.GUIDES_AND_BACKGROUNDS_ATLAS, randomBg);
            thisObject.screenObjects.add(gameBg);

            levelCompleteBg = gameObject.add.sprite(90, 295, game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'levelComplete.png');
            levelCompleteBg.visible = false;
            levelCompleteGroup.add(levelCompleteBg);

            statsPanelBg = gameObject.add.sprite(0, 444, game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'statsPanel.png');
            thisObject.screenObjects.add(statsPanelBg);

            menuPanelBg = gameObject.add.sprite(110, 410, game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'menuPanel.png');
            menuPanelBg.visible = false;
            menuButtonsGroup.add(menuPanelBg);

            levelText = gameObject.add.text(10, 450, 'lvl ' + (currentLevel + 1), game.Utility.getTextStyle17());
            thisObject.screenObjects.add(levelText);

            levelTimeText = gameObject.add.text(460, 450, secondsElapsed.toString(), game.Utility.getTextStyle17());
            levelTimeText.update = function () {
                var levelTimeTextObject = this;

                levelTimeTextObject.setText(secondsElapsed.toString());
            };
            thisObject.screenObjects.add(levelTimeText);

            scoreText = gameObject.add.text(540, 450, 'score ' + game.getScore().toString(), game.Utility.getTextStyle17());
            scoreText.update = function () {
                var scoreTextObject = this;

                game.updateScore();
                scoreTextObject.setText(game.getScore().toString());
            }
            thisObject.screenObjects.add(scoreText);

            menuPauseButton = game.GameButton.GameButton(300, 444, game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, gameObject.time.events, 
                                                        showHideMenuPanelBg, null, null, null, null, null, null, 
                                                            'menuPauseButtonOver.png', 'menuPauseButton.png', 'menuPauseButton.png', 'menuPauseButtonOver.png');
            menuButtonsGroup.add(menuPauseButton);

            levelsButton = gameObject.add.button(220, 400, game.ImageAssetKeys.STANDARD_BUTTONS_SHEET, 
                                                function () {
                                                    replayButton.inputEnabled = false;
                                                    levelsButton.inputEnabled = false;
                                                    prevButton.inputEnabled = false;
                                                    nextButton.inputEnabled = false;
                                                    game.fadeOutGroup(levelCompleteGroup);
                                                    game.fadeOutGroup(menuButtonsGroup);
                                                    game.fadeOutGroup(cardGroup);
                                                    game.fadeOutGroup(thisObject.screenObjects).onComplete.add(function () {
                                                        var gameObject = this;

                                                        gameObject.gameObject.state.start(game.LevelsScreen.KEY);
                                                        gameObject.gameObject.state.clearCurrentState();
                                                    }, game);
                                                }, 
                                                levelsButton, 17, 16, 16, 17);
            levelsButton.setDownSound(game.SoundAssetKeys.CLICK_SOUND);
            levelsButton.visible = false;
            menuButtonsGroup.add(levelsButton);

            replayButton = game.GameButton.GameButton(330, 410, game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, game, 
                                thisObject.replayGame, null, null, null, null, null, null, 
                                    'replayButtonOver.png', 'replayButton.png', 'replayButton.png', 'replayButtonOver.png');
            replayButton.visible = false;
            menuButtonsGroup.add(replayButton);

            nextButton = gameObject.add.button(430, 395, game.ImageAssetKeys.GUIDE_BUTTONS_SHEET, 
                                                function () {
                                                    game.incrCurrentLevel();
                                                    replayButton.inputEnabled = false;
                                                    levelsButton.inputEnabled = false;
                                                    prevButton.inputEnabled = false;
                                                    nextButton.inputEnabled = false;
                                                    game.fadeOutGroup(levelCompleteGroup);
                                                    game.fadeOutGroup(menuButtonsGroup);
                                                    game.fadeOutGroup(cardGroup);
                                                    game.fadeOutGroup(thisObject.screenObjects).onComplete.add(function () {
                                                        var gameObject = this;

                                                        gameObject.gameObject.state.start(game.GameScreen.KEY);
                                                        gameObject.gameObject.state.clearCurrentState();
                                                    }, game);
                                                }, 
                                                nextButton, 7, 6, 6, 7);
            nextButton.setDownSound(game.SoundAssetKeys.CLICK_SOUND);
            nextButton.visible = false;
            levelCompleteGroup.add(nextButton);

            prevButton = gameObject.add.button(105, 395, game.ImageAssetKeys.GUIDE_BUTTONS_SHEET, 
                                                function () {
                                                    game.decrCurrentLevel();
                                                    replayButton.inputEnabled = false;
                                                    levelsButton.inputEnabled = false;
                                                    prevButton.inputEnabled = false;
                                                    nextButton.inputEnabled = false;
                                                    game.fadeOutGroup(levelCompleteGroup);
                                                    game.fadeOutGroup(menuButtonsGroup);
                                                    game.fadeOutGroup(cardGroup);
                                                    game.fadeOutGroup(thisObject.screenObjects).onComplete.add(function () {
                                                        var gameObject = this;

                                                        gameObject.gameObject.state.start(game.GameScreen.KEY);
                                                        gameObject.gameObject.state.clearCurrentState();
                                                    }, game);
                                                }, 
                                                prevButton, 5, 4, 4, 5);
            prevButton.setDownSound(game.SoundAssetKeys.CLICK_SOUND);
            prevButton.visible = false;
            levelCompleteGroup.add(prevButton);

            resumeButton = game.GameButton.GameButton(245, 447, game.ImageAssetKeys.STANDARD_BUTTONS_SHEET, gameObject.time.events, 
                                showHideMenuPanelBg, null, null, null, null, null, null, 19, 18, 18, 19);
            resumeButton.visible = false;
            menuButtonsGroup.add(resumeButton);

            muteOnOffButton = gameObject.add.sprite(270, 405, game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'muteOff.png');
            muteOnOffButton.inputEnabled = true;
            muteOnOffButton.visible = false;
            muteOnOffButton.events.onInputDown.add(thisObject.muteOnOffSound, game);
            menuButtonsGroup.add(muteOnOffButton);

            if (gameObject.sound.mute) {
                muteOnOffButton.loadTexture(game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'muteOff.png');
            } else {
                muteOnOffButton.loadTexture(game.ImageAssetKeys.OTHER_GUI_ASSETS_ATLAS, 'muteOn.png');
            }

            levelScoreText = gameObject.add.text(220, 305, 'Level score: 0', game.Utility.getTextStyle17());
            levelScoreText.update = function () {
                var levelScoreTextObject = this;

                levelScoreTextObject.setText('Level score: ' + levelScore.toString());
            }
            levelScoreText.visible = false;
            levelCompleteGroup.add(levelScoreText);

            optionsButton = gameObject.add.button(380, 410, game.ImageAssetKeys.STANDARD_BUTTONS_SHEET, 
                                                function () {
                                                    optionsButton.inputEnabled = false;
                                                    replayButton.inputEnabled = false;
                                                    levelsButton.inputEnabled = false;
                                                    game.fadeOutGroup(levelCompleteGroup);
                                                    game.fadeOutGroup(menuButtonsGroup);
                                                    game.fadeOutGroup(cardGroup);
                                                    game.fadeOutGroup(thisObject.screenObjects).onComplete.add(function () {
                                                        var gameObject = this;

                                                        gameObject.gameObject.state.start(game.OptionsScreen.KEY);
                                                        gameObject.gameObject.state.clearCurrentState();
                                                    }, game);
                                                }, 
                                                optionsButton, 9, 8, 8, 9);
            optionsButton.setDownSound(game.SoundAssetKeys.CLICK_SOUND);
            optionsButton.visible = false;
            menuButtonsGroup.add(optionsButton);

            game.fadeInGroup(levelCompleteGroup);
            game.fadeInGroup(menuButtonsGroup);
            game.fadeInGroup(cardGroup);
            game.fadeInGroup(thisObject.screenObjects);
        },

        replayGame: function () {
            var gameObject = this;

            replayButton.inputEnabled = false;
            levelsButton.inputEnabled = false;
            prevButton.inputEnabled = false;
            nextButton.inputEnabled = false;
            gameObject.fadeOutGroup(menuButtonsGroup);
            gameObject.fadeOutGroup(cardGroup);
            gameObject.fadeOutGroup(levelCompleteGroup);
            gameObject.fadeOutGroup(thisObject.screenObjects).onComplete.add(function () {
                var tweenWmlObject = this;

                tweenWmlObject.gameObject.state.start(tweenWmlObject.GameScreen.KEY);
                tweenWmlObject.gameObject.state.clearCurrentState();
            }, gameObject); 
        },

        saveGame: function (windowObject) {
            windowObject.localStorage.setItem('score', windowObject.WML.getScore());
            windowObject.localStorage.setItem('gameProgress', windowObject.WML.getGameProgress());
            windowObject.localStorage.setItem('levelPointsArray', windowObject.WML.getLevelPointsArray());
        },

        shutdown: function () {
            i = 0;
            levels = null;
            layout = null;
            numOfAvailableLayouts = 0;
            secondsElapsed = 0;
        }
    };
    }(window, window.MyGame)));

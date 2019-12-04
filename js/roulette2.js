
(function($) {
    let Roulette = function(options) {
        let defaultSettings = {
            maxPlayCount : null, // x >= 0 or null
            speed : 10, // x > 0
            stopImageNumber : null, // x >= 0 or null or -1
            rollCount : 3, // x >= 0
            duration : 3, //(x second)
            stopCallback : function() {
            },
            startCallback : function() {
            },
            slowDownCallback : function() {
            }
        }
        let defaultProperty = {
            playCount : 0,
            $rouletteTarget : null,
            imageCount : null,
            $images : null,
            originalStopImageNumber : null,
            totalHeight : null,
            topPosition : 0,

            maxDistance : null,
            slowDownStartDistance : null,

            isRunUp : true,
            isSlowdown : false,
            isStop : false,

            distance : 0,
            runUpDistance : null,
            slowdownTimer : null,
            isIE : navigator.userAgent.toLowerCase().indexOf('msie') > -1 // TODO IE
        };
        let p = $.extend({}, defaultSettings, options, defaultProperty);

        let reset = function() {
            p.maxDistance = defaultProperty.maxDistance;
            p.slowDownStartDistance = defaultProperty.slowDownStartDistance;
            p.distance = defaultProperty.distance;
            p.isRunUp = defaultProperty.isRunUp;
            p.isSlowdown = defaultProperty.isSlowdown;
            p.isStop = defaultProperty.isStop;
            p.topPosition = defaultProperty.topPosition;

            clearTimeout(p.slowDownTimer);
        }

        let slowDownSetup = function() {
            if(p.isSlowdown){
                return;
            }
            p.slowDownCallback();
            p.isSlowdown = true;
            p.slowDownStartDistance = p.distance;
            p.maxDistance = p.distance + (2*p.totalHeight);
            p.maxDistance += p.imageHeight - p.topPosition % p.imageHeight;
            if (p.stopImageNumber != null) {
                p.maxDistance += (p.totalHeight - (p.maxDistance % p.totalHeight) + (p.stopImageNumber * p.imageHeight))
                    % p.totalHeight;
            }
        }

        let roll = function() {
            let speed_ = p.speed;

            if (p.isRunUp) {
                if (p.distance <= p.runUpDistance) {
                    let rate_ = ~~((p.distance / p.runUpDistance) * p.speed);
                    speed_ = rate_ + 1;
                } else {
                    p.isRunUp = false;
                }

            } else if (p.isSlowdown) {
                let rate_ = ~~(((p.maxDistance - p.distance) / (p.maxDistance - p.slowDownStartDistance)) * (p.speed));
                speed_ = rate_ + 1;
            }

            if (p.maxDistance && p.distance >= p.maxDistance) {
                p.isStop = true;
                reset();
                p.stopCallback(p.$rouletteTarget.find('img').eq(p.stopImageNumber));
                return;
            }
            p.distance += speed_;
            p.topPosition += speed_;
            if (p.topPosition >= p.totalHeight) {
                p.topPosition = p.topPosition - p.totalHeight;
            }
            // TODO IE
            if (p.isIE) {
                p.$rouletteTarget.css('top', '-' + p.topPosition + 'px');
            } else {
                // TODO more smooth roll
                p.$rouletteTarget.css('transform', 'translate(0px, -' + p.topPosition + 'px)');
            }
            setTimeout(roll, 1);
        }

        let init = function($roulette) {
            $roulette.css({ 'overflow' : 'hidden' });
            defaultProperty.originalStopImageNumber = p.stopImageNumber;

            if (!p.$images) {
                p.$images = $roulette.find('img').remove();
                p.imageCount = p.$images.length;
                p.$images.eq(0).bind('load',function(){
                    p.imageHeight = $(this).height();
                    $roulette.css({ 'height' : (p.imageHeight + 'px') });
                    p.totalHeight = p.imageCount * p.imageHeight;
                    p.runUpDistance = 2 * p.imageHeight;
                }).each(function(){
                    if (this.complete || this.complete === undefined){
                        let src = this.src;
                        // set BLANK image
                        this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                        this.src = src;
                    }
                });
            }
            $roulette.find('div').remove();
            p.$images.css({
                'display' : 'block'
            });
            p.$rouletteTarget = $('<div>').css({
                'position' : 'relative',
                'top' : '0'
            }).attr('class',"roulette-inner");
            $roulette.append(p.$rouletteTarget);
            p.$rouletteTarget.append(p.$images);
            p.$rouletteTarget.append(p.$images.eq(0).clone());
            $roulette.show();
        }
        let start = function() {
            p.playCount++;
            // if (p.maxPlayCount && p.playCount > p.maxPlayCount) {
            //     return;
            // }
            p.stopImageNumber = values[0];
            values.shift();
            // p.stopImageNumber = $.isNumeric(defaultProperty.originalStopImageNumber) && Number(defaultProperty.originalStopImageNumber) >= 0 ?
            //     Number(defaultProperty.originalStopImageNumber) : Math.floor(Math.random() * p.imageCount);
            p.startCallback();
            roll();
            p.slowDownTimer = setTimeout(function(){
                slowDownSetup();
            }, p.duration * 1000);
        }

        let stop = function(option) {
            if (!p.isSlowdown) {
                if (option) {
                    let stopImageNumber = Number(option.stopImageNumber);
                    if (0 <= stopImageNumber && stopImageNumber <= (p.imageCount - 1)) {
                        p.stopImageNumber = option.stopImageNumber;
                    }
                }
                slowDownSetup();
            }
            setTimeout(showInfo,5000);
        }
        let option = function(options) {
            p = $.extend(p, options);
            p.speed = Number(p.speed);
            p.duration = Number(p.duration);
            p.duration = p.duration > 1 ? p.duration - 1 : 1;
            defaultProperty.originalStopImageNumber = options.stopImageNumber;
        }

        let ret = {
            start : start,
            stop : stop,
            init : init,
            option : option
        }
        return ret;
    }

    let pluginName = 'roulette';
    $.fn[pluginName] = function(method, options) {
        return this.each(function() {
            let self = $(this);
            let roulette = self.data('plugin_' + pluginName);
            if (roulette) {
                if (roulette[method]) {
                    roulette[method](options);
                } else {
                    console && console.error('Method ' + method + ' does not exist on jQuery.roulette');
                }
            } else {
                roulette = new Roulette(method);
                roulette.init(self, method,options);
                $(this).data('plugin_' + pluginName, roulette);
            }
        });
    };
})(jQuery);
